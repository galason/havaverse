import React from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon } from 'lucide-react';
import type { TitleCommunityStats } from '../../types/title';
import type { Discussion } from '../../types/communityEntities';
import { communityApi } from '../../services/communityApi';
import { useCommunity } from '../../contexts/CommunityContext';
import { JoinButton } from '../community/JoinButton';
import { ErrorBlock, LoadingBlock } from '../community/StateBlocks';

interface TitleCommunityPanelProps {
  stats: TitleCommunityStats;
  onWatchParty: () => void;
}

/** The title is itself a community object — this reads the real one. */
export function TitleCommunityPanel({ stats, onWatchParty }: TitleCommunityPanelProps) {
  const { isMember } = useCommunity();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [exists, setExists] = React.useState(true);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const found = await communityApi.getCommunity(stats.slug);
    if (!found.ok) {
      setStatus('error');
      return;
    }
    setExists(Boolean(found.data));
    const list = await communityApi.listDiscussions(stats.slug);
    if (!list.ok) {
      setStatus('error');
      return;
    }
    setDiscussions(list.data.slice(0, 3));
    setStatus('ready');
  }, [stats.slug]);

  React.useEffect(() => {
    load();
  }, [load]);

  const member = isMember(stats.slug);

  return (
    <section
      aria-labelledby="community-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2
        id="community-heading"
        className="flex items-center gap-2 text-sm font-bold text-white">
        
        <UsersIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        The community
      </h2>
      <p className="mt-1 text-[11px] text-mist-400">
        {stats.fans} fans · {stats.discussing} discussing · {stats.watching} watching
      </p>
      <p className="text-[11px] text-mist-400">{stats.parties} watch parties active</p>

      {member && stats.newSinceLastVisit > 0 &&
      <p className="mt-2 rounded-lg border border-brand-indigo/30 bg-brand-indigo/10 px-2.5 py-1.5 text-[11px] text-mist-100">
          {stats.newSinceLastVisit} new discussions since your last visit
        </p>
      }

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to={`/community/${stats.slug}?tab=discuss`}
          className="rounded-full bg-brand-indigo px-4 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Join discussion
        </Link>
        <button
          type="button"
          onClick={onWatchParty}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/30">
          
          Watch party
        </button>
      </div>

      {exists &&
      <div className="mt-2">
          <JoinButton slug={stats.slug} name={stats.name} size="sm" full />
        </div>
      }

      <div className="mt-3 border-t border-white/5 pt-3">
        {status === 'loading' && <LoadingBlock label="Loading conversations" />}
        {status === 'error' &&
        <ErrorBlock message="Conversations could not be loaded." onRetry={load} />
        }
        {status === 'ready' && discussions.length === 0 &&
        <p className="text-[11px] text-mist-400">
            No conversations here yet. Be the first to start one.
          </p>
        }
        {status === 'ready' && discussions.length > 0 &&
        <ul className="space-y-1.5">
            {discussions.map((d) =>
          <li key={d.id}>
                <Link
              to={`/discussions/${d.id}`}
              className="block rounded-xl border border-white/5 bg-ink-850 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">
                    {d.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-mist-400">
                    {d.replies.length} replies · {d.likes} likes · {d.timeAgo}
                  </p>
                </Link>
              </li>
          )}
          </ul>
        }
      </div>
    </section>);

}