import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  BellIcon,
  BellOffIcon,
  MessageSquareIcon,
  PinIcon,
  PlayIcon,
  PlusIcon,
  Share2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon } from
'lucide-react';
import { communityApi } from '../services/communityApi';
import { recommendedCommunities } from '../data/communityHub';
import { personById, people } from '../data/communityPeople';
import { seedFanCreations, seedPolls } from '../data/communityContent';
import { useApp } from '../contexts/AppContext';
import { useCommunity } from '../contexts/CommunityContext';
import { copyAndReport } from '../utils/share';
import { JoinButton } from '../components/community/JoinButton';
import { OriginTag } from '../components/community/OriginTag';
import { SpoilerControl, SpoilerGate } from '../components/community/SpoilerGate';
import { EmptyBlock, SkeletonRows } from '../components/community/StateBlocks';
import { NewDiscussionForm } from '../components/community/NewDiscussionForm';
import type {
  CommunityEventRecord,
  Discussion,
  WatchPartyRecord } from
'../types/communityEntities';

const tabs = ['Overview', 'Discuss', 'Watch', 'Events', 'Media', 'Members', 'About'] as const;
type Tab = (typeof tabs)[number];

export function CommunityDetail() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { showToast } = useApp();
  const { isMember, membership, setMuted, setNotifications } = useCommunity();

  const community =
  recommendedCommunities.find((c) => c.slug === slug) ?? recommendedCommunities[0];

  const tabParam = params.get('tab') as Tab | null;
  const tab: Tab = tabs.includes(tabParam as Tab) ? tabParam as Tab : 'Overview';
  const setTab = (next: Tab) => setParams(next === 'Overview' ? {} : { tab: next }, { replace: true });

  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [parties, setParties] = React.useState<WatchPartyRecord[]>([]);
  const [events, setEvents] = React.useState<CommunityEventRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [composing, setComposing] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
    communityApi.listDiscussions(community.slug),
    communityApi.listWatchParties(),
    communityApi.listEvents()]
    ).then(([d, w, e]) => {
      if (!active) return;
      if (d.ok) setDiscussions(d.data);
      if (w.ok) setParties(w.data.filter((p) => p.communitySlug === community.slug));
      if (e.ok) setEvents(e.data.filter((item) => item.communitySlug === community.slug));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [community.slug]);

  const joined = isMember(community.slug);
  const record = membership(community.slug);
  const creations = seedFanCreations.filter((c) => c.communitySlug === community.slug);
  const polls = seedPolls.filter((p) => p.communitySlug === community.slug);
  const members = people.filter((p) => p.communities.includes(community.slug));
  const livePartyId = parties.find((p) => p.state === 'live')?.id;

  return (
    <article className="pb-12">
      <div className="relative h-40 w-full overflow-hidden sm:h-52">
        <img src={community.image} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_8%,rgb(var(--c-ink-950)/0.35)_100%)]" />
      </div>

      <header className="flex flex-wrap items-end gap-4 px-4 pt-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <OriginTag origin="community" label={community.anchor} />
            <span className="truncate text-[11px] text-mist-400">{community.anchorLabel}</span>
          </span>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">{community.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-mist-400">
            <span className="flex items-center gap-1">
              <UsersIcon className="h-3 w-3" aria-hidden="true" />
              {community.members} members
            </span>
            <span className="flex items-center gap-1 text-brand-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" aria-hidden="true" />
              {community.online} online
            </span>
            {joined && record &&
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-200">
                {record.role} · joined {record.joinedAt}
              </span>
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <JoinButton slug={community.slug} name={community.name} size="md" />
          {livePartyId ?
          <Link
            to={`/watch-parties/${livePartyId}`}
            className="flex items-center gap-1.5 rounded-full border border-live/40 px-4 py-2.5 text-sm font-semibold text-live transition-colors duration-150 ease-entrance hover:bg-live/10">
            
              <PlayIcon className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Join watch party
            </Link> :

          <Link
            to="/watch-parties/create"
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Host a watch party
            </Link>
          }
          <button
            type="button"
            onClick={() => {
              setComposing(true);
              setTab('Discuss');
            }}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            New discussion
          </button>
          <button
            type="button"
            onClick={() => copyAndReport(window.location.pathname, 'Community link', showToast)}
            aria-label="Share community"
            className="rounded-full border border-white/15 p-2.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
            <Share2Icon className="h-4 w-4" aria-hidden="true" />
          </button>
          {joined && record &&
          <button
            type="button"
            onClick={() => setMuted(community.slug, !record.muted)}
            aria-pressed={record.muted}
            aria-label={record.muted ? 'Unmute community' : 'Mute community'}
            className="rounded-full border border-white/15 p-2.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
              {record.muted ?
            <BellOffIcon className="h-4 w-4" aria-hidden="true" /> :

            <BellIcon className="h-4 w-4" aria-hidden="true" />
            }
            </button>
          }
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Community sections"
        className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-white/5 px-4 sm:px-5">
        
        {tabs.map((option) =>
        <button
          key={option}
          role="tab"
          type="button"
          aria-selected={tab === option}
          onClick={() => setTab(option)}
          className={[
          'shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
          tab === option ?
          'border-brand-magenta text-white' :
          'border-transparent text-mist-400 hover:text-white'].
          join(' ')}>
          
            {option}
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {loading && <SkeletonRows rows={3} />}

        {!loading && tab === 'Overview' &&
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section aria-label="Community activity" className="min-w-0 space-y-3">
              {events.
            filter((e) => e.state === 'live').
            map((event) =>
            <Link
              key={event.id}
              to={event.watchPartyId ? `/watch-parties/${event.watchPartyId}` : `/events/${event.id}`}
              className="flex items-center gap-3 rounded-2xl border border-live/30 bg-live/5 p-3 transition-colors duration-150 ease-entrance hover:border-live/50">
              
                    <img src={event.image} alt="" className="h-14 w-20 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-live">
                        <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
                        Happening now
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-semibold text-white">
                        {event.name}
                      </span>
                      <span className="block truncate text-[11px] text-mist-400">
                        {event.attendees}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-brand-indigo px-3 py-2 text-xs font-semibold text-white">
                      Join
                    </span>
                  </Link>
            )}

              {discussions.slice(0, 3).map((discussion) =>
            <DiscussionRow key={discussion.id} discussion={discussion} />
            )}

              {creations.slice(0, 2).map((creation) =>
            <Link
              key={creation.id}
              to={`/fan-creations/${creation.id}`}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  {creation.image ?
              <img src={creation.image} alt="" className="h-14 w-20 rounded-lg object-cover" /> :

              <span className="flex h-14 w-20 items-center justify-center rounded-lg bg-ink-850 text-mist-400">
                      <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
              }
                  <span className="min-w-0 flex-1">
                    <OriginTag origin="fan" />
                    <span className="mt-1 block truncate text-sm font-semibold text-white">
                      {creation.title}
                    </span>
                    <span className="block truncate text-[11px] text-mist-400">
                      {personById(creation.authorId).name} · {creation.views} views
                    </span>
                  </span>
                </Link>
            )}
            </section>

            <aside className="space-y-4">
              {polls.length > 0 &&
            <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                  <h2 className="text-sm font-bold text-white">{polls[0].question}</h2>
                  <p className="mt-0.5 text-[11px] text-mist-400">
                    {polls[0].participants.toLocaleString()} participants · {polls[0].closes}
                  </p>
                  <Link
                to={polls[0].kind === 'prediction' ? '/predictions' : '/polls'}
                className="mt-3 block rounded-lg bg-brand-indigo px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                
                    {polls[0].kind === 'prediction' ? 'Make your prediction' : 'Cast your vote'}
                  </Link>
                </section>
            }

              <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <SparklesIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
                  Community Agent digest
                </h2>
                <p className="mt-2 text-[11px] leading-relaxed text-mist-300">
                  Today: a continuity debate about the railway map, strong support for a Southbound
                  sequel, and two watch parties filling fast. No moderation issues in 24 hours.
                </p>
              </section>

              {joined && record &&
            <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                  <h2 className="text-sm font-bold text-white">Notifications</h2>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(['all', 'highlights', 'off'] as const).map((mode) =>
                <button
                  key={mode}
                  type="button"
                  aria-pressed={record.notifications === mode}
                  onClick={() => setNotifications(community.slug, mode)}
                  className={[
                  'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-colors duration-150 ease-entrance',
                  record.notifications === mode ?
                  'bg-brand-indigo text-white' :
                  'border border-white/10 text-mist-300 hover:text-white'].
                  join(' ')}>
                  
                        {mode}
                      </button>
                )}
                  </div>
                </section>
            }
            </aside>
          </div>
        }

        {!loading && tab === 'Discuss' &&
        <section aria-label="Discussions" className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <SpoilerControl />
              <button
              type="button"
              onClick={() => setComposing((c) => !c)}
              className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
                <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                New discussion
              </button>
            </div>

            {composing &&
          <div className="mb-4">
                <NewDiscussionForm
              communitySlug={community.slug}
              onCancel={() => setComposing(false)}
              onCreated={(discussion) => {
                setDiscussions((prev) => [discussion, ...prev]);
                setComposing(false);
              }} />
            
              </div>
          }

            {discussions.length === 0 ?
          <EmptyBlock
            icon={<MessageSquareIcon className="h-6 w-6" />}
            title="No discussions yet"
            body="Be the first to start one. Threads here stay attached to the work itself." /> :


          <ul className="space-y-3">
                {discussions.map((discussion) =>
            <li key={discussion.id}>
                    <DiscussionRow discussion={discussion} />
                  </li>
            )}
              </ul>
          }
          </section>
        }

        {!loading && tab === 'Watch' &&
        <section aria-label="Watch parties">
            {parties.length === 0 ?
          <EmptyBlock
            title="No watch parties scheduled"
            body="Host the first one and invite the community."
            action={
            <Link
              to="/watch-parties/create"
              className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
                    Create watch party
                  </Link>
            } /> :


          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {parties.map((party) =>
            <li key={party.id}>
                    <Link
                to={`/watch-parties/${party.id}`}
                className="flex h-full gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      <img src={party.image} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">
                          {party.title}
                        </span>
                        <span className="block text-[11px] text-mist-400">{party.when}</span>
                        <span className="block text-[11px] text-mist-400">
                          {party.participants.toLocaleString()}{' '}
                          {party.state === 'live' ? 'watching' : 'going'}
                        </span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
          }
          </section>
        }

        {!loading && tab === 'Events' &&
        <section aria-label="Events">
            {events.length === 0 ?
          <EmptyBlock title="Nothing on the calendar" body="This community has no scheduled events yet." /> :

          <ul className="space-y-2">
                {events.map((event) =>
            <li key={event.id}>
                    <Link
                to={`/events/${event.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      <img src={event.image} alt="" className="h-14 w-20 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">
                          {event.name}
                        </span>
                        <span className="block truncate text-[11px] text-mist-400">
                          {event.kind} · {event.when} · {event.attendees}
                        </span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
          }
          </section>
        }

        {!loading && tab === 'Media' &&
        <section aria-label="Media and fan creations">
            {creations.length === 0 ?
          <EmptyBlock title="No media yet" body="Fan art, edits and analysis will appear here." /> :

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {creations.map((creation) =>
            <li key={creation.id}>
                    <Link
                to={`/fan-creations/${creation.id}`}
                className="block h-full overflow-hidden rounded-2xl border border-white/5 bg-ink-900 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                      {creation.image ?
                <img src={creation.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /> :

                <span className="flex aspect-[4/3] w-full items-center justify-center bg-ink-850 text-mist-400">
                          <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                }
                      <span className="block p-3">
                        <OriginTag origin="fan" />
                        <span className="mt-1.5 block text-xs font-bold text-white">
                          {creation.title}
                        </span>
                        <span className="block text-[11px] text-mist-400">{creation.kind}</span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
          }
          </section>
        }

        {!loading && tab === 'Members' &&
        <section aria-label="Members">
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((person) =>
            <li key={person.id}>
                  <Link
                to={`/people/${person.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
                
                    <img src={person.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-white">
                          {person.name}
                        </span>
                        {person.isCreator && <OriginTag origin="creator" />}
                      </span>
                      <span className="block truncate text-[11px] text-mist-400">
                        {person.role} · {person.followers} followers
                      </span>
                    </span>
                  </Link>
                </li>
            )}
            </ul>
            <p className="mt-3 text-[11px] text-mist-400">
              Roles here are owner, moderator, host, creator and member — the same permission model
              a small fan club and an official sports community both use.
            </p>
          </section>
        }

        {!loading && tab === 'About' &&
        <section aria-label="About" className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">About this community</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">{community.description}</p>
              <p className="mt-3 text-[11px] text-mist-400">
                Anchored to {community.anchorLabel}. Every community on HavaVerse has an
                entertainment object at its centre.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                House rules
              </h2>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-mist-300">
                <li>Spoiler-tag anything past the latest episode.</li>
                <li>No leaked or re-uploaded footage — it breaks the creator's rights.</li>
                <li>Fan work must be labelled as fan work.</li>
                <li>Disagree with the take, not the person.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Connected to</h2>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li>
                  <Link to="/universes/railway" className="text-brand-cyan hover:text-white">
                    The Railway Universe →
                  </Link>
                </li>
                <li>
                  <Link to="/title/the-last-train" className="text-brand-cyan hover:text-white">
                    The Last Train (film) →
                  </Link>
                </li>
                <li>
                  <Link to="/creator/adaezefilms" className="text-brand-cyan hover:text-white">
                    Adaeze Films (creator) →
                  </Link>
                </li>
                <li>
                  <Link to="/market" className="text-brand-cyan hover:text-white">
                    Related products in HavaVerse Market →
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        }
      </div>
    </article>);

}

function DiscussionRow({ discussion }: {discussion: Discussion;}) {
  const author = personById(discussion.authorId);
  return (
    <SpoilerGate id={discussion.id} level={discussion.spoilerLevel}>
      <Link
        to={`/discussions/${discussion.id}`}
        className={[
        'block rounded-2xl border p-4 transition-colors duration-150 ease-entrance',
        discussion.pinned ?
        'border-brand-indigo/40 bg-brand-indigo/5 hover:border-brand-indigo/60' :
        'border-white/5 bg-ink-900 hover:border-white/20'].
        join(' ')}>
        
        <span className="flex items-center gap-2.5">
          <img src={author.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-white">{author.name}</span>
            {author.isCreator && <OriginTag origin="creator" />}
            <span className="text-mist-400">{discussion.timeAgo}</span>
          </span>
          {discussion.pinned &&
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-indigo">
              <PinIcon className="h-3 w-3" aria-hidden="true" />
              Pinned
            </span>
          }
        </span>
        <span className="mt-2.5 block text-base font-semibold leading-snug text-white">
          {discussion.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-mist-300">{discussion.body}</span>
        <span className="mt-3 flex items-center gap-4 text-[11px] text-mist-400">
          <span className="flex items-center gap-1">
            <MessageSquareIcon className="h-3 w-3" aria-hidden="true" />
            {discussion.replies.length} replies
          </span>
          <span>{discussion.likes.toLocaleString()} likes</span>
        </span>
      </Link>
    </SpoilerGate>);

}