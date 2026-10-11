import React from 'react';
import { Link } from 'react-router-dom';
import { PaletteIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { personById } from '../../data/communityPeople';
import { SectionHeader } from './SectionHeader';
import { OriginTag } from './OriginTag';
import { ErrorBlock, SkeletonRows } from './StateBlocks';
import type { FanCreationRecord } from '../../types/communityEntities';

export function MadeByFans() {
  const [creations, setCreations] = React.useState<FanCreationRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listFanCreations();
    if (result.ok) {
      setCreations(result.data.slice(0, 6));
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section
      aria-labelledby="made-by-fans"
      className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <SectionHeader
        id="made-by-fans"
        title="Made by fans"
        subtitle="Attached to the same universe as the official work"
        icon={<PaletteIcon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />}
        actionTo="/fan-creations" />
      

      {status === 'loading' && <SkeletonRows rows={3} />}
      {status === 'error' && <ErrorBlock message="Could not load fan creations." onRetry={load} />}

      {status === 'ready' &&
      <ul className="grid gap-2 sm:grid-cols-2">
          {creations.map((creation) =>
        <li key={creation.id}>
              <Link
            to={`/fan-creations/${creation.id}`}
            className="flex h-full w-full items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-2.5 text-left transition-colors duration-150 ease-entrance hover:border-white/20">
            
                {creation.image ?
            <img
              src={creation.image}
              alt=""
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-lg object-cover" /> :


            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-indigo/15 text-brand-indigo">
                    <PaletteIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
            }
                <span className="min-w-0 flex-1">
                  <OriginTag origin="fan" label={creation.kind} />
                  <span className="mt-1 block truncate text-xs font-semibold text-white">
                    {creation.title}
                  </span>
                  <span className="block truncate text-[11px] text-mist-400">
                    {personById(creation.authorId).name} · {creation.views} views
                  </span>
                </span>
              </Link>
            </li>
        )}
        </ul>
      }

      <p className="mt-3 rounded-xl border border-white/5 bg-ink-850 px-3 py-2.5 text-[11px] leading-relaxed text-mist-300">
        Fan work is linked into the content graph beside the official film, characters and score —
        clearly labelled, never presented as canon.
      </p>
    </section>);

}