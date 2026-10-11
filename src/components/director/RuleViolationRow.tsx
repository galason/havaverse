import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import type { RuleViolation } from '../../types/filmState';

/**
 * §47 — a rule broken by a render is never silently accepted. The filmmaker
 * gets four ways forward: reject the version, regenerate it, allow this one
 * shot as an audited exception, or change the rule itself.
 */
export function RuleViolationRow({ violation }: {violation: RuleViolation;}) {
  const { rejectVersion, generateShot, allowException, pending, shots } = useDirector();
  const [allowing, setAllowing] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const shot = shots.find((s) => s.id === violation.shotId);
  const generating = shot?.status === 'generating';
  const rejected = shot?.status === 'needs-revision';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (await allowException(violation.ruleId, violation.shotId, reason)) {
      setAllowing(false);
      setReason('');
    }
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-start gap-3">
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-live" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            <Link to={`/studio/shot/${violation.shotId}`} className="hover:text-brand-indigo">
              Shot {violation.shotCode}
            </Link>{' '}
            <span className="font-normal text-mist-400">· v{violation.versionN}</span>
          </p>
          <p className="text-xs text-mist-300">{violation.evidence}</p>
          <p className="mt-0.5 text-[11px] text-mist-400">Breaks: “{violation.ruleText}”</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 pl-7">
        <button
          type="button"
          onClick={() => rejectVersion(violation.shotId)}
          disabled={pending === `reject:${violation.shotId}` || rejected || generating}
          className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-50">
          
          {rejected ? 'Rejected' : 'Reject'}
        </button>
        <button
          type="button"
          onClick={() => generateShot(violation.shotId)}
          disabled={pending === `gen:${violation.shotId}` || generating}
          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:opacity-60">
          
          {generating ? 'Regenerating…' : 'Regenerate'}
        </button>
        <button
          type="button"
          onClick={() => setAllowing((v) => !v)}
          aria-expanded={allowing}
          className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          Allow in this shot
        </button>
        <Link
          to={`/studio/rules#${violation.ruleId}`}
          className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          Change the rule
        </Link>
      </div>

      {allowing &&
      <form onSubmit={submit} className="mt-3 space-y-2 pl-7">
          <label className="block">
            <span className="text-[11px] font-semibold text-mist-300">
              Why may Shot {violation.shotCode} break this rule? (creates a new rule version)
            </span>
            <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white focus:border-brand-indigo/60 focus:outline-none" />
          
          </label>
          <button
          type="submit"
          disabled={pending === `except:${violation.ruleId}:${violation.shotId}`}
          className="rounded-full bg-brand-indigo px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60">
          
            Record exception
          </button>
        </form>
      }
    </li>);

}