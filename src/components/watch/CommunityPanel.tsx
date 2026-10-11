import React from 'react';
import { HeartIcon, MessageCircleIcon } from 'lucide-react';
import type { CommentSort, WatchComment } from '../../types/watch';
import { watchApi } from '../../services/watchApi';
import { formatTime, parseTimestamps } from '../../hooks/usePlayback';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../community/StateBlocks';

interface CommunityPanelProps {
  slug: string;
  discussionCount: string;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onToast: (message: string) => void;
}

const sorts: {id: CommentSort;label: string;}[] = [
{ id: 'top', label: 'Top' },
{ id: 'newest', label: 'Newest' },
{ id: 'discussed', label: 'Most discussed' }];


/** Renders a comment body, turning any "42:17" into a real seek control. */
function Body({ text, onSeek }: {text: string;onSeek: (s: number) => void;}) {
  const stamps = parseTimestamps(text);
  if (stamps.length === 0) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  stamps.forEach((stamp, i) => {
    const index = text.indexOf(stamp.label, cursor);
    if (index > cursor) nodes.push(text.slice(cursor, index));
    nodes.push(
      <button
        key={`${stamp.label}-${i}`}
        type="button"
        onClick={() => onSeek(stamp.seconds)}
        className="font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
        
        {stamp.label}
      </button>
    );
    cursor = index + stamp.label.length;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

export function CommunityPanel({
  slug,
  discussionCount,
  currentTime,
  onSeek,
  onToast
}: CommunityPanelProps) {
  const [comments, setComments] = React.useState<WatchComment[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [sort, setSort] = React.useState<CommentSort>('top');
  const [draft, setDraft] = React.useState('');
  const [attachTime, setAttachTime] = React.useState(false);
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState('');
  const [liked, setLiked] = React.useState<Set<string>>(new Set());
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await watchApi.listComments(slug, sort);
    if (result.ok) {
      setComments(result.data);
      setStatus('ready');
    } else setStatus('error');
  }, [slug, sort]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPosting(true);
    const result = await watchApi.postComment(
      slug,
      draft,
      attachTime ? Math.floor(currentTime) : undefined
    );
    setPosting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    watchApi.track('comment_created', slug);
    setComments((prev) => [result.data, ...prev]);
    setDraft('');
    setAttachTime(false);
  }

  async function reply(parentId: string) {
    const result = await watchApi.postReply(slug, parentId, replyDraft);
    if (!result.ok) {
      onToast(result.error);
      return;
    }
    setComments((prev) =>
    prev.map((c) =>
    c.id === parentId ? { ...c, replies: [...c.replies, result.data] } : c
    )
    );
    setExpanded((prev) => new Set(prev).add(parentId));
    setReplyDraft('');
    setReplyTo(null);
  }

  async function like(id: string) {
    const result = await watchApi.likeComment(id);
    if (!result.ok) return;
    setLiked((prev) => {
      const next = new Set(prev);
      if (result.data) next.add(id);else
      next.delete(id);
      return next;
    });
  }

  return (
    <section aria-labelledby="community-heading" className="rounded-2xl border border-white/5 bg-ink-900 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="community-heading" className="text-base font-bold tracking-tight text-white">
          Community
        </h2>
        <span className="text-xs text-mist-400">{discussionCount} discussions</span>
        <div className="ml-auto flex gap-1">
          {sorts.map((option) =>
          <button
            key={option.id}
            type="button"
            onClick={() => setSort(option.id)}
            aria-pressed={sort === option.id}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
            sort === option.id ?
            'bg-white text-ink-950' :
            'text-mist-300 hover:bg-white/5 hover:text-white'}`
            }>
            
              {option.label}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={post} className="mt-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Write a comment…"
          aria-label="Write a comment"
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
        
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-mist-300">
            <input
              type="checkbox"
              checked={attachTime}
              onChange={(e) => setAttachTime(e.target.checked)}
              className="h-3.5 w-3.5 accent-brand-indigo" />
            
            Mark at {formatTime(currentTime)}
          </label>
          {error &&
          <p role="alert" className="text-[11px] text-live">
              {error}
            </p>
          }
          <button
            type="submit"
            disabled={posting || draft.trim().length < 2}
            className="ml-auto rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
            
            {posting ? 'Posting…' : 'Comment'}
          </button>
        </div>
      </form>

      <div className="mt-4">
        {status === 'loading' && <SkeletonRows rows={3} />}
        {status === 'error' && <ErrorBlock message="Comments could not be loaded." onRetry={load} />}
        {status === 'ready' && comments.length === 0 &&
        <EmptyBlock
          title="No comments yet"
          body="Nobody has said anything about this title. You would be first." />

        }
        {status === 'ready' && comments.length > 0 &&
        <ul className="space-y-4">
            {comments.map((c) =>
          <li key={c.id}>
                <div className="flex gap-3">
                  <img src={c.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-semibold text-white">{c.author}</span>
                      {c.fromCreator &&
                  <span className="rounded-full bg-brand-indigo/20 px-2 py-0.5 text-[10px] font-semibold text-brand-indigo">
                          Creator
                        </span>
                  }
                      <span className="text-mist-400">{c.postedAt}</span>
                      {c.atSeconds !== undefined &&
                  <button
                    type="button"
                    onClick={() => onSeek(c.atSeconds!)}
                    className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:bg-white/20">
                    
                          At {formatTime(c.atSeconds)}
                        </button>
                  }
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-mist-200">
                      <Body text={c.body} onSeek={onSeek} />
                    </p>
                    <div className="mt-1.5 flex items-center gap-4">
                      <button
                    type="button"
                    onClick={() => like(c.id)}
                    aria-pressed={liked.has(c.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
                    liked.has(c.id) ? 'text-brand-magenta' : 'text-mist-400 hover:text-white'}`
                    }>
                    
                        <HeartIcon
                      className={`h-3.5 w-3.5 ${liked.has(c.id) ? 'fill-current' : ''}`}
                      aria-hidden="true" />
                    
                        {(c.likes + (liked.has(c.id) ? 1 : 0)).toLocaleString()}
                      </button>
                      <button
                    type="button"
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
                    
                        <MessageCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Reply
                      </button>
                      {c.replies.length > 0 &&
                  <button
                    type="button"
                    onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id);else
                      next.add(c.id);
                      return next;
                    })
                    }
                    className="text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
                    
                          {expanded.has(c.id) ? 'Hide' : `View ${c.replies.length}`} replies
                        </button>
                  }
                    </div>

                    {replyTo === c.id &&
                <div className="mt-2 flex gap-2">
                        <input
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder={`Reply to ${c.author}`}
                    aria-label={`Reply to ${c.author}`}
                    className="w-full rounded-full border border-white/10 bg-ink-850 px-3 py-2 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
                  
                        <button
                    type="button"
                    onClick={() => reply(c.id)}
                    disabled={replyDraft.trim().length < 2}
                    className="shrink-0 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-ink-950 disabled:bg-ink-700 disabled:text-mist-400">
                    
                          Reply
                        </button>
                      </div>
                }

                    {expanded.has(c.id) && c.replies.length > 0 &&
                <ul className="mt-3 space-y-3 border-l border-white/10 pl-3">
                        {c.replies.map((r) =>
                  <li key={r.id} className="flex gap-2.5">
                            <img
                      src={r.avatar}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full object-cover" />
                    
                            <div className="min-w-0">
                              <p className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="font-semibold text-white">{r.author}</span>
                                {r.fromCreator &&
                        <span className="rounded-full bg-brand-indigo/20 px-1.5 py-0.5 text-[9px] font-semibold text-brand-indigo">
                                    Creator
                                  </span>
                        }
                                <span className="text-mist-400">{r.postedAt}</span>
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-mist-200">
                                <Body text={r.body} onSeek={onSeek} />
                              </p>
                            </div>
                          </li>
                  )}
                      </ul>
                }
                  </div>
                </div>
              </li>
          )}
          </ul>
        }
      </div>
    </section>);

}