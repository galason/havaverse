import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowRightIcon, CheckIcon, LockIcon, XIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import type { PublicationGate } from '../../types/director';

/**
 * FR-12 / FR-13: rights, continuity and quality evaluated side by side, each
 * blocker with its own way forward. Advisory rights issues stay visible but
 * never hold the gate.
 */
export function PublicationGatePanel({ gate }: {gate: PublicationGate;}) {
  const { rights, resolveRights, pending } = useDirector();
  const failed = gate.conditions.filter((c) => !c.passed);
  const blockingRight = rights.find((r) => r.severity === 'blocking' && !r.resolved);
  const advisories = rights.filter((r) => r.severity === 'advisory' && !r.resolved);
  const issueCount = failed.reduce((n, c) => n + Math.max(1, c.issues.length), 0);

  return (
    <section
      aria-labelledby="gate-heading"
      className={`rounded-2xl border p-4 ${gate.allowed ? 'border-brand-cyan/25 bg-ink-900' : 'border-live/30 bg-live/[0.04]'}`}>
      
      <h2 id="gate-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
        Publication gate
      </h2>
      <p className={`mt-1.5 flex items-center gap-2 text-sm font-bold ${gate.allowed ? 'text-brand-cyan' : 'text-white'}`}>
        {gate.allowed ?
        <CheckIcon className="h-4 w-4" aria-hidden="true" /> :

        <AlertTriangleIcon className="h-4 w-4 text-live" aria-hidden="true" />
        }
        {gate.allowed ? 'Cleared for publish' : `Blocked · ${issueCount} ${issueCount === 1 ? 'issue' : 'issues'}`}
      </p>

      <ul className="mt-3 space-y-3">
        {gate.conditions.map((condition) =>
        <li key={condition.key}>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
              {condition.passed ?
            <CheckIcon className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" /> :

            <XIcon className="h-3.5 w-3.5 text-live" aria-hidden="true" />
            }
              {condition.label}
              <span className="ml-auto font-normal text-mist-400">{condition.detail}</span>
            </p>
            {!condition.passed && condition.issues.length > 0 &&
          <ul className="mt-1 space-y-0.5 pl-5">
                {condition.issues.slice(0, 3).map((issue) =>
            <li key={issue} className="text-[11px] leading-relaxed text-mist-300">
                    {issue}
                  </li>
            )}
                {condition.issues.length > 3 &&
            <li className="text-[10px] text-mist-400">+{condition.issues.length - 3} more</li>
            }
              </ul>
          }
          </li>
        )}
      </ul>

      {(blockingRight || failed.some((c) => c.key === 'continuity')) &&
      <div className="mt-4 grid grid-cols-2 gap-2">
          {blockingRight &&
        <button
          type="button"
          onClick={() => resolveRights(blockingRight.id)}
          disabled={pending === `rights:${blockingRight.id}`}
          title={blockingRight.resolution}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5 disabled:text-mist-400">
          
              <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {pending === `rights:${blockingRight.id}` ? 'Attaching…' : 'Attach licence'}
            </button>
        }
          {failed.some((c) => c.key === 'continuity') &&
        <Link
          to="/studio/continuity"
          className={`flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2 text-[11px] font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/5 ${blockingRight ? '' : 'col-span-2'}`}>
          
              Resolve continuity
            </Link>
        }
        </div>
      }

      {advisories.length > 0 &&
      <p className="mt-3 border-t border-white/5 pt-3 text-[10px] leading-relaxed text-mist-400">
          Advisory, not blocking: {advisories.map((a) => a.category).join(', ')}
        </p>
      }

      <Link
        to="/studio/continuity"
        className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
        Continuity and locks
        <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
      </Link>
    </section>);

}