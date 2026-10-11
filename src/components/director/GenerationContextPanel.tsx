import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { filmStateApi } from '../../services/filmStateApi';
import type { Shot } from '../../types/director';

/**
 * §30 provenance: the film state, asset versions and rules a version was
 * generated against — "why does this shot look this way?".
 */
export function GenerationContextPanel({ shot }: {shot: Shot;}) {
  const { assets, rules, violations, stale } = useDirector();
  const versionId = shot.currentVersionId;
  const context = versionId ? filmStateApi.getContext(versionId) : undefined;
  const version = shot.versions.find((v) => v.id === versionId);
  const staleEntry = stale.find((s) => s.shotId === shot.id);
  const broken = violations.filter((v) => v.shotId === shot.id);

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <h2 className="text-sm font-bold text-white">Generated against</h2>
      {!context || !version ?
      <p className="mt-1 text-[11px] leading-relaxed text-mist-400">
          Not generated yet. The first generation will record the film state, asset versions and rules it used.
        </p> :

      <>
          <p className="mt-1 text-[11px] text-mist-400">
            v{version.n} · film state v{context.stateVersion} · {context.provider} {context.model}
          </p>

          {(staleEntry || broken.length > 0) &&
        <div className="mt-3 space-y-1.5 rounded-xl border border-brand-amber/25 bg-brand-amber/[0.05] p-2.5">
              {staleEntry &&
          <p className="flex gap-1.5 text-[11px] text-brand-amber">
                  <AlertTriangleIcon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  State has moved on: {staleEntry.changes.join(' · ')}
                </p>
          }
              {broken.map((b) =>
          <p key={b.id} className="flex gap-1.5 text-[11px] text-live">
                  <AlertTriangleIcon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  {b.evidence} — <Link to="/studio/rules" className="font-semibold underline underline-offset-2">resolve</Link>
                </p>
          )}
            </div>
        }

          <dl className="mt-3 space-y-1 text-[11px]">
            <div className="flex gap-2">
              <dt className="text-mist-400">Weather</dt>
              <dd className="ml-auto text-white">{context.state.interior ? `Interior (${context.state.weather} outside)` : context.state.weather}</dd>
            </div>
            {context.state.facts.map((f) =>
          <div key={`${f.entityId}.${f.property}`} className="flex gap-2">
                <dt className="text-mist-400">{filmStateApi.entityName(f.entityId)} · {f.property}</dt>
                <dd className="ml-auto text-right text-white">{f.value}</dd>
              </div>
          )}
          </dl>

          <h3 className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-mist-400">Assets</h3>
          <p className="mt-1 text-[11px] text-mist-300">
            {Object.entries(context.assetVersions).
          map(([id, n]) => `${assets.find((a) => a.id === id)?.name ?? id} v${n}`).
          join(' · ') || '—'}
          </p>

          <h3 className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-mist-400">Rules in context</h3>
          <ul className="mt-1 space-y-1">
            {context.rules.length === 0 && <li className="text-[11px] text-mist-400">None apply to this shot.</li>}
            {context.rules.map((r) =>
          <li key={r.ruleId} className="text-[11px] text-mist-300">
                {rules.find((x) => x.id === r.ruleId)?.text ?? r.ruleId} <span className="text-mist-400">v{r.version}</span>
              </li>
          )}
          </ul>
        </>
      }
    </section>);

}