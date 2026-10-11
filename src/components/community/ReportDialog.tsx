import React from 'react';
import { XIcon } from 'lucide-react';
import {
  reportObject,
  reportReasons,
  type ReportSubject } from
'../../services/communityApi';

interface ReportDialogProps {
  subject: ReportSubject;
  objectId: string;
  /** What the user is reporting, shown in the dialog title. */
  label: string;
  onClose: () => void;
  onDone: (message: string) => void;
}

/**
 * The single reporting flow for every community object. Reporting is never an
 * instant toast: it takes a reason, can fail, refuses duplicates, and only
 * confirms once Trust & Safety has actually issued a case id.
 */
export function ReportDialog({ subject, objectId, label, onClose, onDone }: ReportDialogProps) {
  const [reason, setReason] = React.useState('');
  const [detail, setDetail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await reportObject(subject, objectId, reason, detail);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone(`Report ${result.data.caseId} sent to Trust & Safety`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title">
      
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative w-full max-w-md rounded-t-2xl border border-white/10 bg-ink-900 p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="report-dialog-title" className="text-base font-bold text-white">
              Report {label}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-mist-400">
              Goes to HavaVerse Trust &amp; Safety. Moderators review it and you will be told the
              outcome.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4">
          <fieldset>
            <legend className="text-[11px] font-semibold text-mist-300">
              Why are you reporting this?
            </legend>
            <div className="mt-2 space-y-0.5">
              {reportReasons.map((option) =>
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                  <input
                  type="radio"
                  name="community-report-reason"
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
          <p role="alert" className="mt-2 text-xs font-semibold text-live">
              {error}
            </p>
          }

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
              
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:bg-ink-700 disabled:text-mist-400">
              
              {submitting ? 'Sending…' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}