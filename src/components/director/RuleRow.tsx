import React from 'react';
import { ChevronDownIcon, PauseIcon, PlayIcon, ScaleIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { since } from '../../utils/continuity';
import type { ProductionRule } from '../../types/filmState';

const levelLabel: Record<ProductionRule['level'], string> = {
  film: 'Film rule',
  sequence: 'Sequence rule',
  scene: 'Scene rule',
  character: 'Character rule',
  shot: 'Shot rule'
};

type Mode = 'idle' | 'edit' | 'suspend';

/** One Director's rule: its wording, its predicate, its history, and how to change it. */
export function RuleRow({ rule, scopeLabel }: {rule: ProductionRule;scopeLabel?: string;}) {
  const { editRule, pending, shots } = useDirector();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('idle');
  const [text, setText] = React.useState(rule.text);
  const [reason, setReason] = React.useState('');
  const busy = pending === `rule:${rule.id}`;
  const suspended = rule.status === 'suspended';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const done =
    mode === 'edit' ?
    await editRule(rule.id, { text }, reason) :
    await editRule(rule.id, { status: suspended ? 'active' : 'suspended' }, reason);
    if (done) {
      setMode('idle');
      setReason('');
    }
  }

  return (
    <li id={rule.id} className="scroll-mt-24 py-4">
      <div className="flex flex-wrap items-start gap-3">
        <ScaleIcon className={`mt-0.5 h-4 w-4 shrink-0 ${suspended ? 'text-mist-400' : 'text-brand-indigo'}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mist-400">
            {levelLabel[rule.level]}
            {scopeLabel && ` · ${scopeLabel}`} · v{rule.version}
            {suspended && <span className="ml-1.5 text-brand-amber">Suspended</span>}
          </p>
          <p className={`mt-0.5 text-sm font-semibold ${suspended ? 'text-mist-300 line-through' : 'text-white'}`}>
            {rule.text}
          </p>
          <p className="mt-0.5 text-[11px] text-mist-400">
            Checked as: {rule.predicate.subject} {rule.predicate.property} {rule.predicate.operator} “{rule.predicate.value}”
            {rule.exceptions.length > 0 &&
            ` · exceptions: ${rule.exceptions.map((id) => shots.find((s) => s.id === id)?.code ?? id).join(', ')}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setText(rule.text);
              setReason('');
              setMode(mode === 'edit' ? 'idle' : 'edit');
            }}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            Reword
          </button>
          <button
            type="button"
            onClick={() => {
              setReason('');
              setMode(mode === 'suspend' ? 'idle' : 'suspend');
            }}
            className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            {suspended ? <PlayIcon className="h-3 w-3" aria-hidden="true" /> : <PauseIcon className="h-3 w-3" aria-hidden="true" />}
            {suspended ? 'Reinstate' : 'Suspend'}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Rule history"
            className="rounded-full border border-white/10 p-1.5 text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
            <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ease-entrance ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {mode !== 'idle' &&
      <form onSubmit={submit} className="mt-3 space-y-2 pl-7">
          {mode === 'edit' &&
        <label className="block">
              <span className="text-[11px] font-semibold text-mist-300">Wording</span>
              <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white focus:border-brand-indigo/60 focus:outline-none" />
          
            </label>
        }
          <label className="block">
            <span className="text-[11px] font-semibold text-mist-300">Reason (audited)</span>
            <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white focus:border-brand-indigo/60 focus:outline-none" />
          
          </label>
          <p className="text-[10px] text-mist-400">
            {mode === 'suspend' && !suspended ?
          'While suspended the rule is not enforced and commands that contradict it will run. Every shot keeps its render.' :
          `Creates rule v${rule.version + 1}. v${rule.version} stays in the history.`}
          </p>
          <div className="flex gap-2">
            <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand-indigo px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60">
            
              {busy ? 'Saving…' : mode === 'edit' ? `Save v${rule.version + 1}` : suspended ? 'Reinstate' : 'Suspend'}
            </button>
            <button
            type="button"
            onClick={() => setMode('idle')}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-mist-300 hover:text-white">
            
              Cancel
            </button>
          </div>
        </form>
      }

      {open &&
      <ol className="mt-3 space-y-1.5 border-l border-white/10 pl-3 ml-7">
          {rule.history.map((h) =>
        <li key={h.version} className="text-[11px]">
              <span className="font-semibold text-white">v{h.version}</span>
              <span className="text-mist-300"> · {h.reason}</span>
              <span className="text-mist-400"> · {h.createdBy} · {since(h.createdAt)}</span>
            </li>
        )}
        </ol>
      }
    </li>);

}