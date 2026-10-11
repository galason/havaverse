import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, FolderIcon, PlusIcon } from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { useDirector } from '../../contexts/DirectorContext';
import { useApp } from '../../contexts/AppContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { StudioProjectSummary } from '../../types/studioProject';

/** The Studio title doubles as the way between projects. */
export function ProjectSwitcher({ title }: {title: string;}) {
  const { project, reload } = useDirector();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [projects, setProjects] = React.useState<StudioProjectSummary[]>([]);
  const [switching, setSwitching] = React.useState<string | null>(null);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(open, close);

  React.useEffect(() => {
    if (!open) return;
    projectsApi.autosave();
    setProjects(projectsApi.listSync().filter((p) => p.status === 'active'));
  }, [open]);

  async function choose(id: string) {
    if (id === project?.id) {
      setOpen(false);
      return;
    }
    setSwitching(id);
    const result = await projectsApi.switchProject(id);
    setSwitching(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setOpen(false);
    await reload();
    showToast(`Opened ${result.data.title}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group mt-1 flex max-w-full items-center gap-2 rounded-lg text-left">
        
        <h1 className="truncate text-2xl font-bold tracking-tight text-white">{title}</h1>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-mist-400 transition-transform duration-150 ease-entrance group-hover:text-white ${open ? 'rotate-180' : ''}`}
          aria-hidden="true" />
        
        <span className="sr-only">Switch project</span>
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-2xl">
          
            <ul role="listbox" aria-label="Projects" className="max-h-80 overflow-y-auto p-1.5">
              {projects.map((p) => {
              const current = p.id === project?.id;
              return (
                <li key={p.id} role="option" aria-selected={current}>
                    <button
                    type="button"
                    disabled={switching !== null}
                    onClick={() => choose(p.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ease-entrance hover:bg-white/5 disabled:opacity-60">
                    
                      <img src={p.poster} alt="" className="h-9 w-14 shrink-0 rounded-md object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{p.title}</span>
                        <span className="block truncate text-[11px] text-mist-400">
                          {switching === p.id ?
                        'Opening…' :
                        `${p.stage.replace(/_/g, ' ').toLowerCase()} · ${p.counts.shots} shots`}
                        </span>
                      </span>
                      {current && <CheckIcon className="h-4 w-4 shrink-0 text-brand-indigo" aria-hidden="true" />}
                    </button>
                  </li>);

            })}
            </ul>
            <div className="flex border-t border-white/5 p-1.5">
              <button
              type="button"
              onClick={() => navigate('/studio/projects?new=1')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-mist-200 hover:bg-white/5 hover:text-white">
              
                <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                New project
              </button>
              <Link
              to="/studio/projects"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-mist-200 hover:bg-white/5 hover:text-white">
              
                <FolderIcon className="h-3.5 w-3.5" aria-hidden="true" />
                All projects
              </Link>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}