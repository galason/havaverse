import React from 'react';
import { ClockIcon, EyeOffIcon, HeartIcon, LoaderIcon, PinIcon, XIcon } from 'lucide-react';
import type { ShortComment } from '../../types/shorts';
import { shortsApi } from '../../services/shortsApi';
import { formatShortTime } from '../../hooks/useShortPlayback';

interface CommentsPanelProps {
  slug: string;
  total: number;
  currentTime: number;
  spoilerSafe: boolean;
  onSeek: (seconds: number) => void;
  onClose: () => void;
}

function CommentBody({
  comment,
  spoilerSafe,
  onSeek




}: {comment: ShortComment;spoilerSafe: boolean;onSeek: (s: number) => void;}) {
  const [revealed, setRevealed] = React.useState(false);
  const hidden = comment.spoiler && spoilerSafe && !revealed;

  if (hidden) {
    return (
      <div className="rounded-lg border border-brand-amber/25 bg-brand-amber/5 p-2.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-amber">
          <EyeOffIcon className="h-3 w-3" aria-hidden="true" />
          Marked as a spoiler
        </p>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-1.5 text-[11px] font-bold text-white underline">
          
          Reveal anyway
        </button>
      </div>);

  }

  return (
    <>
      <p className="text-xs leading-relaxed text-mist-100">{comment.body}</p>
      {comment.atSecond !== null &&
      <button
        type="button"
        onClick={() => onSeek(comment.atSecond!)}
        className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-indigo/20 px-2 py-0.5 text-[10px] font-bold text-brand-cyan transition-colors duration-150 ease-entrance hover:bg-brand-indigo/35">
        
          <ClockIcon className="h-2.5 w-2.5" aria-hidden="true" />
          Jump to {formatShortTime(comment.atSecond)}
        </button>
      }
    </>);

}

function Row({
  comment,
  spoilerSafe,
  onSeek,
  nested





}: {comment: ShortComment;spoilerSafe: boolean;onSeek: (s: number) => void;nested?: boolean;}) {
  const [liked, setLiked] = React.useState(false);

  return (
    <li className={nested ? 'ml-9 mt-2' : ''}>
      <div className="flex gap-2.5">
        <img src={comment.avatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-white">{comment.author}</span>
            {comment.fromCreator &&
            <span className="rounded-full bg-brand-violet/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-violet">
                Creator
              </span>
            }
            {comment.pinned &&
            <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide text-mist-400">
                <PinIcon className="h-2.5 w-2.5" aria-hidden="true" />
                Pinned
              </span>
            }
            <span className="text-mist-400">{comment.postedAgo}</span>
          </p>
          <div className="mt-0.5">
            <CommentBody comment={comment} spoilerSafe={spoilerSafe} onSeek={onSeek} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike comment' : 'Like comment'}
          className={`flex shrink-0 flex-col items-center gap-0.5 ${
          liked ? 'text-live' : 'text-mist-400'}`
          }>
          
          <HeartIcon className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
          <span className="text-[10px] tabular-nums">{comment.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>
      {comment.replies.map((reply) =>
      <Row
        key={reply.id}
        comment={reply}
        spoilerSafe={spoilerSafe}
        onSeek={onSeek}
        nested />

      )}
    </li>);

}

export function CommentsPanel({
  slug,
  total,
  currentTime,
  spoilerSafe,
  onSeek,
  onClose
}: CommentsPanelProps) {
  const [sort, setSort] = React.useState<'top' | 'new'>('top');
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [comments, setComments] = React.useState<ShortComment[]>([]);
  const [draft, setDraft] = React.useState('');
  const [markMoment, setMarkMoment] = React.useState(false);
  const [markSpoiler, setMarkSpoiler] = React.useState(false);
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await shortsApi.getComments(slug, sort);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setComments(result.data);
    setStatus('ready');
  }, [slug, sort]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPosting(true);
    const result = await shortsApi.postComment(
      slug,
      draft,
      markMoment ? Math.floor(currentTime) : null,
      markSpoiler
    );
    setPosting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    shortsApi.track('comment_created', slug);
    setComments((prev) => [result.data, ...prev]);
    setDraft('');
    setMarkMoment(false);
    setMarkSpoiler(false);
  }

  return (
    <section
      aria-label="Comments"
      className="flex max-h-[34rem] w-full flex-col rounded-2xl border border-white/5 bg-ink-900 lg:w-[22rem]">
      
      <header className="flex items-center gap-2 border-b border-white/5 p-3">
        <h2 className="text-xs font-bold text-white">
          Comments · {total.toLocaleString()}
        </h2>
        <div className="ml-auto flex gap-1">
          {(['top', 'new'] as const).map((s) =>
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            aria-pressed={sort === s}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors duration-150 ease-entrance ${
            sort === s ? 'bg-white text-ink-950' : 'text-mist-300 hover:text-white'}`
            }>
            
              {s === 'top' ? 'Top' : 'Newest'}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close comments"
          className="rounded-full p-1 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {status === 'loading' &&
        <ul className="space-y-3" aria-hidden="true">
            {[0, 1, 2].map((i) =>
          <li key={i} className="flex gap-2.5">
                <span className="h-7 w-7 animate-pulse rounded-full bg-ink-850" />
                <span className="h-10 flex-1 animate-pulse rounded-lg bg-ink-850" />
              </li>
          )}
          </ul>
        }

        {status === 'error' &&
        <div className="py-8 text-center">
            <p className="text-xs text-mist-300">We couldn’t load the comments.</p>
            <button
            type="button"
            onClick={load}
            className="mt-2 rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-bold text-white">
            
              Try again
            </button>
          </div>
        }

        {status === 'ready' && comments.length === 0 &&
        <p className="py-8 text-center text-xs text-mist-400">
            No one has said anything yet. Go first.
          </p>
        }

        {status === 'ready' && comments.length > 0 &&
        <ul className="space-y-3.5">
            {comments.map((c) =>
          <Row key={c.id} comment={c} spoilerSafe={spoilerSafe} onSeek={onSeek} />
          )}
          </ul>
        }
      </div>

      <form onSubmit={post} className="border-t border-white/5 p-3">
        <label htmlFor="short-comment" className="sr-only">
          Write a comment
        </label>
        <textarea
          id="short-comment"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-2.5 text-xs text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
        
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMarkMoment((v) => !v)}
            aria-pressed={markMoment}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150 ease-entrance ${
            markMoment ?
            'border-brand-cyan/50 text-brand-cyan' :
            'border-white/10 text-mist-300 hover:text-white'}`
            }>
            
            <ClockIcon className="h-2.5 w-2.5" aria-hidden="true" />
            At {formatShortTime(currentTime)}
          </button>
          <button
            type="button"
            onClick={() => setMarkSpoiler((v) => !v)}
            aria-pressed={markSpoiler}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150 ease-entrance ${
            markSpoiler ?
            'border-brand-amber/50 text-brand-amber' :
            'border-white/10 text-mist-300 hover:text-white'}`
            }>
            
            <EyeOffIcon className="h-2.5 w-2.5" aria-hidden="true" />
            Spoiler
          </button>
          <button
            type="submit"
            disabled={posting || draft.trim().length < 2}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-ink-950 disabled:opacity-40">
            
            {posting &&
            <LoaderIcon
              className="h-3 w-3 animate-spin motion-reduce:animate-none"
              aria-hidden="true" />

            }
            Post
          </button>
        </div>
        {error &&
        <p role="alert" className="mt-1.5 text-[11px] text-live">
            {error}
          </p>
        }
      </form>
    </section>);

}