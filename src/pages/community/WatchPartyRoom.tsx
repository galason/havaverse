import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  SendHorizonalIcon,
  Share2Icon,
  UsersIcon } from
'lucide-react';
import { communityApi } from '../../services/communityApi';
import { personById } from '../../data/communityPeople';
import { titleBySlug as bySlug } from '../../services/releaseRegistry';
import { recommendedCommunities } from '../../data/communityHub';
import { useApp } from '../../contexts/AppContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { copyAndReport } from '../../utils/share';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import type { PartyMessage, WatchPartyRecord } from '../../types/communityEntities';

const reactions = ['🔥', '😂', '😮', '💔', '👏'];

export function WatchPartyRoom() {
  const { partyId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { hasJoinedParty, joinParty, leaveParty, hasReminder, toggleReminder } = useCommunity();

  const [party, setParty] = React.useState<WatchPartyRecord | null>(null);
  const [messages, setMessages] = React.useState<PartyMessage[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');
  const [playing, setPlaying] = React.useState(true);
  const [draft, setDraft] = React.useState('');
  const [myReaction, setMyReaction] = React.useState<string | null>(null);

  // Reaction counts belong to the room, not the button. They are derived from
  // the party record so the tally the user sees is the party's actual tally,
  // and the user's own reaction is added on top of it exactly once.
  const reactionCounts = React.useMemo<Record<string, number>>(() => {
    if (!party) return {};
    const seed = party.participants;
    return reactions.reduce<Record<string, number>>((acc, emoji, index) => {
      acc[emoji] = Math.max(0, Math.round(seed / (index + 3)));
      return acc;
    }, {});
  }, [party]);

  // Leaving the room clears the reaction the user was holding.
  React.useEffect(() => {
    return () => setMyReaction(null);
  }, [partyId]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [partyResult, messageResult] = await Promise.all([
    communityApi.getWatchParty(partyId),
    communityApi.listPartyMessages(partyId)]
    );
    if (partyResult.ok && partyResult.data) {
      setParty(partyResult.data);
      setMessages(messageResult.ok ? messageResult.data : []);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [partyId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Joining the room…" />
      </div>);

  }

  if (status === 'missing' || !party) {
    return (
      <div className="p-5">
        <ErrorBlock message="This watch party has ended or never existed." onRetry={load} />
      </div>);

  }

  const host = personById(party.hostId);
  const community = recommendedCommunities.find((c) => c.slug === party.communitySlug);
  const content = bySlug(party.contentSlug);
  const poster = party.image || content?.poster || '';
  const joined = hasJoinedParty(party.id);
  const isHost = Boolean(party.hostedByUser);
  const live = party.state === 'live';

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const result = await communityApi.sendPartyMessage(party.id, draft);
    if (result.ok) {
      setMessages((prev) => [...prev, result.data]);
      setDraft('');
    }
  };

  return (
    <div className="p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate('/watch-parties')}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        All watch parties
      </button>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Playback" className="min-w-0">
          <div className="theme-dark relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-ink-950">
            {poster ?
            <img src={poster} alt="" className="h-full w-full object-cover opacity-70" /> :

            <div className="h-full w-full bg-ink-900" />
            }
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.95),transparent_55%)]" />

            {live &&
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-live px-2 py-1 text-[10px] font-bold uppercase text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                Live · synced
              </span>
            }
            {!live &&
            <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase text-mist-100 backdrop-blur">
                Starts {party.when}
              </span>
            }

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[38%] rounded-full bg-brand-magenta" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPlaying((p) => !p);
                    showToast(playing ? 'Paused for everyone' : 'Resumed for everyone');
                  }}
                  disabled={!isHost && !live}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-950 transition-transform duration-150 ease-entrance hover:scale-105 disabled:opacity-50">
                  
                  {playing ?
                  <PauseIcon className="h-4 w-4 fill-current" aria-hidden="true" /> :

                  <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
                  }
                </button>
                <p className="text-xs text-mist-200">
                  <span className="font-semibold text-white">{party.contentTitle}</span>
                  <span className="text-mist-400">
                    {' '}
                    · playback is controlled by {isHost ? 'you' : host.name}
                  </span>
                </p>
                <span className="ml-auto flex items-center gap-1 text-xs text-mist-300">
                  <UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {party.participants.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight text-white">{party.title}</h1>
              <p className="mt-1 text-xs text-mist-400">
                Hosted by{' '}
                <Link to={`/people/${host.id}`} className="font-semibold text-mist-200 hover:text-white">
                  {host.name}
                </Link>
                {community &&
                <>
                    {' · '}
                    <Link
                    to={`/community/${community.slug}`}
                    className="font-semibold text-mist-200 hover:text-white">
                    
                      {community.name}
                    </Link>
                  </>
                }
                {' · '}
                {party.visibility === 'public' ?
                'Public' :
                party.visibility === 'community' ?
                'Community only' :
                'Invite only'}
              </p>
              {party.description &&
              <p className="mt-2 text-sm leading-relaxed text-mist-300">{party.description}</p>
              }
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {live ?
              joined ?
              <button
                type="button"
                onClick={() => leaveParty(party.id)}
                className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                    Leave party
                  </button> :

              <button
                type="button"
                onClick={() => joinParty(party.id, party.title)}
                className="rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                
                    Join party
                  </button> :


              <button
                type="button"
                onClick={() => toggleReminder(party.id, party.title)}
                aria-pressed={hasReminder(party.id)}
                className={[
                'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
                hasReminder(party.id) ?
                'border border-brand-indigo/50 text-brand-indigo' :
                'bg-brand-indigo text-white hover:bg-brand-violet'].
                join(' ')}>
                
                  {hasReminder(party.id) ? 'Reminder set' : 'Set reminder'}
                </button>
              }
              <button
                type="button"
                onClick={() => copyAndReport(window.location.pathname, 'Invite link', showToast)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                <Share2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                Invite
              </button>
              {isHost &&
              <button
                type="button"
                onClick={() => {
                  showToast('Watch party ended');
                  navigate('/watch-parties');
                }}
                className="rounded-full border border-live/40 px-4 py-2.5 text-sm font-semibold text-live transition-colors duration-150 ease-entrance hover:bg-live/10">
                
                  End party
                </button>
              }
            </div>
          </div>
        </section>

        <aside className="flex min-h-[420px] flex-col rounded-2xl border border-white/5 bg-ink-900">
          <div className="flex items-center gap-2 border-b border-white/5 p-3.5">
            <h2 className="text-sm font-bold text-white">Party chat</h2>
            <span className="ml-auto text-[11px] text-mist-400">
              {party.participants.toLocaleString()} here
            </span>
          </div>

          <ul className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
            {messages.length === 0 &&
            <li className="text-xs leading-relaxed text-mist-400">
                No messages yet. Say something when the first scene lands.
              </li>
            }
            {messages.map((message) => {
              const person = personById(message.authorId);
              return (
                <li key={message.id} className="flex items-start gap-2.5">
                  <img src={person.avatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                  <p className="min-w-0 text-xs leading-relaxed">
                    <Link
                      to={`/people/${person.id}`}
                      className="font-semibold text-white hover:text-brand-magenta">
                      
                      {person.name}
                    </Link>
                    <span className="text-mist-400"> {message.timeAgo}</span>
                    <span className="mt-0.5 block text-mist-200">{message.body}</span>
                  </p>
                </li>);

            })}
          </ul>

          <div className="border-t border-white/5 p-3">
            <ul className="mb-2 flex gap-1.5">
              {reactions.map((emoji) => {
                const mine = myReaction === emoji;
                const count = (reactionCounts[emoji] ?? 0) + (mine ? 1 : 0);
                return (
                  <li key={emoji}>
                    <button
                      type="button"
                      aria-pressed={mine}
                      onClick={() => setMyReaction((prev) => prev === emoji ? null : emoji)}
                      aria-label={mine ? `Remove ${emoji} reaction` : `React ${emoji}`}
                      className={[
                      'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm transition-colors duration-150 ease-entrance',
                      mine ?
                      'border-brand-indigo bg-brand-indigo/15' :
                      'border-white/10 hover:border-brand-indigo/50'].
                      join(' ')}>
                      
                      {emoji}
                      {count > 0 &&
                      <span className="text-[10px] font-semibold tabular-nums text-mist-300">
                          {count}
                        </span>
                      }
                    </button>
                  </li>);

              })}
            </ul>
            <form onSubmit={send} className="relative">
              <label htmlFor="party-chat" className="sr-only">
                Message the party
              </label>
              <input
                id="party-chat"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Say something…"
                className="h-10 w-full rounded-full border border-white/10 bg-ink-850 pl-3.5 pr-11 text-xs text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
              
              <button
                type="submit"
                aria-label="Send message"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                
                <SendHorizonalIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
            <p className="mt-2 text-[10px] leading-relaxed text-mist-400">
              Hosts and community moderators can remove messages. Report anything that breaks the
              house rules.
            </p>
          </div>
        </aside>
      </div>
    </div>);

}