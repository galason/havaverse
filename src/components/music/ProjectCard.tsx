import React from 'react';
import { Link } from 'react-router-dom';
import { artists } from '../../data/music';
import { formatPrice } from '../../contexts/CommerceContext';
import { useMusic } from '../../contexts/MusicContext';
import type { SupportProject } from '../../types/music';

const amounts = [2500, 10000, 25000];

export function ProjectCard({ project }: {project: SupportProject;}) {
  const { back, hasBacked, pending } = useMusic();
  const [amount, setAmount] = React.useState(10000);

  const artist = artists.find((a) => a.id === project.artistId);
  const backed = hasBacked(project.id);
  const busy = pending === `back:${project.id}`;
  const percent = Math.min(100, Math.round(project.raised / project.goal * 100));

  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <img
          src={project.image}
          alt=""
          loading="lazy"
          className="h-40 w-full object-cover lg:h-full" />
        
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
            Backing a project
          </p>
          <h3 className="mt-0.5 text-base font-bold tracking-tight text-white">{project.title}</h3>
          {artist &&
          <Link
            to={`/music/artist/${artist.id}`}
            className="text-[11px] text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
              {artist.name} · {artist.city}
            </Link>
          }
          <p className="mt-2 text-xs leading-relaxed text-mist-300">{project.blurb}</p>

          <div className="mt-3">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
              role="img"
              aria-label={`${percent} percent of the goal raised`}>
              
              <span className="block h-full bg-brand-violet" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-mist-400">
              <span className="font-semibold text-white">{formatPrice(project.raised)}</span> of{' '}
              {formatPrice(project.goal)} · {project.backers.toLocaleString()} backers ·{' '}
              {project.daysLeft} days left
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {amounts.map((option) =>
            <button
              key={option}
              type="button"
              onClick={() => setAmount(option)}
              aria-pressed={amount === option}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
              amount === option ?
              'border-brand-violet bg-brand-violet/15 text-white' :
              'border-white/15 text-mist-200 hover:text-white'}`
              }>
              
                {formatPrice(option)}
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => back(project.id, amount, project.title)}
              className="rounded-lg bg-brand-violet px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-magenta disabled:bg-ink-800 disabled:text-mist-400">
              
              {busy ? 'Backing…' : backed ? 'Back again' : 'Back project'}
            </button>
          </div>

          {backed &&
          <p className="mt-2 text-[11px] text-brand-cyan">
              You're a backer. You'll be credited and get it before release.
            </p>
          }
        </div>
      </div>
    </article>);

}