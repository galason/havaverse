import React from 'react';
import { BookmarkIcon, HistoryIcon } from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { useDirector } from '../../contexts/DirectorContext';
import { useApp } from '../../contexts/AppContext';
import { relativeTime } from '../../utils/time';
import type { ProjectComparisonRow, ProjectVersion } from '../../types/studioProject';

const kindLabel: Record<ProjectVersion['kind'], string> = {
  named: 'Saved',
  'restore-point': 'Restore point',
  published: 'Published'
};

/**
 * Named snapshots of the whole production. Work autosaves continuously;
 * versions are the moments worth returning to. Restoring never destroys the
 * present — it is kept as a restore point first.
 */
export function VersionsPanel() {
  const { project, reload } = useDirector();
  const { showToast } = useApp();
  const [versions, setVersions] = React.useState<ProjectVersion[] | null>(null);
  const [error, setError] = React.useState(false);
  const [naming, setNaming] = React.useState(false);
  const [name, setName] = React.useState('');
  const [working, setWorking] = React.useState<string | null>(null);
  const [comparing, setComparing] = React.useState<{id: string;rows: ProjectComparisonRow[];} | null>(null);
  const [confirm, setConfirm] = React.useState<string | null>(null);
  const inputId = React.useId();
  const projectId = project?.id;

  const load = React.useCallback(async () => {
    if (!projectId) return;
    setError(false);
    const result = await projectsApi.listVersions(projectId);
    if (result.ok) setVersions(result.data);else
    setError(true);
  }, [projectId]);

  React.useEffect(() => {
    setVersions(null);
    setComparing(null);
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setWorking('save');
    const result = await projectsApi.saveVersion(name);
    setWorking(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setName('');
    setNaming(false);
    await load();
    showToast(`Saved v${result.data.n} · ${result.data.name}`);
  }

  async function compare(id: string) {
    if (comparing?.id === id) {
      setComparing(null);
      return;
    }
    const result = await projectsApi.compareVersion(id);
    if (result.ok) setComparing({ id, rows: result.data });else
    showToast(result.error);
  }

  async function restore(version: ProjectVersion) {
    setWorking(version.id);
    const result = await projectsApi.restoreVersion(version.id);
    setWorking(null);
    setConfirm(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    await reload();
    await load();
    showToast(`Restored v${version.n} — your previous state is kept as a restore point`);
  }

  return (
    <section aria-labelledby="versions-h" className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-4 w-4 text-mist-300" aria-hidden="true" />
        <h2 id="versions-h" className="text-sm font-bold text-white">
          Versions
        </h2>
        {!naming &&
        <button
          type="button"
          onClick={() => setNaming(true)}
          className="ml-auto flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-mist-200 hover:text-white">
          
            <BookmarkIcon className="h-3 w-3" aria-hidden="true" />
            Save version
          </button>
        }
      </div>
      <p className="mt-1 text-[11px] text-mist-400">Changes autosave. Save a version to mark a moment worth returning to.</p>

      {naming &&
      <form onSubmit={save} className="mt-3 flex gap-2">
          <label htmlFor={inputId} className="sr-only">
            Version name
          </label>
          <input
          id={inputId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rough cut for Chidi"
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-850 px-2.5 py-1.5 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo/60 focus:outline-none" />
        
          <button
          type="submit"
          disabled={working === 'save' || name.trim().length < 2}
          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-950 disabled:opacity-50">
          
            {working === 'save' ? 'Saving…' : 'Save'}
          </button>
          <button
          type="button"
          onClick={() => setNaming(false)}
          className="px-1 text-[11px] font-semibold text-mist-400 hover:text-white">
          
            Cancel
          </button>
        </form>
      }

      {error ?
      <p className="mt-3 text-xs text-mist-300">
          Versions couldn’t be loaded.{' '}
          <button type="button" onClick={load} className="font-semibold text-white underline">
            Retry
          </button>
        </p> :
      versions === null ?
      <div className="mt-3 space-y-2" aria-label="Loading versions">
          {[0, 1].map((i) =>
        <div key={i} className="h-10 animate-pulse rounded-lg bg-ink-850" />
        )}
        </div> :
      versions.length === 0 ?
      <p className="mt-3 text-xs text-mist-400">No saved versions yet.</p> :

      <ul className="mt-3 divide-y divide-white/5">
          {versions.slice(0, 6).map((v) =>
        <li key={v.id} className="py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold tabular-nums text-mist-400">v{v.n}</span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">{v.name}</span>
                <span className="shrink-0 text-[10px] text-mist-400">{relativeTime(v.createdAt)}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-[10px]">
                <span className={v.kind === 'published' ? 'font-semibold text-status-success-fg' : 'text-mist-400'}>
                  {kindLabel[v.kind]} · {v.counts.approvedShots}/{v.counts.shots} approved
                </span>
                <button type="button" onClick={() => compare(v.id)} className="font-semibold text-mist-300 hover:text-white">
                  {comparing?.id === v.id ? 'Hide' : 'Compare'}
                </button>
                {confirm === v.id ?
            <span className="flex gap-2">
                    <button
                type="button"
                disabled={working !== null}
                onClick={() => restore(v)}
                className="font-semibold text-brand-amber hover:underline">
                
                      {working === v.id ? 'Restoring…' : 'Confirm restore'}
                    </button>
                    <button type="button" onClick={() => setConfirm(null)} className="text-mist-400 hover:text-white">
                      Cancel
                    </button>
                  </span> :

            <button type="button" onClick={() => setConfirm(v.id)} className="font-semibold text-mist-300 hover:text-white">
                    Restore
                  </button>
            }
              </div>
              {comparing?.id === v.id &&
          <table className="mt-2 w-full text-[10px]">
                  <thead>
                    <tr className="text-mist-400">
                      <th className="py-0.5 text-left font-normal">Since v{v.n}</th>
                      <th className="py-0.5 text-right font-normal">Then</th>
                      <th className="py-0.5 text-right font-normal">Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparing.rows.map((row) =>
              <tr key={row.label} className="border-t border-white/5">
                        <td className="py-0.5 text-mist-300">{row.label}</td>
                        <td className="py-0.5 text-right tabular-nums text-mist-300">{row.then}</td>
                        <td className={`py-0.5 text-right tabular-nums ${row.now !== row.then ? 'font-semibold text-white' : 'text-mist-300'}`}>
                          {row.now}
                        </td>
                      </tr>
              )}
                  </tbody>
                </table>
          }
            </li>
        )}
        </ul>
      }
    </section>);

}