import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3Icon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { recommendedCommunities } from '../../data/communityHub';
import { useApp } from '../../contexts/AppContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../../components/community/StateBlocks';
import type { PollRecord } from '../../types/communityEntities';

export function PollsAndPredictions() {
  const { pathname } = useLocation();
  const mode: 'poll' | 'prediction' = pathname.startsWith('/predictions') ? 'prediction' : 'poll';
  const { showToast } = useApp();
  const { votes, recordVote, hasVoted } = useCommunity();

  const [polls, setPolls] = React.useState<PollRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [draft, setDraft] = React.useState<Record<string, string[]>>({});
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listPolls();
    if (result.ok) {
      setPolls(result.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const visible = polls.filter((p) => p.kind === mode);

  const choose = (poll: PollRecord, optionId: string) =>
  setDraft((prev) => {
    const current = prev[poll.id] ?? [];
    if (poll.multiple) {
      const next = current.includes(optionId) ?
      current.filter((id) => id !== optionId) :
      [...current, optionId].slice(0, 2);
      return { ...prev, [poll.id]: next };
    }
    return { ...prev, [poll.id]: [optionId] };
  });

  const submit = async (poll: PollRecord) => {
    const selection = draft[poll.id] ?? [];
    setBusy(poll.id);
    const result = await communityApi.vote(poll.id, selection);
    setBusy(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setPolls((prev) => prev.map((p) => p.id === poll.id ? result.data : p));
    recordVote(poll.id, selection);
    showToast(mode === 'prediction' ? 'Prediction submitted' : 'Vote counted');
  };

  return (
    <div className="mx-auto max-w-3xl p-4 pb-12 sm:p-5">
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          HavaVerse Community
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          {mode === 'prediction' ? 'Predictions' : 'Polls'}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-mist-400">
          {mode === 'prediction' ?
          'Call the match, the ending or the award — attached to the thing you are watching.' :
          'Fan votes that reach the people who make the work.'}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            to="/polls"
            className={[
            'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-entrance',
            mode === 'poll' ? 'bg-brand-indigo text-white' : 'border border-white/15 text-mist-300 hover:text-white'].
            join(' ')}>
            
            Polls
          </Link>
          <Link
            to="/predictions"
            className={[
            'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-entrance',
            mode === 'prediction' ? 'bg-brand-indigo text-white' : 'border border-white/15 text-mist-300 hover:text-white'].
            join(' ')}>
            
            Predictions
          </Link>
        </div>
      </header>

      {status === 'loading' && <SkeletonRows rows={3} />}
      {status === 'error' && <ErrorBlock message="Could not load this." onRetry={load} />}

      {status === 'ready' && (
      visible.length === 0 ?
      <EmptyBlock
        icon={<BarChart3Icon className="h-6 w-6" />}
        title="Nothing open right now"
        body="New questions appear as communities and creators post them." /> :


      <ul className="space-y-4">
            {visible.map((poll) => {
          const community = recommendedCommunities.find((c) => c.slug === poll.communitySlug);
          const voted = hasVoted(poll.id);
          const selection = votes[poll.id] ?? draft[poll.id] ?? [];
          const closed = poll.state === 'closed';

          return (
            <li key={poll.id} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-magenta">
                    {poll.kind === 'prediction' ? 'Prediction' : 'Poll'} · {poll.context}
                  </p>
                  <h2 className="mt-1 text-base font-bold text-white">{poll.question}</h2>

                  <fieldset className="mt-3 space-y-2" disabled={closed || voted}>
                    <legend className="sr-only">{poll.question}</legend>
                    {poll.options.map((option) => {
                  const chosen = selection.includes(option.id);
                  return (
                    <label key={option.id} className={closed || voted ? 'block' : 'block cursor-pointer'}>
                          <input
                        type={poll.multiple ? 'checkbox' : 'radio'}
                        name={poll.id}
                        checked={chosen}
                        onChange={() => choose(poll, option.id)}
                        className="sr-only" />
                      
                          <span className="flex items-baseline justify-between text-xs">
                            <span className={chosen ? 'font-semibold text-white' : 'text-mist-200'}>
                              {option.label}
                            </span>
                            <span className="font-semibold tabular-nums text-white">
                              {option.share}%
                            </span>
                          </span>
                          <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <span
                          className={[
                          'block h-full rounded-full transition-[width] duration-200 ease-entrance',
                          chosen ? 'bg-brand-magenta' : 'bg-brand-indigo'].
                          join(' ')}
                          style={{ width: `${option.share}%` }} />
                        
                          </span>
                        </label>);

                })}
                  </fieldset>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!closed && !voted &&
                <button
                  type="button"
                  disabled={selection.length === 0 || busy === poll.id}
                  onClick={() => submit(poll)}
                  className="rounded-lg bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
                  
                        {busy === poll.id ?
                  'Submitting…' :
                  poll.kind === 'prediction' ?
                  'Submit prediction' :
                  'Vote'}
                      </button>
                }
                    {voted &&
                <span className="rounded-lg bg-brand-cyan/15 px-3 py-2 text-[11px] font-semibold text-brand-cyan">
                        Your answer is recorded
                      </span>
                }
                    {closed &&
                <span className="rounded-lg bg-white/5 px-3 py-2 text-[11px] font-semibold text-mist-300">
                        Closed
                      </span>
                }
                    <span className="text-[11px] text-mist-400">
                      {poll.participants.toLocaleString()} participants · {poll.closes}
                    </span>
                    {community &&
                <Link
                  to={`/community/${community.slug}`}
                  className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
                  
                        {community.name} →
                      </Link>
                }
                  </div>

                  {poll.resultNote &&
              <p className="mt-2 rounded-lg border border-white/5 bg-ink-850 px-3 py-2 text-[11px] text-mist-200">
                      {poll.resultNote}
                    </p>
              }
                </li>);

        })}
          </ul>)
      }

      {mode === 'prediction' &&
      <p className="mt-5 rounded-xl border border-white/5 bg-ink-900 px-3.5 py-3 text-[11px] leading-relaxed text-mist-300">
          Community prediction. No monetary stake, no payout, no wagering. Anything involving real
          money would be a separate, jurisdiction-specific product.
        </p>
      }
    </div>);

}