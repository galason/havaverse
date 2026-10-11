import React from 'react';
import { projectsApi } from '../services/projectsApi';
import { useDirector } from '../contexts/DirectorContext';
import { useApp } from '../contexts/AppContext';
import type { NewProjectForm, StudioProjectSummary } from '../types/studioProject';

/**
 * Project workspace actions. Every action goes through the projects service;
 * whenever the open project changes, the Director re-reads its state so every
 * Studio screen follows.
 */
export function useStudioProjects() {
  const director = useDirector();
  const { showToast } = useApp();
  const [projects, setProjects] = React.useState<StudioProjectSummary[] | null>(null);
  const [error, setError] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    const result = await projectsApi.listProjects();
    if (result.ok) setProjects(result.data);else
    setError(true);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const run = async <T,>(
  key: string,
  action: () => Promise<{ok: true;data: T;} | {ok: false;error: string;}>,
  success: (data: T) => string,
  reopen = false)
  : Promise<T | null> => {
    setBusy(key);
    const result = await action();
    setBusy(null);
    if (!result.ok) {
      showToast(result.error);
      return null;
    }
    if (reopen) await director.reload();
    await load();
    showToast(success(result.data));
    return result.data;
  };

  return {
    projects,
    error,
    busy,
    reload: load,
    activeId: director.project?.id ?? projectsApi.activeId(),
    create: (form: NewProjectForm) =>
    run('create', () => projectsApi.createProject(form), (p) => `${p.title} created — it’s open in Studio`, true),
    open: (id: string) =>
    run(`open:${id}`, () => projectsApi.switchProject(id), (p) => `Opened ${p.title}`, true),
    duplicate: (id: string) =>
    run(`duplicate:${id}`, () => projectsApi.duplicateProject(id), (p) => `${p.title} created`),
    archive: (id: string) =>
    run(`archive:${id}`, () => projectsApi.archiveProject(id), (p) => `${p.title} archived — restore it any time`),
    unarchive: (id: string) =>
    run(`unarchive:${id}`, () => projectsApi.unarchiveProject(id), (p) => `${p.title} restored`)
  };
}