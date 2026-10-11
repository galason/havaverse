import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, PlayIcon, UsersIcon } from 'lucide-react';
import { fixtures, IMAGES } from '../data/catalog';
import { fanTake, highlights, matchEvents, matchStats, standings } from '../data/sports';
import { castPrediction } from '../services/communityApi';

const eventTone: Record<string, string> = {
  goal: 'bg-brand-cyan text-ink-950',
  card: 'bg-brand-amber text-ink-950',
  sub: 'bg-white/15 text-white',
  var: 'bg-white/15 text-white'
};

export function Sports() {
  const [tab, setTab] = React.useState<'events' | 'stats'>('events');

  // The fan take is a real single-choice prediction. The vote is written
  // through the prediction service, the distribution is recomputed from the
  // returned participant count rather than nudged locally, and a fan can
  // change their pick but cannot vote twice.
  const [voted, setVoted] = React.useState<string | null>(null);
  const [voting, setVoting] = React.useState(false);
  const [voteError, setVoteError] = React.useState('');
  const [participants, setParticipants] = React.useState(38_204);

  const shares = React.useMemo(() => {
    if (!voted) return fanTake.options;
    const total = participants;
    return fanTake.options.map((option) => {
      const base = Math.round(option.share / 100 * (total - 1));
      const votes = base + (option.id === voted ? 1 : 0);
      return { ...option, share: Math.round(votes / total * 100) };
    });
  }, [voted, participants]);

  async function castVote(optionId: string) {
    if (voted === optionId) return;
    setVoting(true);
    setVoteError('');
    const result = await castPrediction('fan-take-arsenal-city', optionId);
    setVoting(false);
    if (!result.ok) {
      setVoteError(result.error);
      return;
    }
    setParticipants(result.data.participants);
    setVoted(optionId);
  }

  return (
    <div className="p-5">
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          HavaVerse Live · Sports
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Match centre</h1>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <section
            aria-label="Live match"
            className="overflow-hidden rounded-2xl border border-live/30 bg-ink-900">
            
            <div className="relative h-64">
              <img src={IMAGES.stadium} alt="" className="h-full w-full object-cover opacity-45" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-900)/0.98),rgb(var(--c-ink-900)/0.35))]" />

              <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-4">
                <span className="flex items-center gap-1.5 rounded bg-live px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                  Live
                </span>
                <span className="text-[11px] font-medium text-mist-200">
                  Premier League · Emirates Stadium
                </span>
                <span className="ml-auto text-[11px] text-mist-300">Matchday 33</span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center justify-center gap-8">
                  <p className="flex-1 text-right text-lg font-bold text-white">Arsenal</p>
                  <p className="font-display text-6xl tracking-wider text-white">1 – 1</p>
                  <p className="flex-1 text-lg font-bold text-white">Man City</p>
                </div>
                <p className="mt-1 text-center text-sm font-semibold text-live">62'</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link
                    to="/watch/rising-eagles"
                    className="flex items-center gap-2 rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                    
                    <PlayIcon className="h-4 w-4 fill-current" aria-hidden="true" />
                    Watch live
                  </Link>
                  <Link
                    to="/community/super-eagles"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
                    
                    <UsersIcon className="h-4 w-4" aria-hidden="true" />
                    Join watch party
                  </Link>
                </div>
              </div>
            </div>

            <div role="tablist" aria-label="Match detail" className="flex gap-1 border-b border-white/5 px-3 pt-3">
              {(['events', 'stats'] as const).map((key) =>
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={[
                'rounded-t-lg px-4 py-2 text-xs font-semibold capitalize transition-colors duration-150 ease-entrance',
                tab === key ?
                'bg-white/5 text-white' :
                'text-mist-400 hover:text-white'].
                join(' ')}>
                
                  {key === 'events' ? 'Key events' : 'Statistics'}
                </button>
              )}
            </div>

            {tab === 'events' ?
            <ol className="divide-y divide-white/5">
                {matchEvents.map((event) =>
              <li key={event.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-9 shrink-0 text-xs font-semibold tabular-nums text-mist-400">
                      {event.minute}
                    </span>
                    <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${eventTone[event.type]}`}>
                  
                      {event.type}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-mist-200">
                      {event.text}
                    </span>
                    <span className="shrink-0 text-[11px] text-mist-400">
                      {event.team === 'home' ? 'ARS' : 'MCI'}
                    </span>
                  </li>
              )}
              </ol> :

            <ul className="space-y-3 p-4">
                {matchStats.map((stat) => {
                const total = stat.home + stat.away || 1;
                return (
                  <li key={stat.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="w-10 font-semibold tabular-nums text-white">
                          {stat.home}
                          {stat.unit}
                        </span>
                        <span className="text-mist-400">{stat.label}</span>
                        <span className="w-10 text-right font-semibold tabular-nums text-white">
                          {stat.away}
                          {stat.unit}
                        </span>
                      </div>
                      <div className="mt-1.5 flex h-1 gap-0.5 overflow-hidden rounded-full">
                        <div
                        className="rounded-l-full bg-brand-indigo"
                        style={{ width: `${stat.home / total * 100}%` }} />
                      
                        <div
                        className="flex-1 rounded-r-full bg-brand-magenta"
                        style={{ width: `${stat.away / total * 100}%` }} />
                      
                      </div>
                    </li>);

              })}
              </ul>
            }
          </section>

          <section aria-labelledby="standings-heading">
            <h2 id="standings-heading" className="mb-3 text-lg font-bold tracking-tight text-white">
              Premier League table
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Premier League standings, top six</caption>
                <thead className="bg-ink-850 text-[11px] uppercase tracking-[0.1em] text-mist-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">#</th>
                    <th scope="col" className="px-2 py-3 font-semibold">Club</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">P</th>
                    <th scope="col" className="hidden px-2 py-3 text-right font-semibold sm:table-cell">W</th>
                    <th scope="col" className="hidden px-2 py-3 text-right font-semibold sm:table-cell">D</th>
                    <th scope="col" className="hidden px-2 py-3 text-right font-semibold sm:table-cell">L</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">GD</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-ink-900">
                  {standings.map((row) =>
                  <tr key={row.club} className={row.highlight ? 'bg-brand-indigo/10' : undefined}>
                      <td className="px-4 py-2.5 text-xs tabular-nums text-mist-400">
                        {row.position}
                      </td>
                      <th scope="row" className="px-2 py-2.5 font-medium text-white">
                        {row.club}
                      </th>
                      <td className="px-2 py-2.5 text-right text-xs tabular-nums text-mist-300">
                        {row.played}
                      </td>
                      <td className="hidden px-2 py-2.5 text-right text-xs tabular-nums text-mist-300 sm:table-cell">
                        {row.won}
                      </td>
                      <td className="hidden px-2 py-2.5 text-right text-xs tabular-nums text-mist-300 sm:table-cell">
                        {row.drawn}
                      </td>
                      <td className="hidden px-2 py-2.5 text-right text-xs tabular-nums text-mist-300 sm:table-cell">
                        {row.lost}
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs tabular-nums text-mist-300">
                        {row.goalDifference > 0 ? '+' : ''}
                        {row.goalDifference}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-bold tabular-nums text-white">
                        {row.points}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="highlights-heading">
            <h2 id="highlights-heading" className="mb-3 text-lg font-bold tracking-tight text-white">
              Highlights &amp; analysis
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((clip) =>
              <li key={clip.id}>
                  <Link
                  to="/watch/rising-eagles"
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-ink-900 transition-colors duration-150 ease-entrance hover:border-white/15">
                  
                    <span className="relative block aspect-video overflow-hidden">
                      <img
                      src={clip.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.04]" />
                    
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {clip.duration}
                      </span>
                    </span>
                    <span className="flex flex-1 flex-col p-3">
                      <span className="text-sm font-semibold leading-snug text-white">
                        {clip.title}
                      </span>
                      <span className="mt-auto pt-2 text-[11px] text-mist-400">{clip.meta}</span>
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">Fixtures</h2>
            <ul className="mt-3 divide-y divide-white/5">
              {fixtures.map((fixture) =>
              <li key={fixture.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {fixture.homeTeam} v {fixture.awayTeam}
                    </span>
                    <span className="block truncate text-[11px] text-mist-400">
                      {fixture.competition}
                    </span>
                  </span>
                  <span
                  className={
                  fixture.isLive ?
                  'shrink-0 text-xs font-bold text-live' :
                  'shrink-0 text-[11px] text-mist-300'
                  }>
                  
                    {fixture.isLive ? `${fixture.homeScore}–${fixture.awayScore}` : fixture.kickoff}
                  </span>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="text-sm font-bold text-white">{fanTake.question}</h2>
            <p className="mt-0.5 text-[11px] text-mist-400">
              {participants.toLocaleString()} predictions
            </p>
            <ul className="mt-3 space-y-2.5">
              {shares.map((option) =>
              <li key={option.id}>
                  <button
                  type="button"
                  disabled={voting}
                  aria-pressed={voted === option.id}
                  onClick={() => castVote(option.id)}
                  className="block w-full text-left transition-opacity duration-150 ease-entrance hover:opacity-80 disabled:opacity-60">
                  
                    <span className="flex items-baseline justify-between text-xs">
                      <span className={voted === option.id ? 'font-semibold text-white' : 'text-mist-200'}>
                        {option.label}
                        {voted === option.id && ' · your pick'}
                      </span>
                      <span className="font-semibold tabular-nums text-white">{option.share}%</span>
                    </span>
                    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <span
                      className={`block h-full rounded-full ${
                      voted === option.id ? 'bg-brand-indigo' : 'bg-brand-cyan'}`
                      }
                      style={{ width: `${option.share}%` }} />
                    
                    </span>
                  </button>
                </li>
              )}
            </ul>
            {voteError &&
            <p role="alert" className="mt-2 text-[11px] font-semibold text-live">
                {voteError}
              </p>
            }
            <p className="mt-3 text-[10px] leading-relaxed text-mist-400">
              {voted ?
              'Your prediction is recorded. One per fan — tap another option to change it.' :
              'Predictions are for fun and carry no stake or payout.'}
            </p>
          </section>

          <Link
            to="/community/super-eagles"
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-900 p-4 transition-colors duration-150 ease-entrance hover:border-white/15">
            
            <img src={IMAGES.eagles} alt="" className="h-11 w-11 rounded-lg object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">Super Eagles</span>
              <span className="block truncate text-[11px] text-mist-400">
                206K members · 5,911 online
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>);

}