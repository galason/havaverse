import React from 'react';
import { Link } from 'react-router-dom';
import { FlameIcon, MessageSquareIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { recommendedCommunities } from '../../data/communityHub';
import { SectionHeader } from './SectionHeader';
import { SpoilerControl, SpoilerGate } from './SpoilerGate';
import { ErrorBlock, SkeletonRows } from './StateBlocks';
import type { Discussion } from '../../types/communityEntities';

const kindTone: Record<string, string> = {
  Theory: 'text-brand-magenta',
  Debate: 'text-brand-amber',
  Discussion: 'text-brand-cyan',
  Review: 'text-brand-indigo',
  Question: 'text-brand-indigo'
};

export function TrendingConversations() {
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listDiscussions();
    if (result.ok) {
      setDiscussions([...result.data].sort((a, b) => b.likes - a.likes).slice(0, 6));
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
      aria-labelledby="trending-conversations"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <SectionHeader
        id="trending-conversations"
        title="Trending conversations"
        subtitle="What's everyone talking about?"
        icon={<FlameIcon className="h-5 w-5 text-brand-amber" aria-hidden="true" />}
        actionTo="/community/the-last-train?tab=Discuss" />
      

      <div className="mb-3">
        <SpoilerControl />
      </div>

      {status === 'loading' && <SkeletonRows rows={3} />}
      {status === 'error' && <ErrorBlock message="Could not load conversations." onRetry={load} />}

      {status === 'ready' &&
      <ul className="space-y-2">
          {discussions.map((discussion) => {
          const community = recommendedCommunities.find(
            (c) => c.slug === discussion.communitySlug
          );
          return (
            <li key={discussion.id}>
                <SpoilerGate id={discussion.id} level={discussion.spoilerLevel}>
                  <Link
                  to={`/discussions/${discussion.id}`}
                  className="flex items-start gap-3 rounded-xl p-2 transition-colors duration-150 ease-entrance hover:bg-white/5">
                  
                    {community &&
                  <img
                    src={community.image}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg object-cover" />

                  }
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug text-white">
                        “{discussion.title}”
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-mist-400">
                        <span className={`font-semibold ${kindTone[discussion.kind]}`}>
                          {discussion.kind}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{community?.name ?? 'HavaVerse'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <MessageSquareIcon className="h-3 w-3" aria-hidden="true" />
                          {discussion.replies.length} replies
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{discussion.likes.toLocaleString()} likes</span>
                      </span>
                    </span>
                  </Link>
                </SpoilerGate>
              </li>);

        })}
        </ul>
      }
    </section>);

}