import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  LoaderIcon,
  SendHorizonalIcon,
  ShieldCheckIcon,
  SparklesIcon } from
'lucide-react';
import { directorApi } from '../../services/directorApi';
import { formatNaira, useDirector } from '../../contexts/DirectorContext';

const scopeLabel: Record<string, string> = {
  shot: 'Shot',
  scene: 'Scene',
  sequence: 'Sequence',
  character: 'Character',
  world: 'World',
  film: 'Whole film'
};

/**
 * Layer 1 (what you want) → Layer 2 (what HavaVerse understood) → Layer 3
 * (what will actually run). Nothing executes until the plan is accepted.
 */
export function DirectorConsole() {
  const {
    plan,
    interpret,
    interpreting,
    commandError,
    applyPlan,
    applying,
    dismissPlan,
    project
  } = useDirector();
  const [command, setCommand] = React.useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (command.trim()) interpret(command);
  };

  const shotRows = plan?.affected.filter((a) => a.kind === 'shot') ?? [];
  const otherRows = plan?.affected.filter((a) => a.kind !== 'shot') ?? [];

  return (
    <section
      aria-labelledby="direct-heading"
      className="rounded-2xl border border-brand-indigo/25 bg-ink-900 p-4 sm:p-5">
      
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-indigo/20 ring-1 ring-brand-indigo/40">
          <SparklesIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="direct-heading" className="text-base font-bold text-white">
            Direct the production
          </h2>
          <p className="text-[11px] text-mist-400">
            Say what you want changed. You see what it touches before anything runs.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="relative mt-4">
        <label htmlFor="director-intent" className="sr-only">
          Describe what you want changed
        </label>
        <textarea
          id="director-intent"
          rows={3}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Make scene 23 more tense — hold on Amara and let the score drop out."
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-3.5 pr-12 text-sm leading-relaxed text-white outline-none transition-colors duration-150 ease-entrance placeholder:text-mist-400 focus:border-brand-indigo/60" />
        
        <button
          type="submit"
          disabled={interpreting || command.trim().length === 0}
          aria-label="Analyse this direction"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-indigo text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
          
          {interpreting ?
          <LoaderIcon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> :

          <SendHorizonalIcon className="h-3.5 w-3.5" aria-hidden="true" />
          }
        </button>
      </form>

      {!plan && !interpreting &&
      <ul className="mt-3 flex flex-wrap gap-1.5">
          {directorApi.examples.map((example) =>
        <li key={example}>
              <button
            type="button"
            onClick={() => {
              setCommand(example);
              interpret(example);
            }}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-mist-300 transition-colors duration-150 ease-entrance hover:border-brand-indigo/50 hover:text-white">
            
                {example}
              </button>
            </li>
        )}
        </ul>
      }

      {interpreting &&
      <p className="mt-3 flex items-center gap-2 text-xs text-mist-300" role="status">
          <LoaderIcon className="h-3.5 w-3.5 animate-spin text-brand-indigo" aria-hidden="true" />
          Reading the Story Bible and working out what this touches…
        </p>
      }

      {commandError &&
      <p
        className="mt-3 flex items-start gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber/5 p-3 text-xs leading-relaxed text-brand-amber"
        role="alert">
        
          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {commandError}
        </p>
      }

      {plan &&
      <div className="mt-4 rounded-2xl border border-white/10 bg-ink-850 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-indigo/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-indigo">
              {plan.blocked ? 'Rule conflict' : plan.stateChange ? 'Film state change' : `${scopeLabel[plan.scope]} change`}
            </span>
            <span className="text-[11px] text-mist-400">
              {plan.agents.length} {plan.agents.length === 1 ? 'agent' : 'agents'} ·{' '}
              {plan.affected.length} entities
            </span>
          </div>

          <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-mist-400">
            What HavaVerse understood
          </h3>
          <ul className="mt-1.5 space-y-1">
            {plan.interpretation.map((line) =>
          <li key={line} className="text-sm text-mist-200">
                {line}
              </li>
          )}
          </ul>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-mist-400">
                Changing
              </h3>
              <ul className="mt-1.5 space-y-1.5">
                {[...shotRows, ...otherRows].slice(0, 8).map((entry) =>
              <li key={entry.id} className="text-xs text-mist-200">
                    <span className="font-semibold text-white">{entry.label}</span> — {entry.change}
                  </li>
              )}
                {plan.affected.length > 8 &&
              <li className="text-xs text-mist-400">
                    and {plan.affected.length - 8} more
                  </li>
              }
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mist-400">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
                Keeping
              </h3>
              <ul className="mt-1.5 space-y-1.5">
                {plan.protected.map((item) =>
              <li key={item} className="text-xs text-mist-200">
                    {item}
                  </li>
              )}
              </ul>
            </div>
          </div>

          {plan.blocked &&
        <div className="mt-4 rounded-xl border border-live/30 bg-live/[0.06] p-3" role="alert">
              <p className="flex items-center gap-2 text-xs font-semibold text-white">
                <AlertTriangleIcon className="h-3.5 w-3.5 text-live" aria-hidden="true" />
                Refused — this contradicts the Director’s plan
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-mist-300">{plan.blocked.reason}</p>
              <Link
            to={`/studio/rules#${plan.blocked.rules[0].id}`}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white hover:text-brand-indigo">
            
                Open the rule
                <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
        }

          {plan.stateChange &&
        <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
              Applying writes film state v{plan.stateChange.toVersion}. Only shots whose render depends on what
              changed are regenerated; each keeps its previous version.
            </p>
        }

          {plan.warning &&
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber/5 p-3 text-[11px] leading-relaxed text-brand-amber">
              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {plan.warning}
            </p>
        }

          {!plan.blocked &&
        <p className="mt-3 text-[11px] text-mist-400">
              Estimated {Math.round(plan.estimatedSeconds[0] / 60) || 1}–
              {Math.round(plan.estimatedSeconds[1] / 60) || 2} minutes ·{' '}
              {plan.estimatedCostKobo === 0 ? 'no generation cost' : formatNaira(plan.estimatedCostKobo)}
              {project && ` · ${formatNaira(project.creditsRemaining)} credits remaining`}
            </p>
        }

          <div className="mt-3 flex flex-wrap gap-2">
            {!plan.blocked &&
          <button
            type="button"
            onClick={applyPlan}
            disabled={applying}
            className="rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
            
                {applying ?
            'Dispatching…' :
            plan.stateChange ?
            `Write state v${plan.stateChange.toVersion}${plan.affected.length > 0 ? ` · regenerate ${plan.affected.length}` : ''}` :
            plan.estimatedCostKobo === 0 ?
            'Run audit' :
            'Apply changes'}
              </button>
          }
            <button
            type="button"
            onClick={dismissPlan}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Discard
            </button>
            <Link
            to="/studio/jobs"
            className="ml-auto flex items-center gap-1 self-center text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
              Job queue
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      }
    </section>);

}