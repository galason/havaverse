import React from 'react';
import { reportReasons } from '../../data/watch';
import { watchApi } from '../../services/watchApi';
import { Sheet } from './Sheet';

interface ReportSheetProps {
  slug: string;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function ReportSheet({ slug, onClose, onDone }: ReportSheetProps) {
  const [reason, setReason] = React.useState('');
  const [detail, setDetail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await watchApi.reportContent(slug, reason, detail);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    watchApi.track('report_created', slug, reason);
    onDone(`Report ${result.data.caseId} sent to Trust & Safety`);
    onClose();
  }

  return (
    <Sheet
      title="Report content"
      description="Goes to HavaVerse Trust & Safety. You will be told the outcome."
      onClose={onClose}>
      
      <form onSubmit={submit}>
        <fieldset>
          <legend className="text-[11px] font-semibold text-mist-300">
            Why are you reporting this?
          </legend>
          <div className="mt-2 space-y-1">
            {reportReasons.map((option) =>
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5">
              
                <input
                type="radio"
                name="reason"
                value={option}
                checked={reason === option}
                onChange={() => setReason(option)}
                className="h-3.5 w-3.5 accent-brand-indigo" />
              
                {option}
              </label>
            )}
          </div>
        </fieldset>

        <label className="mt-3 block">
          <span className="text-[11px] font-semibold text-mist-300">
            Anything else <span className="text-mist-400">(optional)</span>
          </span>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
          
        </label>

        {error &&
        <p role="alert" className="mt-2 text-xs text-live">
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={submitting || !reason}
          className="mt-4 w-full rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:bg-ink-700 disabled:text-mist-400">
          
          {submitting ? 'Sending…' : 'Submit report'}
        </button>
      </form>
    </Sheet>);

}