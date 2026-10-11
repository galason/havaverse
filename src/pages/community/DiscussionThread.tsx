import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BellIcon,
  BookmarkIcon,
  FlagIcon,
  HeartIcon,
  Share2Icon } from
'lucide-react';
import { communityApi } from '../../services/communityApi';
import { personById } from '../../data/communityPeople';
import { recommendedCommunities } from '../../data/communityHub';
import { useApp } from '../../contexts/AppContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { copyAndReport } from '../../utils/share';
import { ReportDialog } from '../../components/community/ReportDialog';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { SpoilerGate, SpoilerControl } from '../../components/community/SpoilerGate';
import { OriginTag } from '../../components/community/OriginTag';
import { JoinButton } from '../../components/community/JoinButton';
import type { Discussion } from '../../types/communityEntities';

type Sort = 'top' | 'newest' | 'creator';

export function DiscussionThread() {
  const { threadId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { bump, isSavedItem, toggleSave } = useCommunity();

  const [discussion, setDiscussion] = React.useState<Discussion | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');
  const [sort, setSort] = React.useState<Sort>('top');
  const [liked, setLiked] = React.useState(false);
  const [followed, setFollowed] = React.useState(false);
  const [body, setBody] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reporting, setReporting] = React.useState(false);
  const [likedReplies, setLikedReplies] = React.useState<string[]>([]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.getDiscussion(threadId);
    if (result.ok && result.data) {
      setDiscussion(result.data);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [threadId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading discussion…" />
      </div>);

  }

  if (status === 'missing' || !discussion) {
    return (
      <div className="p-5">
        <ErrorBlock message="That discussion is no longer available." onRetry={load} />
      </div>);

  }

  const author = personById(discussion.authorId);
  const community = recommendedCommunities.find((c) => c.slug === discussion.communitySlug);
  const saved = isSavedItem(`discussion:${discussion.id}`);

  const replies = [...discussion.replies].sort((a, b) => {
    if (sort === 'top') return b.likes - a.likes;
    if (sort === 'creator') return Number(Boolean(b.isCreator)) - Number(Boolean(a.isCreator));
    return 0;
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPosting(true);
    const result = await communityApi.createReply(discussion.id, body);
    setPosting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDiscussion((prev) => prev ? { ...prev, replies: [...prev.replies, result.data] } : prev);
    setBody('');
    bump('replies');
    showToast('Reply posted');
  };

  return (
    <article className="mx-auto max-w-3xl p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      {community &&
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-white/5 bg-ink-900 p-2.5">
          <img src={community.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <Link
            to={`/community/${community.slug}`}
            className="block truncate text-xs font-semibold text-white hover:text-brand-magenta">
            
              {community.name}
            </Link>
            <span className="text-[11px] text-mist-400">
              {community.anchorLabel} · {community.members} members
            </span>
          </div>
          <JoinButton slug={community.slug} name={community.name} />
        </div>
      }

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-200">
            {discussion.kind}
          </span>
          {author.isCreator && <OriginTag origin="creator" />}
          {discussion.spoilerLevel !== 'safe' &&
          <span className="rounded bg-brand-amber/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-amber">
              Spoilers
            </span>
          }
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white">
          {discussion.title}
        </h1>
        <div className="mt-3 flex items-center gap-2.5">
          <img src={author.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <p className="text-xs">
            <Link
              to={`/people/${author.id}`}
              className="font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
              
              {author.name}
            </Link>
            <span className="text-mist-400"> · {discussion.timeAgo}</span>
          </p>
        </div>
      </header>

      <div className="mt-4">
        <SpoilerGate id={discussion.id} level={discussion.spoilerLevel}>
          <p className="text-sm leading-relaxed text-mist-200">{discussion.body}</p>
        </SpoilerGate>
      </div>

      {discussion.tags.length > 0 &&
      <ul className="mt-3 flex flex-wrap gap-1.5">
          {discussion.tags.map((tag) =>
        <li key={tag}>
              <Link
            to={`/search?q=${encodeURIComponent(tag)}`}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist-300 transition-colors duration-150 ease-entrance hover:border-brand-indigo/50 hover:text-white">
            
                #{tag}
              </Link>
            </li>
        )}
        </ul>
      }

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-y border-white/5 py-2.5">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => {
            setLiked((l) => !l);
            showToast(liked ? 'Like removed' : 'Liked');
          }}
          className={[
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance',
          liked ? 'bg-live/15 text-live' : 'text-mist-300 hover:bg-white/5 hover:text-white'].
          join(' ')}>
          
          <HeartIcon className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
          {(discussion.likes + (liked ? 1 : 0)).toLocaleString()}
        </button>
        <button
          type="button"
          aria-pressed={followed}
          onClick={() => {
            setFollowed((f) => !f);
            showToast(followed ? 'Stopped following this discussion' : 'Following this discussion');
          }}
          className={[
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance',
          followed ? 'bg-brand-indigo/20 text-brand-indigo' : 'text-mist-300 hover:bg-white/5 hover:text-white'].
          join(' ')}>
          
          <BellIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {followed ? 'Following' : 'Follow'}
        </button>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => toggleSave(`discussion:${discussion.id}`, discussion.title)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
          
          <BookmarkIcon className={`h-3.5 w-3.5 ${saved ? 'fill-current text-brand-amber' : ''}`} aria-hidden="true" />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => copyAndReport(window.location.pathname, 'Discussion link', showToast)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
          
          <Share2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          Share
        </button>
        <button
          type="button"
          onClick={() => setReporting(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-live">
          
          <FlagIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Report
        </button>
      </div>

      <form onSubmit={submit} className="mt-5">
        <label htmlFor="reply-body" className="mb-1.5 block text-xs font-semibold text-white">
          Add your reply
        </label>
        <textarea
          id="reply-body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Keep it about the work, not the person."
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-3.5 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
        
        {error &&
        <p role="alert" className="mt-1.5 text-[11px] font-semibold text-live">
            {error}
          </p>
        }
        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="rounded-lg bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
            
            {posting ? 'Posting…' : 'Post reply'}
          </button>
          <span className="text-[11px] text-mist-400">
            Posting as {personById('you').name}
          </span>
        </div>
      </form>

      <section aria-labelledby="replies-heading" className="mt-7">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 id="replies-heading" className="text-base font-bold text-white">
            {discussion.replies.length} replies
          </h2>
          <div className="ml-auto flex items-center gap-1.5">
            {(['top', 'newest', 'creator'] as Sort[]).map((option) =>
            <button
              key={option}
              type="button"
              aria-pressed={sort === option}
              onClick={() => setSort(option)}
              className={[
              'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-colors duration-150 ease-entrance',
              sort === option ? 'bg-white/10 text-white' : 'text-mist-400 hover:text-white'].
              join(' ')}>
              
                {option === 'creator' ? 'Creator first' : option}
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <SpoilerControl />
        </div>

        <ul className="space-y-3">
          {replies.map((reply) => {
            const person = personById(reply.authorId);
            return (
              <li key={reply.id} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                <div className="flex items-center gap-2.5">
                  <img src={person.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <p className="flex flex-wrap items-center gap-1.5 text-xs">
                    <Link
                      to={`/people/${person.id}`}
                      className="font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                      
                      {person.name}
                    </Link>
                    {reply.isCreator && <OriginTag origin="creator" />}
                    <span className="text-mist-400">{reply.timeAgo}</span>
                  </p>
                </div>
                <div className="mt-2.5">
                  <SpoilerGate id={reply.id} level={reply.spoilerLevel}>
                    <p className="text-sm leading-relaxed text-mist-200">{reply.body}</p>
                  </SpoilerGate>
                </div>
                <button
                  type="button"
                  aria-pressed={likedReplies.includes(reply.id)}
                  onClick={() =>
                  setLikedReplies((prev) =>
                  prev.includes(reply.id) ?
                  prev.filter((id) => id !== reply.id) :
                  [...prev, reply.id]
                  )
                  }
                  className={[
                  'mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance hover:text-live',
                  likedReplies.includes(reply.id) ? 'text-live' : 'text-mist-400'].
                  join(' ')}>
                  
                  <HeartIcon
                    className={`h-3 w-3 ${likedReplies.includes(reply.id) ? 'fill-current' : ''}`}
                    aria-hidden="true" />
                  
                  {(reply.likes + (likedReplies.includes(reply.id) ? 1 : 0)).toLocaleString()}
                </button>
              </li>);

          })}
        </ul>
      </section>

      {reporting &&
      <ReportDialog
        subject="discussion"
        objectId={discussion.id}
        label="this discussion"
        onClose={() => setReporting(false)}
        onDone={showToast} />

      }
    </article>);

}