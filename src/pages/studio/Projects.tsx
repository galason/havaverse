import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArchiveIcon, ArrowLeftIcon, CopyIcon, FolderOpenIcon, PlusIcon, RotateCcwIcon } from 'lucide-react';
import { useStudioProjects } from '../../hooks/useStudioProjects';
import { NewProjectForm } from '../../components/studio/NewProjectForm';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../../components/community/StateBlocks';
import { relativeTime } from '../../utils/time';
import type { StudioProjectSummary } from '../../types/studioProject';

const stageLabel = (stage: string) => stage.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

export function StudioProjects() {
  const { projects, error, busy, reload, activeId, create, open, duplicate, archive, unarchive } = useStudioProjects();
  const [params, setParams] = useSearchParams();
  const creating = params.get('new') === '1';
  const [showArchived, setShowArchived] = React.useState(false);
  const navigate = useNavigate();

  const active = (projects ?? []).filter((p) => p.status === 'active');
  const archived = (projects ?? []).filter((p) => p.status === 'archived');

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <Link
        to="/studio"
        className="inline-flex items-center gap-1 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Studio
      </Link>

      <header className="mt-3 flex flex-wrap items-end gap-3 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your projects</h1>
          <p className="mt-0.5 text-xs text-mist-400">
            One project is open in the Director at a time. Everything else is saved exactly where you left it.
          </p>
        </div>
        {!creating &&
        <button
          type="button"
          onClick={() => setParams({ new: '1' })}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
          
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            New project
          </button>
        }
      </header>

      {creating &&
      <div className="mt-5">
          <NewProjectForm
          busy={busy === 'create'}
          onCancel={() => setParams({})}
          onSubmit={async (form) => {
            const created = await create(form);
            if (created) navigate('/studio');
          }} />
        
        </div>
      }

      <section aria-label="Active projects" className="mt-5">
        {error ?
        <ErrorBlock message="Your projects couldn’t be loaded." onRetry={reload} /> :
        projects === null ?
        <SkeletonRows rows={3} /> :
        active.length === 0 ?
        <EmptyBlock
          title="No active projects"
          body="Start one from an idea, or restore one from the archive below." /> :


        <ul className="divide-y divide-white/5">
            {active.map((p) =>
          <ProjectRow
            key={p.id}
            project={p}
            isOpen={p.id === activeId}
            busy={busy}
            onOpen={async () => {
              if (p.id === activeId) navigate('/studio');else
              if (await open(p.id)) navigate('/studio');
            }}
            onDuplicate={() => duplicate(p.id)}
            onArchive={() => archive(p.id)} />

          )}
          </ul>
        }
      </section>

      {archived.length > 0 &&
      <section aria-labelledby="archived-h" className="mt-8">
          <button
          type="button"
          id="archived-h"
          aria-expanded={showArchived}
          onClick={() => setShowArchived((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-mist-300 hover:text-white">
          
            <ArchiveIcon className="h-4 w-4" aria-hidden="true" />
            Archived ({archived.length})
          </button>
          {showArchived &&
        <ul className="mt-3 divide-y divide-white/5 opacity-80">
              {archived.map((p) =>
          <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                  <img src={p.poster} alt="" className="h-10 w-16 rounded-md object-cover grayscale" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{p.title}</p>
                    <p className="text-[11px] text-mist-400">Archived · last edited {relativeTime(p.updatedAt)}</p>
                  </div>
                  <button
              type="button"
              disabled={busy !== null}
              onClick={() => unarchive(p.id)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-mist-200 hover:text-white disabled:opacity-50">
              
                    <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {busy === `unarchive:${p.id}` ? 'Restoring…' : 'Restore'}
                  </button>
                </li>
          )}
            </ul>
        }
        </section>
      }
    </div>);

}

interface ProjectRowProps {
  project: StudioProjectSummary;
  isOpen: boolean;
  busy: string | null;
  onOpen: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}

function ProjectRow({ project: p, isOpen, busy, onOpen, onDuplicate, onArchive }: ProjectRowProps) {
  const progress = p.counts.shots ? `${p.counts.approvedShots} of ${p.counts.shots} shots approved` : `${p.counts.bibleEntries} Story Bible entries · no shots yet`;
  return (
    <li className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
      <img src={p.poster} alt="" className="aspect-video w-full rounded-lg object-cover" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-bold text-white">{p.title}</h2>
          {isOpen &&
          <span className="rounded-full bg-brand-indigo/15 px-2 py-0.5 text-[10px] font-semibold text-brand-indigo">
              Open in Director
            </span>
          }
          {p.release &&
          <Link
            to={`/title/${p.release.slug}`}
            className="rounded-full bg-status-success/15 px-2 py-0.5 text-[10px] font-semibold text-status-success-fg hover:underline">
            
              {p.release.state === 'scheduled' ? 'Premiere scheduled' : `Live · v${p.release.version}`}
            </Link>
          }
        </div>
        <p className="mt-0.5 truncate text-xs text-mist-400">
          {p.format} · {stageLabel(p.stage)} · edited {relativeTime(p.updatedAt)}
        </p>
        <p className="mt-1 text-[11px] text-mist-300">
          {progress}
          {p.origin.kind === 'duplicate' && <span className="text-mist-400"> · copied from {p.origin.fromTitle}</span>}
        </p>
      </div>
      <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
        <button
          type="button"
          disabled={busy !== null}
          onClick={onOpen}
          className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:opacity-50">
          
          <FolderOpenIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {busy === `open:${p.id}` ? 'Opening…' : isOpen ? 'Go to Director' : 'Open'}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={onDuplicate}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-50">
          
          <CopyIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {busy === `duplicate:${p.id}` ? 'Copying…' : 'Duplicate'}
        </button>
        {!isOpen &&
        <button
          type="button"
          disabled={busy !== null}
          onClick={onArchive}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-50">
          
            <ArchiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {busy === `archive:${p.id}` ? 'Archiving…' : 'Archive'}
          </button>
        }
      </div>
    </li>);

}