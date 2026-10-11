import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { formatPrice } from '../../contexts/CommerceContext';
import { DELIVERY_FEE, methodLabel } from '../../utils/orders';
import { walletSnapshot } from '../../services/havapayLedger';
import type { CheckoutOptions, PaymentMethodId, ShippingAddress } from '../../types/orders';

interface CheckoutPanelProps {
  subtotal: number;
  ships: boolean;
  busy: boolean;
  onPay: (options: CheckoutOptions) => Promise<string | null>;
  onClear: () => void;
}

const emptyAddress: ShippingAddress = { name: '', phone: '', line1: '', city: '', state: '' };

const fields: {key: keyof ShippingAddress;label: string;autoComplete: string;wide?: boolean;}[] = [
{ key: 'name', label: 'Full name', autoComplete: 'name' },
{ key: 'phone', label: 'Phone', autoComplete: 'tel' },
{ key: 'line1', label: 'Street address', autoComplete: 'street-address', wide: true },
{ key: 'city', label: 'City', autoComplete: 'address-level2' },
{ key: 'state', label: 'State', autoComplete: 'address-level1' }];


export function CheckoutPanel({ subtotal, ships, busy, onPay, onClear }: CheckoutPanelProps) {
  const [method, setMethod] = React.useState<PaymentMethodId>('havapay-wallet');
  const [address, setAddress] = React.useState<ShippingAddress>(emptyAddress);
  const [error, setError] = React.useState<string | null>(null);
  const deliveryFee = ships ? DELIVERY_FEE : 0;
  // Read from the same HavaPay projection the Wallet shows; the order service re-checks it on submit.
  const walletAvailable = React.useMemo(() => walletSnapshot().available, [busy]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = await onPay({ method, shipping: ships ? address : undefined });
    if (problem) setError(problem);
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-white/5 bg-ink-900 p-4">
      {ships &&
      <fieldset>
          <legend className="text-sm font-bold text-white">Delivery address</legend>
          <p className="mt-0.5 text-[11px] text-mist-400">Only for the items that ship. Digital items arrive in your collection.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {fields.map((f) =>
          <label key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
                <span className="text-[11px] font-semibold text-mist-300">{f.label}</span>
                <input
              value={address[f.key]}
              onChange={(e) => setAddress((a) => ({ ...a, [f.key]: e.target.value }))}
              autoComplete={f.autoComplete}
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-850 px-3 py-2 text-sm text-white outline-none transition-colors duration-150 ease-entrance focus:border-brand-indigo" />
            
              </label>
          )}
          </div>
        </fieldset>
      }

      <fieldset>
        <legend className="text-sm font-bold text-white">Pay with</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(methodLabel) as PaymentMethodId[]).map((id) =>
          <label
            key={id}
            className={[
            'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors duration-150 ease-entrance',
            method === id ? 'border-brand-indigo bg-brand-indigo/10 text-white' : 'border-white/10 text-mist-200 hover:border-white/20'].
            join(' ')}>
            
              <input
              type="radio"
              name="pay-method"
              checked={method === id}
              onChange={() => setMethod(id)}
              className="accent-brand-indigo" />
            
              <span className="min-w-0 flex-1">{methodLabel[id]}</span>
              {id === 'havapay-wallet' &&
            <span className="text-[11px] tabular-nums text-mist-400">{formatPrice(walletAvailable)} available</span>
            }
            </label>
          )}
        </div>
      </fieldset>

      <dl className="space-y-1.5 border-t border-white/5 pt-4 text-sm">
        <div className="flex justify-between text-mist-300">
          <dt>Items</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {ships &&
        <div className="flex justify-between text-mist-300">
            <dt>Delivery</dt>
            <dd className="tabular-nums">{formatPrice(deliveryFee)}</dd>
          </div>
        }
        <div className="flex items-baseline justify-between pt-1">
          <dt className="text-mist-200">Total</dt>
          <dd className="text-2xl font-bold tabular-nums text-white">{formatPrice(subtotal + deliveryFee)}</dd>
        </div>
      </dl>

      {error &&
      <p role="alert" className="rounded-lg bg-live/10 px-3 py-2 text-xs text-live">
          {error}
        </p>
      }

      <div className="space-y-2">
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand-indigo px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
          
          {busy ? 'Placing order…' : `Place order · ${formatPrice(subtotal + deliveryFee)}`}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="w-full rounded-lg border border-white/15 px-5 py-2.5 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          Empty bag
        </button>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-mist-400">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-cyan" aria-hidden="true" />
        HavaPay charges you and confirms the payment. Until it does, the order shows as awaiting confirmation and
        nothing is added to your collection.
      </p>
    </form>);

}