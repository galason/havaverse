import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayIcon } from 'lucide-react';
import type { ContentTitle } from '../../types/content';
import { watchApi } from '../../services/watchApi';

/** Post-roll autoplay. Cancellable, and it never starts restricted content. */
export function AutoplayCard({
  next,
  enabled,
  onCancel




}: {next: ContentTitle;enabled: boolean;onCancel: () => void;}) {
  const navigate = useNavigate();
  const [left, setLeft] = React.useState(8);

  React.useEffect(() => {
    if (!enabled) return;
    if (left <= 0) {
      navigate(`/watch/${next.slug}`);
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, enabled, navigate, next.slug]);

  return (
    <div className="absolute inset-0 grid place-items-center bg-ink-950/85 p-6">
      <div className="max-w-sm text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          Up next
        </p>
        <img
          src={next.backdrop ?? next.poster}
          alt=""
          className="mx-auto mt-3 aspect-video w-56 rounded-xl object-cover" />
        
        <h2 className="mt-3 text-lg font-bold tracking-tight text-white">{next.name}</h2>
        <p className="text-xs text-mist-400">
          {next.genre} · {next.runtime}
        </p>
        {enabled ?
        <p className="mt-2 text-xs text-mist-300">Starting in {left} seconds</p> :

        <p className="mt-2 text-xs text-mist-400">Autoplay is off</p>
        }
        <div className="mt-4 flex justify-center gap-2">
          <Link
            to={`/watch/${next.slug}`}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
            
            <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            Play now
          </Link>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Cancel
          </button>
        </div>
      </div>
    </div>);

}

interface RailProps {
  heading: string;
  note?: string;
  titles: ContentTitle[];
  slug: string;
}

export function DiscoveryRail({ heading, note, titles, slug }: RailProps) {
  if (titles.length === 0) return null;
  return (
    <section aria-labelledby={`rail-${heading}`}>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-2">
        <h2 id={`rail-${heading}`} className="text-base font-bold tracking-tight text-white">
          {heading}
        </h2>
        {note && <p className="text-[11px] text-mist-400">{note}</p>}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {titles.map((title) =>
        <li key={title.id}>
            <Link
            to={`/watch/${title.slug}`}
            onClick={() => watchApi.track('recommendation_clicked', slug, title.slug)}
            className="group block transition-transform duration-150 ease-entrance hover:-translate-y-0.5">
            
              <img
              src={title.backdrop ?? title.poster}
              alt=""
              className="aspect-video w-full rounded-xl object-cover" />
            
              <p className="mt-2 truncate text-xs font-semibold text-white">{title.name}</p>
              <p className="truncate text-[11px] text-mist-400">
                {title.genre} · {title.runtime}
              </p>
            </Link>
          </li>
        )}
      </ul>
    </section>);

}