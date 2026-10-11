import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowUpIcon, PinIcon, Share2Icon, SparklesIcon } from 'lucide-react';
import {
  attendanceFor,
  communityApi,
  setAttendance,
  type AttendanceStatus } from
'../../services/communityApi';
import { copyAndReport } from '../../utils/share';
import { personById } from '../../data/communityPeople';
import { recommendedCommunities } from '../../data/communityHub';
import { useApp } from '../../contexts/AppContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { JoinButton } from '../../components/community/JoinButton';
import { OriginTag } from '../../components/community/OriginTag';
import type { CommunityEventRecord, QAQuestion } from '../../types/communityEntities';

export function EventDetail() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { hasReminder, toggleReminder, questionVotes, toggleQuestionVote } = useCommunity();

  const [event, setEvent] = React.useState<CommunityEventRecord | null>(null);
  const [questions, setQuestions] = React.useState<QAQuestion[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');
  const [draft, setDraft] = React.useState('');
  const [asking, setAsking] = React.useState(false);
  const [attending, setAttending] = React.useState<AttendanceStatus>('none');
  const [pending, setPending] = React.useState<AttendanceStatus>('none');
  const [savingAttendance, setSavingAttendance] = React.useState(false);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [eventResult, questionResult] = await Promise.all([
    communityApi.getEvent(eventId),
    communityApi.listQuestions(eventId)]
    );
    if (eventResult.ok && eventResult.data) {
      setEvent(eventResult.data);
      setQuestions(questionResult.ok ? questionResult.data : []);
      setAttending(attendanceFor(eventResult.data.id));
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [eventId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading event…" />
      </div>);

  }

  if (status === 'missing' || !event) {
    return (
      <div className="p-5">
        <ErrorBlock message="That event is no longer listed." onRetry={load} />
      </div>);

  }

  const host = personById(event.hostId);
  const community = recommendedCommunities.find((c) => c.slug === event.communitySlug);
  const isQA = event.kind === 'Creator Q&A';

  const ask = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (!draft.trim()) return;
    setAsking(true);
    const result = await communityApi.askQuestion(event.id, draft);
    setAsking(false);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setQuestions((prev) => [...prev, result.data]);
    setDraft('');
    showToast('Question submitted');
  };

  // Attendance is written through the service and only reflected in the UI
  // once it comes back, so a refusal (ended event, capacity) never shows as
  // a successful RSVP.
  const respond = async (next: AttendanceStatus) => {
    setPending(next === 'none' ? attending : next);
    setSavingAttendance(true);
    const result = await setAttendance(event.id, next);
    setSavingAttendance(false);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setAttending(result.data);
    showToast(
      result.data === 'going' ?
      `You're going to ${event.name}` :
      result.data === 'maybe' ?
      `Marked as maybe for ${event.name}` :
      'Removed from your events'
    );
  };

  const sorted = [...questions].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const aVotes = a.votes + (questionVotes.includes(a.id) ? 1 : 0);
    const bVotes = b.votes + (questionVotes.includes(b.id) ? 1 : 0);
    return bVotes - aVotes;
  });

  return (
    <article className="pb-12">
      <div className="relative h-48 w-full overflow-hidden sm:h-60">
        <img src={event.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_10%,rgb(var(--c-ink-950)/0.35)_100%)]" />
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors duration-150 ease-entrance hover:bg-black/80">
          
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Events
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-5">
        <header className="-mt-10 relative">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-200">
              {event.kind}
            </span>
            {event.state === 'live' &&
            <span className="flex items-center gap-1 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                Live
              </span>
            }
            <OriginTag origin="official" label="Hosted on HavaVerse" />
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {event.name}
          </h1>
          <p className="mt-1.5 text-sm text-mist-400">
            {event.when} · {event.attendees}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-200">
            {event.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {event.watchPartyId ?
            <Link
              to={`/watch-parties/${event.watchPartyId}`}
              className="rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
                {event.state === 'live' ? 'Join watch party' : 'Open watch party'}
              </Link> :

            <div className="flex items-center gap-1.5" role="group" aria-label="Your attendance">
                {(
              [
              { value: 'going', label: attending === 'going' ? 'Going' : 'Attend' },
              { value: 'maybe', label: 'Maybe' }] as
              const).
              map((option) =>
              <button
                key={option.value}
                type="button"
                disabled={savingAttendance}
                aria-pressed={attending === option.value}
                onClick={() =>
                respond(attending === option.value ? 'none' : option.value)
                }
                className={[
                'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance disabled:opacity-60',
                attending === option.value ?
                'bg-brand-indigo text-white hover:bg-brand-violet' :
                'border border-white/15 text-mist-200 hover:text-white'].
                join(' ')}>
                
                    {savingAttendance && pending === option.value ? 'Saving…' : option.label}
                  </button>
              )}
              </div>
            }
            <button
              type="button"
              onClick={() => toggleReminder(event.id, event.name)}
              aria-pressed={hasReminder(event.id)}
              className={[
              'rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
              hasReminder(event.id) ?
              'border-brand-indigo/50 text-brand-indigo' :
              'border-white/15 text-mist-200 hover:text-white'].
              join(' ')}>
              
              {hasReminder(event.id) ? 'Reminder set' : 'Set reminder'}
            </button>
            <button
              type="button"
              onClick={() => copyAndReport(window.location.pathname, 'Event link', showToast)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
              
              <Share2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              Share
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
            {isQA &&
            <section
              aria-labelledby="qa-heading"
              className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              
                <h2 id="qa-heading" className="text-base font-bold text-white">
                  Questions for {host.name}
                </h2>
                <p className="mt-1 flex items-start gap-2 text-[11px] leading-relaxed text-mist-400">
                  <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-indigo" aria-hidden="true" />
                  Hava AI may help organise questions and summarise responses. It does not invent
                  official story canon.
                </p>

                <form onSubmit={ask} className="mt-3">
                  <label htmlFor="qa-question" className="sr-only">
                    Ask a question
                  </label>
                  <textarea
                  id="qa-question"
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about the film, the universe or the process…"
                  className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-3 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
                
                  <button
                  type="submit"
                  disabled={asking || !draft.trim()}
                  className="mt-2 rounded-lg bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
                  
                    {asking ? 'Submitting…' : 'Ask question'}
                  </button>
                </form>

                <ul className="mt-4 space-y-2.5">
                  {sorted.map((question) => {
                  const asker = personById(question.authorId);
                  const voted = questionVotes.includes(question.id);
                  return (
                    <li
                      key={question.id}
                      className={[
                      'rounded-xl border p-3',
                      question.pinned ?
                      'border-brand-indigo/40 bg-brand-indigo/5' :
                      'border-white/5 bg-ink-850'].
                      join(' ')}>
                      
                        <div className="flex items-start gap-3">
                          <button
                          type="button"
                          aria-pressed={voted}
                          onClick={() => toggleQuestionVote(question.id)}
                          className={[
                          'flex w-12 shrink-0 flex-col items-center rounded-lg border py-1.5 transition-colors duration-150 ease-entrance',
                          voted ?
                          'border-brand-indigo bg-brand-indigo/15 text-brand-indigo' :
                          'border-white/10 text-mist-300 hover:text-white'].
                          join(' ')}>
                          
                            <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="text-[11px] font-semibold tabular-nums">
                              {question.votes + (voted ? 1 : 0)}
                            </span>
                          </button>
                          <div className="min-w-0 flex-1">
                            {question.pinned &&
                          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-indigo">
                                <PinIcon className="h-3 w-3" aria-hidden="true" />
                                Answered
                              </p>
                          }
                            <p className="text-sm leading-relaxed text-white">{question.body}</p>
                            <p className="mt-1 text-[11px] text-mist-400">
                              Asked by{' '}
                              <Link to={`/people/${asker.id}`} className="hover:text-white">
                                {asker.name}
                              </Link>
                            </p>
                            {question.answer &&
                          <div className="mt-2 rounded-lg border border-brand-magenta/25 bg-ink-900 p-2.5">
                                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-magenta">
                                  <OriginTag origin="creator" />
                                  {host.name}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-mist-200">
                                  {question.answer}
                                </p>
                              </div>
                          }
                          </div>
                        </div>
                      </li>);

                })}
                </ul>
              </section>
            }

            {!isQA &&
            <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                <h2 className="text-base font-bold text-white">About this event</h2>
                <p className="mt-2 text-sm leading-relaxed text-mist-300">{event.description}</p>
                {event.relatedContentSlug &&
              <Link
                to={`/title/${event.relatedContentSlug}`}
                className="mt-3 inline-block text-xs font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
                
                    Open the related title →
                  </Link>
              }
              </section>
            }
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 className="text-sm font-bold text-white">Host</h2>
              <Link to={`/people/${host.id}`} className="mt-3 flex items-center gap-3">
                <img src={host.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-white">{host.name}</span>
                  <span className="block truncate text-[11px] text-mist-400">{host.role}</span>
                </span>
              </Link>
            </section>

            {community &&
            <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                <h2 className="text-sm font-bold text-white">Community</h2>
                <Link
                to={`/community/${community.slug}`}
                className="mt-3 flex items-center gap-3">
                
                  <img src={community.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">
                      {community.name}
                    </span>
                    <span className="block truncate text-[11px] text-mist-400">
                      {community.members} members
                    </span>
                  </span>
                </Link>
                <div className="mt-3">
                  <JoinButton slug={community.slug} name={community.name} full />
                </div>
              </section>
            }
          </aside>
        </div>
      </div>
    </article>);

}