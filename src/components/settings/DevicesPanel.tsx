import React from 'react';
import { LaptopIcon, MonitorIcon, SmartphoneIcon, TabletIcon, TvIcon } from 'lucide-react';
import type { ConnectedDevice } from '../../types/settings';
import { settingsApi } from '../../services/settingsApi';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../community/StateBlocks';

const icons = {
  web: MonitorIcon,
  phone: SmartphoneIcon,
  tv: TvIcon,
  desktop: LaptopIcon,
  tablet: TabletIcon
};

export function DevicesPanel({ onToast }: {onToast: (m: string) => void;}) {
  const [devices, setDevices] = React.useState<ConnectedDevice[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await settingsApi.listDevices();
    if (result.ok) {
      setDevices(result.data);
      setStatus('ready');
    } else setStatus('error');
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') return <SkeletonRows rows={4} />;
  if (status === 'error')
  return <ErrorBlock message="Your sessions could not be loaded." onRetry={load} />;
  if (devices.length === 0)
  return <EmptyBlock title="No other devices" body="This is the only active session." />;

  return (
    <ul className="space-y-2">
      {devices.map((device) => {
        const Icon = icons[device.kind];
        return (
          <li
            key={device.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-3.5">
            
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900">
              <Icon className="h-4 w-4 text-mist-200" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                {device.name}
                {device.current &&
                <span className="rounded-full bg-brand-cyan/15 px-2 py-0.5 text-[10px] font-semibold text-brand-cyan">
                    This device
                  </span>
                }
              </p>
              <p className="text-[11px] text-mist-400">
                {device.location} · {device.lastActive}
              </p>
            </div>
            {!device.current &&
            <button
              type="button"
              disabled={busy === device.id}
              onClick={async () => {
                setBusy(device.id);
                const result = await settingsApi.revokeDevice(device.id);
                setBusy(null);
                if (result.ok) {
                  setDevices(result.data);
                  onToast(`${device.name} signed out`);
                } else onToast(result.error);
              }}
              className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:border-live/50 hover:text-live disabled:opacity-50">
              
                {busy === device.id ? 'Revoking…' : 'Revoke'}
              </button>
            }
          </li>);

      })}
    </ul>);

}