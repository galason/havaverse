import React from 'react';
import { directorApi } from '../services/directorApi';
import { continuityApi } from '../services/continuityApi';
import { filmStateApi } from '../services/filmStateApi';
import { projectsApi } from '../services/projectsApi';
// Registers publishing's project-switch guard and resumes any interrupted job.
import '../services/publishingApi';
import { useApp } from './AppContext';
import type {
  FilmStateVersion,
  ProductionRule,
  RuleViolation,
  Sequence,
  StaleShot } from
'../types/filmState';
import type { ContinuityCheck, ContinuityStatus, LockAction, LockedAsset } from '../types/continuity';
import type {
  AgentRun,
  Character,
  DirectorPlan,
  FilmProject,
  GenerationJob,
  Location,
  RightsIssue,
  Scene,
  Shot,
  StoryBibleEntry } from
'../types/director';

interface DirectorState {
  project: FilmProject | null;
  bible: StoryBibleEntry[];
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
  shots: Shot[];
  rights: RightsIssue[];
  jobs: GenerationJob[];
  runs: AgentRun[];
  status: 'loading' | 'ready' | 'error';
  reload: () => Promise<void>;

  /** Command engine */
  plan: DirectorPlan | null;
  interpreting: boolean;
  commandError: string;
  interpret: (command: string) => Promise<void>;
  dismissPlan: () => void;
  applyPlan: () => Promise<void>;
  applying: boolean;

  /** Production actions */
  generateShot: (shotId: string) => Promise<void>;
  approveVersion: (shotId: string, versionId: string) => Promise<void>;
  restoreVersion: (shotId: string, versionId: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  setSceneApproval: (sceneId: string, approved: boolean) => Promise<void>;
  relockCharacter: (characterId: string) => Promise<void>;
  resolveRights: (issueId: string) => Promise<void>;
  setMode: (mode: FilmProject['mode']) => void;
  pending: string | null;

  /** Continuity layer (Phase 1) */
  assets: LockedAsset[];
  checks: ContinuityCheck[];
  audit: LockAction[];
  continuity: ContinuityStatus | null;
  lockAsset: (assetId: string) => Promise<boolean>;
  unlockAsset: (assetId: string, reason: string) => Promise<boolean>;
  createAssetVersion: (assetId: string, description: string, reason: string) => Promise<boolean>;
  recheckAsset: (assetId: string) => Promise<void>;
  recheckAll: () => Promise<void>;

  /** Persistent film state (P0) */
  stateVersions: FilmStateVersion[];
  sequences: Sequence[];
  rules: ProductionRule[];
  violations: RuleViolation[];
  stale: StaleShot[];
  rejectVersion: (shotId: string) => Promise<void>;
  allowException: (ruleId: string, shotId: string, reason: string) => Promise<boolean>;
  editRule: (ruleId: string, patch: {text?: string;status?: ProductionRule['status'];}, reason: string) => Promise<boolean>;
}

const DirectorContext = React.createContext<DirectorState | null>(null);

export function DirectorProvider({ children }: {children: React.ReactNode;}) {
  const { showToast } = useApp();

  const [project, setProject] = React.useState<FilmProject | null>(null);
  const [bible, setBible] = React.useState<StoryBibleEntry[]>([]);
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [shots, setShots] = React.useState<Shot[]>([]);
  const [rights, setRights] = React.useState<RightsIssue[]>([]);
  const [jobs, setJobs] = React.useState<GenerationJob[]>([]);
  const [runs, setRuns] = React.useState<AgentRun[]>([]);
  const [status, setStatus] = React.useState<DirectorState['status']>('loading');

  const [plan, setPlan] = React.useState<DirectorPlan | null>(null);
  const [interpreting, setInterpreting] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [commandError, setCommandError] = React.useState('');
  const [pending, setPending] = React.useState<string | null>(null);
  const [assets, setAssets] = React.useState<LockedAsset[]>([]);
  const [checks, setChecks] = React.useState<ContinuityCheck[]>([]);
  const [audit, setAudit] = React.useState<LockAction[]>([]);
  const [continuity, setContinuity] = React.useState<ContinuityStatus | null>(null);
  const [stateVersions, setStateVersions] = React.useState<FilmStateVersion[]>([]);
  const [sequences, setSequences] = React.useState<Sequence[]>([]);
  const [rules, setRules] = React.useState<ProductionRule[]>([]);
  const [violations, setViolations] = React.useState<RuleViolation[]>([]);
  const [stale, setStale] = React.useState<StaleShot[]>([]);

  const syncFilmState = React.useCallback(() => {
    setStateVersions(filmStateApi.getVersions());
    setSequences(filmStateApi.getSequences());
    setRules(filmStateApi.getRules());
    setViolations(filmStateApi.getViolations());
    setStale(filmStateApi.getStaleShots());
  }, []);

  const syncContinuity = React.useCallback(async () => {
    setAssets(continuityApi.getAssets());
    setChecks(continuityApi.getChecks());
    setAudit(continuityApi.getAudit());
    setContinuity(continuityApi.getStatus());
    const c = await directorApi.getCharacters();
    if (c.ok) setCharacters(c.data);
    const l = await directorApi.getLocations();
    if (l.ok) setLocations(l.data);
  }, []);

  const syncLive = React.useCallback(async () => {
    const [s, r] = await Promise.all([directorApi.getShots(), directorApi.getRights()]);
    if (s.ok) setShots(s.data);
    if (r.ok) setRights(r.data);
    setJobs(directorApi.getJobs());
    setRuns(directorApi.getRuns());
    setAssets(continuityApi.getAssets());
    setChecks(continuityApi.getChecks());
    setAudit(continuityApi.getAudit());
    setContinuity(continuityApi.getStatus());
    syncFilmState();
    const p = await directorApi.getProject();
    if (p.ok) setProject(p.data);
  }, [syncFilmState]);

  const reload = React.useCallback(async () => {
    setStatus('loading');
    // Opens whichever project was last open on this device before reading it.
    projectsApi.hydrate();
    setPlan(null);
    const [p, b, c, l, sc, sh, ri] = await Promise.all([
    directorApi.getProject(),
    directorApi.getBible(),
    directorApi.getCharacters(),
    directorApi.getLocations(),
    directorApi.getScenes(),
    directorApi.getShots(),
    directorApi.getRights()]
    );
    if (!p.ok || !sh.ok) {
      setStatus('error');
      return;
    }
    setProject(p.data);
    if (b.ok) setBible(b.data);
    if (c.ok) setCharacters(c.data);
    if (l.ok) setLocations(l.data);
    if (sc.ok) setScenes(sc.data);
    setShots(sh.data);
    if (ri.ok) setRights(ri.data);
    setJobs(directorApi.getJobs());
    setAssets(continuityApi.getAssets());
    setChecks(continuityApi.getChecks());
    setAudit(continuityApi.getAudit());
    setContinuity(continuityApi.getStatus());
    syncFilmState();
    setRuns(directorApi.getRuns());
    setStatus('ready');
  }, [syncFilmState]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  // Autosave: every change to the open project's production state is written
  // to its working copy shortly after it settles.
  React.useEffect(() => {
    if (status !== 'ready') return;
    const id = window.setTimeout(() => projectsApi.autosave(), 700);
    return () => window.clearTimeout(id);
  }, [status, project, bible, scenes, shots, rights, jobs, assets, stateVersions, rules]);

  // Job runner. In production this is a socket; here it polls the engine.
  const active = jobs.some((j) =>
  ['QUEUED', 'PREPARING', 'GENERATING', 'PROCESSING', 'QUALITY_CHECK', 'RETRYING'].includes(
    j.status
  )
  );

  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      directorApi.tickJobs();
      syncLive();
    }, 1100);
    return () => window.clearInterval(id);
  }, [active, syncLive]);

  const value: DirectorState = {
    project,
    bible,
    characters,
    locations,
    scenes,
    shots,
    rights,
    jobs,
    runs,
    status,
    reload,
    plan,
    interpreting,
    commandError,
    applying,
    pending,
    assets,
    checks,
    audit,
    continuity,
    stateVersions,
    sequences,
    rules,
    violations,
    stale,

    async rejectVersion(shotId) {
      setPending(`reject:${shotId}`);
      const result = await directorApi.rejectVersion(shotId);
      setPending(null);
      showToast(
        !result.ok ?
        result.error :
        result.data.restored ?
        `Rejected — restored v${result.data.restored}` :
        'Rejected — the shot needs a new version'
      );
      await syncLive();
    },

    async allowException(ruleId, shotId, reason) {
      setPending(`except:${ruleId}:${shotId}`);
      const result = await filmStateApi.allowException(ruleId, shotId, reason);
      setPending(null);
      showToast(result.ok ? `Rule v${result.data.version} — exception recorded` : result.error);
      await syncLive();
      return result.ok;
    },

    async editRule(ruleId, patch, reason) {
      setPending(`rule:${ruleId}`);
      const result = await filmStateApi.editRule(ruleId, patch, reason);
      setPending(null);
      showToast(
        result.ok ?
        `Rule v${result.data.version}${result.data.status === 'suspended' ? ' — suspended' : ' saved'}` :
        result.error
      );
      await syncLive();
      return result.ok;
    },

    async lockAsset(assetId) {
      setPending(`lock:${assetId}`);
      const result = await continuityApi.lockAsset(assetId);
      setPending(null);
      showToast(result.ok ? `${result.data.name} v${result.data.version} locked` : result.error);
      await syncContinuity();
      setRuns(directorApi.getRuns());
      return result.ok;
    },

    async unlockAsset(assetId, reason) {
      setPending(`unlock:${assetId}`);
      const result = await continuityApi.unlockAsset(assetId, reason);
      setPending(null);
      showToast(result.ok ? `${result.data.name} temporarily unlocked` : result.error);
      await syncContinuity();
      setRuns(directorApi.getRuns());
      return result.ok;
    },

    async createAssetVersion(assetId, description, reason) {
      setPending(`version:${assetId}`);
      const result = await continuityApi.createAssetVersion(assetId, { description, reason });
      setPending(null);
      showToast(
        result.ok ? `v${result.data.version} created as draft — lock it to apply` : result.error
      );
      await syncContinuity();
      setRuns(directorApi.getRuns());
      return result.ok;
    },

    async recheckAsset(assetId) {
      setPending(`check:${assetId}`);
      const result = await continuityApi.runContinuityCheck(assetId, 'manual');
      setPending(null);
      if (!result.ok) showToast(result.error);
      await syncContinuity();
      setRuns(directorApi.getRuns());
    },

    async recheckAll() {
      setPending('check:all');
      const result = await continuityApi.runAllChecks();
      setPending(null);
      if (!result.ok) showToast(result.error);
      await syncContinuity();
      setRuns(directorApi.getRuns());
    },

    async interpret(command) {
      setInterpreting(true);
      setCommandError('');
      setPlan(null);
      const result = await directorApi.interpret(command);
      setInterpreting(false);
      if (result.ok) setPlan(result.data);else
      setCommandError(result.error);
      setRuns(directorApi.getRuns());
    },

    dismissPlan: () => setPlan(null),

    async applyPlan() {
      if (!plan) return;
      setApplying(true);
      const result = await directorApi.applyPlan(plan.id);
      setApplying(false);
      if (!result.ok) {
        setCommandError(result.error);
        return;
      }
      setPlan(null);
      showToast(
        result.data.length === 0 ?
        'Continuity re-verified — results are in Agent activity' :
        `${result.data.length} ${result.data.length === 1 ? 'job' : 'jobs'} queued`
      );
      await syncLive();
    },

    async generateShot(shotId) {
      setPending(`gen:${shotId}`);
      const result = await directorApi.generateShot(shotId);
      setPending(null);
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      showToast('Generation queued');
      await syncLive();
    },

    async approveVersion(shotId, versionId) {
      setPending(`approve:${versionId}`);
      const result = await directorApi.approveVersion(shotId, versionId);
      setPending(null);
      showToast(result.ok ? 'Shot approved' : result.error);
      await syncLive();
    },

    async restoreVersion(shotId, versionId) {
      setPending(`restore:${versionId}`);
      const result = await directorApi.restoreVersion(shotId, versionId);
      setPending(null);
      showToast(result.ok ? 'Version restored' : result.error);
      await syncLive();
    },

    async cancelJob(jobId) {
      const result = await directorApi.cancelJob(jobId);
      showToast(result.ok ? 'Job cancelled' : result.error);
      await syncLive();
    },

    async retryJob(jobId) {
      const result = await directorApi.retryJob(jobId);
      if (!result.ok) showToast(result.error);
      await syncLive();
    },

    async setSceneApproval(sceneId, approved) {
      setPending(`scene:${sceneId}`);
      const result = await directorApi.setSceneApproval(sceneId, approved);
      setPending(null);
      if (result.ok) {
        const sc = await directorApi.getScenes();
        if (sc.ok) setScenes(sc.data);
        setRuns(directorApi.getRuns());
      } else showToast(result.error);
    },

    async relockCharacter(characterId) {
      setPending(`relock:${characterId}`);
      const result = await directorApi.relockCharacter(characterId);
      setPending(null);
      if (result.ok) {
        await syncContinuity();
        setRuns(directorApi.getRuns());
        showToast('Reference package re-locked');
      } else showToast(result.error);
    },

    async resolveRights(issueId) {
      setPending(`rights:${issueId}`);
      const result = await directorApi.resolveRightsIssue(issueId);
      setPending(null);
      showToast(result.ok ? 'Rights issue resolved' : result.error);
      await syncLive();
    },

    setMode(mode) {
      directorApi.setMode(mode);
      setProject((prev) => prev ? { ...prev, mode } : prev);
    }
  };

  return <DirectorContext.Provider value={value}>{children}</DirectorContext.Provider>;
}

export function useDirector() {
  const ctx = React.useContext(DirectorContext);
  if (!ctx) throw new Error('useDirector must be used inside DirectorProvider');
  return ctx;
}

/** Kobo → naira, for production accounting display. */
export function formatNaira(kobo: number): string {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`;
}