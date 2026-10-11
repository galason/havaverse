import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, LinkIcon, LoaderIcon, LockIcon, SparklesIcon } from 'lucide-react';
import type { ReportReason, Short } from '../../types/shorts';
import { createOptions } from '../../data/shorts';
import { shortsApi } from '../../services/shortsApi';
import { formatShortTime } from '../../hooks/useShortPlayback';
import { Sheet } from '../watch/Sheet';

/* ------------------------------------------------------------------ share */

export function ShortShareSheet({
  short,
  currentTime,
  onClose,
  onDone





}: {short: Short;currentTime: number;onClose: () => void;onDone: (m: string) => void;}) {
  const [atMoment, setAtMoment] = React.useState(false);
  const [spoilerFree, setSpoilerFree] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const base = `${window.location.origin}/shorts/${short.slug}`;
  const url = atMoment ? `${base}?at=${Math.floor(currentTime)}` : base;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      shortsApi.track('share_created', short.slug, atMoment ? 'with-moment' : 'plain');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onDone('Your browser blocked the clipboard — the link is shown above.');
    }
  }

  return (
    <Sheet title={`Share ${short.caption}`} onClose={onClose}>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5">
        <LinkIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
        <input
          readOnly
          value={url}
          aria-label="Share link"
          className="min-w-0 flex-1 bg-transparent text-xs text-mist-100 focus:outline-none" />
        
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-ink-950">
          
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <label className="flex items-center gap-2.5 text-xs text-mist-200">
          <input
            type="checkbox"
            checked={atMoment}
            onChange={(e) => setAtMoment(e.target.checked)}
            className="h-4 w-4 accent-brand-indigo" />
          
          Start at {formatShortTime(currentTime)}
        </label>
        <label className="flex items-center gap-2.5 text-xs text-mist-200">
          <input
            type="checkbox"
            checked={spoilerFree}
            onChange={(e) => setSpoilerFree(e.target.checked)}
            className="h-4 w-4 accent-brand-indigo" />
          
          Spoiler-free — hide the caption in the preview
        </label>
      </div>

      <ul className="mt-4 grid grid-cols-4 gap-2">
        {['WhatsApp', 'X', 'Messages', 'Telegram'].map((t) =>
        <li key={t}>
            <button
            type="button"
            onClick={() => {
              onDone(`Shared to ${t}`);
              onClose();
            }}
            className="w-full rounded-xl border border-white/10 py-2.5 text-[10px] font-semibold text-mist-100 transition-colors duration-150 ease-entrance hover:border-white/35">
            
              {t}
            </button>
          </li>
        )}
      </ul>
    </Sheet>);

}

/* ---------------------------------------------------------------- support */

const tiers = [
{ id: 't1', label: '₦500', minor: 50000 },
{ id: 't2', label: '₦1,000', minor: 100000 },
{ id: 't3', label: '₦5,000', minor: 500000 }];


export function ShortSupportSheet({
  short,
  onClose,
  onDone




}: {short: Short;onClose: () => void;onDone: (m: string) => void;}) {
  const [tierId, setTierId] = React.useState('t2');
  const [custom, setCustom] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reference, setReference] = React.useState('');

  const amountMinor = custom ?
  Math.round(Number(custom) * 100) :
  tiers.find((t) => t.id === tierId)?.minor ?? 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await shortsApi.support(short.creator.handle, amountMinor, message);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    shortsApi.track('creator_supported', short.slug, String(amountMinor));
    setReference(result.data.reference);
  }

  if (reference) {
    return (
      <Sheet title="Support recorded" onClose={onClose}>
        <div className="rounded-xl border border-brand-amber/25 bg-brand-amber/5 p-4">
          <CheckIcon className="h-5 w-5 text-brand-amber" aria-hidden="true" />
          <p className="mt-2 text-xs leading-relaxed text-mist-100">
            Your support for {short.creator.name} is recorded as{' '}
            <span className="font-bold text-white">{reference}</span>. HavaPay settles the
            payment and writes the ledger entry and revenue split server-side.
          </p>
          <Link
            to="/wallet"
            className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-[11px] font-bold text-ink-950">
            
            Open your wallet
          </Link>
        </div>
      </Sheet>);

  }

  return (
    <Sheet
      title={`Support ${short.creator.name}`}
      description="Goes to the creator, not the platform."
      onClose={onClose}>
      
      <form onSubmit={submit}>
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((t) =>
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTierId(t.id);
              setCustom('');
            }}
            aria-pressed={!custom && tierId === t.id}
            className={`rounded-xl border py-2.5 text-xs font-bold transition-colors duration-150 ease-entrance ${
            !custom && tierId === t.id ?
            'border-brand-amber text-brand-amber' :
            'border-white/10 text-mist-200 hover:border-white/35'}`
            }>
            
              {t.label}
            </button>
          )}
        </div>

        <label htmlFor="custom-amount" className="mt-3 block text-[11px] text-mist-300">
          Custom amount (₦)
        </label>
        <input
          id="custom-amount"
          type="number"
          min={100}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-ink-850 px-3 py-2 text-xs text-white focus:border-brand-amber focus:outline-none" />
        

        <label htmlFor="support-note" className="mt-3 block text-[11px] text-mist-300">
          Message to the creator
        </label>
        <textarea
          id="support-note"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-ink-850 px-3 py-2 text-xs text-white focus:border-brand-amber focus:outline-none" />
        

        {error &&
        <p role="alert" className="mt-2 text-[11px] text-live">
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-amber px-5 py-2.5 text-xs font-bold text-ink-950 disabled:opacity-60">
          
          {submitting &&
          <LoaderIcon
            className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden="true" />

          }
          Support with HavaPay
        </button>
      </form>
    </Sheet>);

}

/* ----------------------------------------------------------------- report */

const reasons: {id: ReportReason;label: string;}[] = [
{ id: 'copyright', label: 'Copyright concern' },
{ id: 'inappropriate', label: 'Inappropriate content' },
{ id: 'violence', label: 'Violence' },
{ id: 'harassment', label: 'Hate or harassment' },
{ id: 'misleading', label: 'Misleading information' },
{ id: 'spam', label: 'Spam' },
{ id: 'technical', label: 'Technical issue' }];


export function ShortReportSheet({
  short,
  onClose,
  onDone




}: {short: Short;onClose: () => void;onDone: (m: string) => void;}) {
  const [reason, setReason] = React.useState<ReportReason>('copyright');
  const [submitting, setSubmitting] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await shortsApi.report(short.slug, reason);
    setSubmitting(false);
    if (result.ok) {
      onDone(result.data);
      onClose();
    }
  }

  return (
    <Sheet
      title="Report this Short"
      description="Goes to HavaVerse Trust & Safety."
      onClose={onClose}>
      
      <form onSubmit={submit}>
        <fieldset>
          <legend className="sr-only">Why are you reporting this?</legend>
          <ul className="space-y-1.5">
            {reasons.map((r) =>
            <li key={r.id}>
                <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-mist-100 hover:bg-ink-850">
                  <input
                  type="radio"
                  name="report-reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="h-4 w-4 accent-live" />
                
                  {r.label}
                </label>
              </li>
            )}
          </ul>
        </fieldset>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-full bg-live px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">
          
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </Sheet>);

}

/* ------------------------------------------------------------ create from */

export function CreateFromSheet({
  short,
  onClose



}: {short: Short;onClose: () => void;}) {
  const remixable = short.rights.remix;

  return (
    <Sheet
      title="Create from this"
      description={`Governed by ${short.creator.name}’s rights settings.`}
      onClose={onClose}>
      
      {!remixable &&
      <p className="mb-3 flex items-start gap-2 rounded-xl border border-brand-amber/25 bg-brand-amber/5 p-3 text-[11px] leading-relaxed text-brand-amber">
          <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This Short is not licensed for remix or AI reference. You can still make
          something original in the same register — it will not reuse this material.
        </p>
      }
      <ul className="space-y-2">
        {createOptions.map((o) => {
          const locked = !remixable && (o.id === 'remix' || o.id === 'trailer');
          return (
            <li key={o.id}>
              {locked ?
              <span className="block cursor-not-allowed rounded-xl border border-white/5 p-3 opacity-50">
                  <span className="block text-xs font-bold text-white">{o.label}</span>
                  <span className="block text-[11px] text-mist-400">
                    Not permitted by this Short’s licence
                  </span>
                </span> :

              <Link
                to="/studio"
                onClick={onClose}
                className="block rounded-xl border border-white/10 p-3 transition-colors duration-150 ease-entrance hover:border-brand-violet/50">
                
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <SparklesIcon className="h-3 w-3 text-brand-violet" aria-hidden="true" />
                    {o.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-mist-400">{o.blurb}</span>
                </Link>
              }
            </li>);

        })}
      </ul>
    </Sheet>);

}

/* ------------------------------------------------------------- provenance */

export function ProvenanceSheet({
  short,
  onClose



}: {short: Short;onClose: () => void;}) {
  if (!short.provenance) return null;
  const label =
  short.provenance.mode === 'ai-directed' ?
  'AI-directed' :
  short.provenance.mode === 'ai-assisted' ?
  'AI-assisted' :
  'Human-made';

  return (
    <Sheet
      title="How this was made"
      description="HavaVerse labels authorship rather than implying it."
      onClose={onClose}>
      
      <p className="inline-block rounded-full bg-brand-violet/20 px-3 py-1 text-[11px] font-bold text-brand-violet">
        {label}
      </p>
      <dl className="mt-3 space-y-2">
        {short.provenance.lines.map((line) =>
        <div key={line.label} className="flex gap-3 border-b border-white/5 pb-2">
            <dt className="w-32 shrink-0 text-[11px] text-mist-400">{line.label}</dt>
            <dd className="text-[11px] font-semibold text-mist-100">{line.value}</dd>
          </div>
        )}
      </dl>
    </Sheet>);

}