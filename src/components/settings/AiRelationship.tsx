import React from 'react';
import { BrainIcon, EyeIcon, ShieldIcon, ZapIcon } from 'lucide-react';
import type { AiRing, PermissionLevel } from '../../types/settings';
import { aiCapabilities, autonomyOptions } from '../../data/settings';
import { settingsApi } from '../../services/settingsApi';
import { LoadingBlock } from '../community/StateBlocks';

const rings: {id: AiRing;label: string;question: string;icon: typeof EyeIcon;}[] = [
{
  id: 'understand',
  label: 'Understand',
  question: 'What Hava AI can understand about you.',
  icon: EyeIcon
},
{
  id: 'remember',
  label: 'Remember',
  question: 'What Hava AI may retain.',
  icon: BrainIcon
},
{
  id: 'act',
  label: 'Act',
  question: 'What Hava AI is allowed to do.',
  icon: ZapIcon
}];


const levels: {id: PermissionLevel;label: string;}[] = [
{ id: 'always', label: 'Always' },
{ id: 'ask', label: 'Ask me' },
{ id: 'never', label: 'Never' }];


export function AiRelationship({ onToast }: {onToast: (m: string) => void;}) {
  const [permissions, setPermissions] = React.useState<Record<string, PermissionLevel> | null>(
    null
  );
  const [autonomy, setAutonomyState] = React.useState(settingsApi.currentAutonomy());

  React.useEffect(() => {
    settingsApi.loadPermissions().then((r) => {
      if (r.ok) setPermissions(r.data);
    });
  }, []);

  async function change(id: string, level: PermissionLevel) {
    const result = await settingsApi.setPermission(id, level);
    if (!result.ok) {
      onToast(result.error);
      return;
    }
    setPermissions((prev) => prev ? { ...prev, [id]: level } : prev);
  }

  if (!permissions) return <LoadingBlock label="Reading your AI permissions" />;

  const chosen = autonomyOptions.find((o) => o.id === autonomy);

  return (
    <div className="space-y-4">
      {/* Understand → Remember → Act, as one readable chain. */}
      <div className="grid gap-3 lg:grid-cols-3">
        {rings.map((ring, index) => {
          const caps = aiCapabilities.filter((c) => c.ring === ring.id);
          return (
            <section
              key={ring.id}
              aria-labelledby={`ring-${ring.id}`}
              className="relative rounded-2xl border border-white/5 bg-ink-850 p-4">
              
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-indigo/15">
                  <ring.icon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                </span>
                <h3
                  id={`ring-${ring.id}`}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  
                  {ring.label}
                </h3>
                {index < 2 &&
                <span
                  aria-hidden="true"
                  className="ml-auto hidden text-mist-400 lg:block">
                  
                    →
                  </span>
                }
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-mist-400">{ring.question}</p>
              <ul className="mt-3 space-y-2.5">
                {caps.map((cap) =>
                <li key={cap.id}>
                    <p className="text-xs font-semibold text-white">{cap.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
                      {cap.description}
                    </p>
                  </li>
                )}
              </ul>
            </section>);

        })}
      </div>

      {/* The matrix is the enforceable version of the chain above. */}
      <section
        aria-labelledby="permissions-heading"
        className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        
        <h3 id="permissions-heading" className="text-base font-bold tracking-tight text-white">
          What can Hava AI do?
        </h3>
        <p className="mt-0.5 text-xs text-mist-400">
          Anything that spends money, publishes under your name or changes your rights stops
          for you — whatever the autonomy level says.
        </p>

        <ul className="mt-3 space-y-1.5">
          {aiCapabilities.
          filter((c) => c.ring === 'act').
          map((cap) => {
            const level = permissions[cap.id];
            return (
              <li
                key={cap.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/5 bg-ink-900 p-3">
                
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">{cap.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
                      {cap.locked ? cap.lockReason : cap.description}
                    </p>
                  </div>
                  {cap.locked ?
                <span className="flex items-center gap-1.5 rounded-full border border-brand-amber/30 px-3 py-1.5 text-[11px] font-semibold text-brand-amber">
                      <ShieldIcon className="h-3 w-3" aria-hidden="true" />
                      Never — fixed
                    </span> :

                <div
                  role="radiogroup"
                  aria-label={cap.label}
                  className="flex gap-1 rounded-full border border-white/10 p-1">
                  
                      {levels.map((option) =>
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={level === option.id}
                    onClick={() => change(cap.id, option.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
                    level === option.id ?
                    option.id === 'never' ?
                    'bg-live text-white' :
                    'bg-white text-ink-950' :
                    'text-mist-300 hover:text-white'}`
                    }>
                    
                          {option.label}
                        </button>
                  )}
                    </div>
                }
                </li>);

          })}
        </ul>
      </section>

      {/* Autonomy states its consequence rather than implying more power. */}
      <section
        aria-labelledby="autonomy-heading"
        className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        
        <h3 id="autonomy-heading" className="text-base font-bold tracking-tight text-white">
          AI autonomy
        </h3>
        <p className="mt-0.5 text-xs text-mist-400">
          How much control you want to hand to Hava AI in Studio.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-mist-400">Human control</span>
          <div
            role="radiogroup"
            aria-label="AI autonomy"
            className="flex flex-1 flex-wrap gap-1 rounded-full border border-white/10 p-1">
            
            {autonomyOptions.map((option) =>
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={autonomy === option.id}
              onClick={async () => {
                setAutonomyState(option.id);
                await settingsApi.setAutonomy(option.id);
              }}
              className={`flex-1 rounded-full px-3 py-2 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
              autonomy === option.id ?
              'bg-brand-indigo text-white' :
              'text-mist-300 hover:text-white'}`
              }>
              
                {option.label}
              </button>
            )}
          </div>
          <span className="text-[11px] text-mist-400">AI autonomy</span>
        </div>
        {chosen &&
        <p className="mt-2.5 rounded-xl border border-white/5 bg-ink-900 p-3 text-xs leading-relaxed text-mist-200">
            {chosen.consequence}
          </p>
        }
      </section>
    </div>);

}