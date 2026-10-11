import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3Icon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { useApp } from '../../contexts/AppContext';
import { useCommunity } from '../../contexts/CommunityContext';
import { SectionHeader } from './SectionHeader';
import { ErrorBlock, SkeletonRows } from './StateBlocks';
import type { PollRecord } from '../../types/communityEntities';

export function PredictionsPolls() {
  const { showToast } = useApp();
  const { votes, recordVote, hasVoted } = useCommunity();
  const [polls, setPolls] = React.useState<PollRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [draft, setDraft] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listPolls();
    if (result.ok) {
      setPolls(result.data.filter((p) => p.state === 'open').slice(0, 3));
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const submit = async (poll: PollRecord) => {
    const choice = draft[poll.id];
    if (!choice) return;
    setBusy(poll.id);
    const result = await communityApi.vote(poll.id, [choice]);
    setBusy(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setPolls((prev) => prev.map((p) => p.id === poll.id ? result.data : p));
    recordVote(poll.id, [choice]);
    showToast(poll.kind === 'prediction' ? 'Prediction submitted' : 'Vote counted');
  };

  return (
    <section
      aria-labelledby="predictions-polls"
      className="flex flex-col rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <SectionHeader
        id="predictions-polls"
        title="Predictions & polls"
        subtitle="Fan calls on matches, endings and what gets made next"
        icon={<BarChart3Icon className="h-5 w-5 text-brand-amber" aria-hidden="true" />}
        actionTo="/polls" />
      

      {status === 'loading' && <SkeletonRows rows={2} />}
      {status === 'error' && <ErrorBlock message="Could not load this." onRetry={load} />}

      {status === 'ready' &&
      <ul className="space-y-3">
          {polls.map((poll) => {
          const voted = hasVoted(poll.id);
          const selection = votes[poll.id]?.[0] ?? draft[poll.id];
          return (
            <li key={poll.id} className="rounded-xl border border-white/5 bg-ink-850 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-magenta">
                  {poll.kind === 'prediction' ? 'Prediction' : 'Poll'} · {poll.context}
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-white">{poll.question}</h3>

                <fieldset className="mt-2.5 space-y-2" disabled={voted}>
                  <legend className="sr-only">{poll.question}</legend>
                  {poll.options.map((option) => {
                  const selected = selection === option.id;
                  return (
                    <label key={option.id} className={voted ? 'block' : 'block cursor-pointer'}>
                        <input
                        type="radio"
                        name={poll.id}
                        checked={selected}
                        onChange={() => setDraft((prev) => ({ ...prev, [poll.id]: option.id }))}
                        className="sr-only" />
                      
                        <span className="flex items-baseline justify-between text-xs">
                          <span className={selected ? 'font-semibold text-white' : 'text-mist-200'}>
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
                          selected ? 'bg-brand-magenta' : 'bg-brand-indigo'].
                          join(' ')}
                          style={{ width: `${option.share}%` }} />
                        
                        </span>
                      </label>);

                })}
                </fieldset>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {voted ?
                <span className="rounded-lg bg-brand-cyan/15 px-3 py-2 text-[11px] font-semibold text-brand-cyan">
                      Answer recorded
                    </span> :

                <button
                  type="button"
                  disabled={!selection || busy === poll.id}
                  onClick={() => submit(poll)}
                  className="rounded-lg bg-brand-indigo px-3.5 py-2 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
                  
                      {busy === poll.id ?
                  'Submitting…' :
                  poll.kind === 'prediction' ?
                  'Submit prediction' :
                  'Vote'}
                    </button>
                }
                  <span className="text-[11px] text-mist-400">
                    {poll.participants.toLocaleString()} · {poll.closes}
                  </span>
                </div>
              </li>);

        })}
        </ul>
      }

      <div className="mt-3 flex items-center gap-3">
        <Link
          to="/predictions"
          className="text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          All predictions →
        </Link>
        <Link
          to="/polls"
          className="text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          All polls →
        </Link>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-mist-400">
        Community prediction. No monetary stake, no payout, no wagering.
      </p>
    </section>);

}