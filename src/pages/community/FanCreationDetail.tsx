import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  FlagIcon,
  HeartIcon,
  MessageSquareIcon,
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
import { OriginTag } from '../../components/community/OriginTag';
import { JoinButton } from '../../components/community/JoinButton';
import type { FanCreationRecord } from '../../types/communityEntities';

export function FanCreationDetail() {
  const { creationId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast, isFollowing, toggleFollow } = useApp();
  const { isSavedItem, toggleSave } = useCommunity();

  const [creation, setCreation] = React.useState<FanCreationRecord | null>(null);
  const [related, setRelated] = React.useState<FanCreationRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');
  const [liked, setLiked] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [comments, setComments] = React.useState<string[]>([]);
  const [reporting, setReporting] = React.useState(false);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [one, all] = await Promise.all([
    communityApi.getFanCreation(creationId),
    communityApi.listFanCreations()]
    );
    if (one.ok && one.data) {
      setCreation(one.data);
      setRelated(
        all.ok ? all.data.filter((c) => c.universeId === one.data!.universeId && c.id !== one.data!.id).slice(0, 4) : []
      );
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [creationId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading creation…" />
      </div>);

  }

  if (status === 'missing' || !creation) {
    return (
      <div className="p-5">
        <ErrorBlock message="That fan creation is no longer available." onRetry={load} />
      </div>);

  }

  const author = personById(creation.authorId);
  const community = recommendedCommunities.find((c) => c.slug === creation.communitySlug);
  const following = isFollowing(`person:${author.id}`);
  const savedHere = isSavedItem(`fan-creation:${creation.id}`);

  return (
    <article className="mx-auto max-w-4xl p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          {creation.image &&
          <img
            src={creation.image}
            alt={creation.title}
            className="w-full rounded-2xl border border-white/5 object-cover" />

          }

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <OriginTag origin="fan" />
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-200">
              {creation.kind}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{creation.title}</h1>
          <p className="mt-1 text-xs text-mist-400">
            {creation.views} views · {creation.likes.toLocaleString()} likes
          </p>
          <p className="mt-4 text-sm leading-relaxed text-mist-200">{creation.body}</p>

          <p className="mt-4 rounded-xl border border-brand-amber/25 bg-brand-amber/5 px-3 py-2.5 text-[11px] leading-relaxed text-mist-200">
            Fan-created work. It is connected to the Railway universe in the content graph but is
            not official canon, and the rights to the underlying work remain with the creator.
          </p>

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
              {(creation.likes + (liked ? 1 : 0)).toLocaleString()}
            </button>
            <button
              type="button"
              aria-pressed={savedHere}
              onClick={() => toggleSave(`fan-creation:${creation.id}`, creation.title)}
              className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance hover:bg-white/5',
              savedHere ? 'text-brand-amber' : 'text-mist-300 hover:text-white'].
              join(' ')}>
              
              <BookmarkIcon
                className={`h-3.5 w-3.5 ${savedHere ? 'fill-current' : ''}`}
                aria-hidden="true" />
              
              {savedHere ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => copyAndReport(window.location.pathname, 'Link', showToast)}
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

          <section aria-labelledby="creation-comments" className="mt-5">
            <h2 id="creation-comments" className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageSquareIcon className="h-4 w-4 text-mist-400" aria-hidden="true" />
              Comments
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                setComments((prev) => [...prev, comment.trim()]);
                setComment('');
                showToast('Comment posted');
              }}
              className="mt-2.5">
              
              <label htmlFor="creation-comment" className="sr-only">
                Add a comment
              </label>
              <textarea
                id="creation-comment"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Say something about this work…"
                className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-3 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
              
              <button
                type="submit"
                disabled={!comment.trim()}
                className="mt-2 rounded-lg bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
                
                Post comment
              </button>
            </form>
            {comments.length === 0 ?
            <p className="mt-3 text-xs text-mist-400">No comments yet. Be the first.</p> :

            <ul className="mt-3 space-y-2">
                {comments.map((entry, index) =>
              <li key={index} className="rounded-xl border border-white/5 bg-ink-900 p-3">
                    <p className="text-xs font-semibold text-white">{personById('you').name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-mist-200">{entry}</p>
                  </li>
              )}
              </ul>
            }
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Created by</h2>
            <Link to={`/people/${author.id}`} className="mt-3 flex items-center gap-3">
              <img src={author.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-white">{author.name}</span>
                <span className="block truncate text-[11px] text-mist-400">{author.role}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => toggleFollow(`person:${author.id}`)}
              aria-pressed={following}
              className={[
              'mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance',
              following ?
              'border border-white/20 text-mist-200 hover:text-white' :
              'bg-brand-indigo text-white hover:bg-brand-violet'].
              join(' ')}>
              
              {following ? 'Following' : 'Follow'}
            </button>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Connected to</h2>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              <li>
                <Link
                  to={`/universes/${creation.universeId}`}
                  className="text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
                  
                  The Railway Universe →
                </Link>
              </li>
              {community &&
              <li>
                  <Link
                  to={`/community/${community.slug}`}
                  className="text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
                  
                    {community.name} →
                  </Link>
                </li>
              }
            </ul>
            {community &&
            <div className="mt-3">
                <JoinButton slug={community.slug} name={community.name} full />
              </div>
            }
          </section>

          {related.length > 0 &&
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">More from this universe</h2>
              <ul className="mt-2.5 space-y-2">
                {related.map((item) =>
              <li key={item.id}>
                    <Link
                  to={`/fan-creations/${item.id}`}
                  className="block truncate text-xs text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
                  
                      {item.title}
                    </Link>
                  </li>
              )}
              </ul>
            </section>
          }
        </aside>
      </div>

      {reporting &&
      <ReportDialog
        subject="fan-creation"
        objectId={creation.id}
        label="this fan creation"
        onClose={() => setReporting(false)}
        onDone={showToast} />

      }
    </article>);

}