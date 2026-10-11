import React from 'react';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import { authApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { daysUntil, formatDay, relativeTime } from '../../utils/time';
import type { DataExportRequest } from '../../types/identity';

const statusLabel: Record<DataExportRequest['status'], string> = {
  processing: 'Being assembled',
  ready: 'Ready to download',
  expired: 'Link expired'
};

/** Download your data + delete your account: the two ends of an identity's life. */
export function AccountLifecycle({ onToast }: {onToast: (m: string) => void;}) {
  return (
    <section className="grid gap-3 lg:grid-cols-2">
      <DataExportCard onToast={onToast} />
      <AccountDeletionCard onToast={onToast} />
    </section>);

}

function DataExportCard({ onToast }: {onToast: (m: string) => void;}) {
  const [exports, setExports] = React.useState<DataExportRequest[] | null>(null);
  const [error, setError] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(false);
    const result = await authApi.listDataExports();
    if (result.ok) setExports(result.data);else
    setError(true);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const open = exports?.find((e) => e.status === 'processing');

  async function request() {
    setRequesting(true);
    const result = await authApi.requestDataExport();
    setRequesting(false);
    if (!result.ok) {
      onToast(result.error);
      return;
    }
    await load();
    onToast('Archive requested — we will email you a link when it is ready');
  }

  return (
    <div className="flex flex-col rounded-2xl border border-white/5 bg-ink-850 p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-white">
        <DownloadIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        Download your data
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-mist-400">
        Profile, watch history, library, community posts, creations and payments, assembled by the
        identity service and delivered over a link that expires after 7 days.
      </p>

      {error ?
      <p className="mt-3 text-xs text-mist-300">
          Past requests couldn't be loaded.{' '}
          <button type="button" onClick={load} className="font-semibold text-white underline">
            Retry
          </button>
        </p> :
      exports && exports.length > 0 ?
      <ul className="mt-3 space-y-1.5">
          {exports.slice(0, 3).map((e) =>
        <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-900 px-3 py-2">
              <span className="text-[11px] text-mist-300">Requested {relativeTime(e.requestedAt)}</span>
              <span
            className={`text-[11px] font-semibold ${
            e.status === 'ready' ? 'text-brand-cyan' : e.status === 'expired' ? 'text-mist-400' : 'text-brand-amber'}`
            }>
            
                {statusLabel[e.status]}
              </span>
            </li>
        )}
        </ul> :
      null}

      {open &&
      <p className="mt-2 text-[11px] leading-relaxed text-mist-400">
          Archives are built on the server, so nothing is generated in this browser. This request stays
          open until the identity service marks it ready.
        </p>
      }

      <div className="mt-auto pt-3">
        <button
          type="button"
          disabled={requesting || Boolean(open) || exports === null}
          onClick={request}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-50">
          
          {requesting ? 'Requesting…' : open ? 'Request in progress' : 'Request my archive'}
        </button>
      </div>
    </div>);

}

function AccountDeletionCard({ onToast }: {onToast: (m: string) => void;}) {
  const { identity, requestAccountDeletion, cancelAccountDeletion } = useAuth();
  const [step, setStep] = React.useState<'idle' | 'confirm'>('idle');
  const [typed, setTyped] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputId = React.useId();

  if (!identity) return null;
  const deletion = identity.deletion;

  if (deletion) {
    const days = daysUntil(deletion.scheduledFor);
    return (
      <div role="status" className="flex flex-col rounded-2xl border border-live/40 bg-live/5 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Trash2Icon className="h-4 w-4 text-live" aria-hidden="true" />
          Deletion scheduled for {formatDay(deletion.scheduledFor)}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-mist-300">
          {days} day{days === 1 ? '' : 's'} left to change your mind. Other sessions have been signed out.
          After this date your identity, profiles and memberships are removed; purchases and payouts are
          kept for the statutory period, unlinked from you.
        </p>
        <div className="mt-auto pt-3">
          <button
            type="button"
            disabled={working}
            onClick={async () => {
              setWorking(true);
              const result = await cancelAccountDeletion();
              setWorking(false);
              onToast(result.ok ? 'Deletion cancelled — your account stays' : result.error);
            }}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:opacity-60">
            
            {working ? 'Cancelling…' : 'Keep my account'}
          </button>
        </div>
      </div>);

  }

  return (
    <div className="flex flex-col rounded-2xl border border-live/25 bg-ink-850 p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-white">
        <Trash2Icon className="h-4 w-4 text-live" aria-hidden="true" />
        Delete your HavaVerse account
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-mist-400">
        Removes your identity, profiles and memberships after a 30-day grace period you can cancel.
        Purchases and payouts are kept for the statutory period, unlinked from you.
      </p>

      {step === 'confirm' ?
      <form
        className="mt-3 space-y-2.5"
        onSubmit={async (e) => {
          e.preventDefault();
          setWorking(true);
          setError(null);
          const result = await requestAccountDeletion(typed, reason.trim() || undefined);
          setWorking(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setStep('idle');
          setTyped('');
          setReason('');
          onToast('Deletion scheduled — you have 30 days to cancel');
        }}>
        
          <label htmlFor={inputId} className="block text-[11px] text-mist-300">
            Type <span className="font-semibold text-white">{identity.username}</span> to confirm
          </label>
          <input
          id={inputId}
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            setError(null);
          }}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-mist-400 focus:border-live/60 focus:outline-none" />
        
          <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-label="Why are you leaving? (optional)"
          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-xs text-mist-200 focus:outline-none">
          
            <option value="">Why are you leaving? (optional)</option>
            <option value="Not using it">I don't use HavaVerse enough</option>
            <option value="Privacy">Privacy concerns</option>
            <option value="Second account">I have another account</option>
            <option value="Other">Something else</option>
          </select>
          {error &&
        <p role="alert" className="text-xs text-live">
              {error}
            </p>
        }
          <div className="flex flex-wrap gap-2">
            <button
            type="submit"
            disabled={working || typed.trim().length === 0}
            className="rounded-full bg-live px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-live/90 disabled:opacity-50">
            
              {working ? 'Scheduling…' : 'Schedule deletion'}
            </button>
            <button
            type="button"
            onClick={() => {
              setStep('idle');
              setTyped('');
              setError(null);
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 hover:text-white">
            
              Cancel
            </button>
          </div>
        </form> :

      <div className="mt-auto pt-3">
          <button
          type="button"
          onClick={() => setStep('confirm')}
          className="rounded-full border border-live/40 px-4 py-2 text-xs font-semibold text-live transition-colors duration-150 ease-entrance hover:bg-live/10">
          
            Start deletion
          </button>
        </div>
      }
    </div>);

}