import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BellOffIcon, FlagIcon } from 'lucide-react';
import { personById, people } from '../../data/communityPeople';
import { recommendedCommunities } from '../../data/communityHub';
import { seedDiscussions, seedFanCreations, achievementRules } from '../../data/communityContent';
import { useApp } from '../../contexts/AppContext';
import { OriginTag } from '../../components/community/OriginTag';
import { ReportDialog } from '../../components/community/ReportDialog';
import { EmptyBlock } from '../../components/community/StateBlocks';

export function PersonProfile() {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast, isFollowing, toggleFollow } = useApp();

  const exists = people.some((p) => p.id === userId);
  const person = personById(userId);

  const [muted, setMuted] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);
  const following = isFollowing(`person:${person.id}`);

  if (!exists) {
    return (
      <div className="p-5">
        <EmptyBlock
          title="No such profile"
          body="This member may have deleted their account, or the link is wrong."
          action={
          <Link
            to="/communities"
            className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
              Back to Community
            </Link>
          } />
        
      </div>);

  }

  const posts = seedDiscussions.filter((d) => d.authorId === person.id);
  const creations = seedFanCreations.filter((c) => c.authorId === person.id);
  const communities = recommendedCommunities.filter((c) => person.communities.includes(c.slug));
  const earned = achievementRules.slice(0, Math.min(3, Math.max(1, Math.round(person.posts / 200))));

  return (
    <article className="mx-auto max-w-4xl p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <header className="flex flex-wrap items-start gap-4">
        <img
          src={person.avatar}
          alt=""
          className="h-20 w-20 shrink-0 rounded-full object-cover sm:h-24 sm:w-24" />
        
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">{person.name}</h1>
            {person.isCreator && <OriginTag origin="creator" />}
          </div>
          <p className="mt-0.5 text-xs text-mist-400">
            {person.handle} · {person.role}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist-200">{person.bio}</p>
          <p className="mt-2 flex flex-wrap gap-4 text-[11px] text-mist-400">
            <span>
              <span className="font-semibold text-white">{person.followers}</span> followers
            </span>
            <span>
              <span className="font-semibold text-white">{person.posts}</span> posts
            </span>
            <span>
              <span className="font-semibold text-white">{person.creations}</span> creations
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleFollow(`person:${person.id}`)}
            aria-pressed={following}
            className={[
            'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
            following ?
            'border border-white/20 text-mist-200 hover:text-white' :
            'bg-brand-indigo text-white hover:bg-brand-violet'].
            join(' ')}>
            
            {following ? 'Following' : 'Follow'}
          </button>
          {person.isCreator &&
          <Link
            to="/creator/adaezefilms"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Creator page
            </Link>
          }
          <button
            type="button"
            onClick={() => {
              setMuted((m) => !m);
              showToast(muted ? 'Unmuted' : 'Muted — you will not see their posts');
            }}
            aria-pressed={muted}
            className="rounded-full border border-white/15 p-2.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white"
            aria-label={muted ? 'Unmute' : 'Mute'}>
            
            <BellOffIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="rounded-full border border-white/15 p-2.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-live"
            aria-label="Report this member">
            
            <FlagIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Discussions started</h2>
            {posts.length === 0 ?
            <p className="mt-2 text-xs text-mist-400">Nothing posted publicly yet.</p> :

            <ul className="mt-2.5 space-y-2">
                {posts.map((post) =>
              <li key={post.id}>
                    <Link
                  to={`/discussions/${post.id}`}
                  className="block rounded-xl border border-white/5 bg-ink-850 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                      <span className="block text-sm font-semibold text-white">{post.title}</span>
                      <span className="mt-0.5 block text-[11px] text-mist-400">
                        {post.kind} · {post.replies.length} replies
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            }
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Fan creations</h2>
            {creations.length === 0 ?
            <p className="mt-2 text-xs text-mist-400">No published creations.</p> :

            <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {creations.map((creation) =>
              <li key={creation.id}>
                    <Link
                  to={`/fan-creations/${creation.id}`}
                  className="block rounded-xl border border-white/5 bg-ink-850 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                  
                      <OriginTag origin="fan" />
                      <span className="mt-1.5 block text-xs font-semibold text-white">
                        {creation.title}
                      </span>
                      <span className="block text-[11px] text-mist-400">
                        {creation.kind} · {creation.views} views
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            }
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Communities</h2>
            <ul className="mt-2.5 space-y-2">
              {communities.map((community) =>
              <li key={community.slug}>
                  <Link
                  to={`/community/${community.slug}`}
                  className="flex items-center gap-2.5 transition-opacity duration-150 ease-entrance hover:opacity-80">
                  
                    <img src={community.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white">
                        {community.name}
                      </span>
                      <span className="block text-[11px] text-mist-400">
                        {community.members} members
                      </span>
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Achievements</h2>
            <ul className="mt-2.5 space-y-1.5">
              {earned.map((rule) =>
              <li key={rule.id} className="text-xs text-mist-200">
                  <span className="font-semibold text-brand-amber">{rule.name}</span>
                  <span className="block text-[11px] text-mist-400">{rule.detail}</span>
                </li>
              )}
            </ul>
            <p className="mt-2.5 text-[10px] leading-relaxed text-mist-400">
              Earned inside communities, not from a global follower count.
            </p>
          </section>
        </aside>
      </div>

      {reporting &&
      <ReportDialog
        subject="member"
        objectId={person.id}
        label={person.name}
        onClose={() => setReporting(false)}
        onDone={showToast} />

      }
    </article>);

}