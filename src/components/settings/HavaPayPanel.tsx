import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CreditCardIcon, ShieldIcon } from 'lucide-react';

interface HavaPayPanelProps {
  isCreator: boolean;
  currencySymbol: string;
}

/**
 * Deliberately thin on numbers. Balances and instruments live in HavaPay;
 * what belongs here is the *policy* — what needs approval, where money goes.
 */
export function HavaPayPanel({ isCreator, currencySymbol }: HavaPayPanelProps) {
  const cards = [
  {
    label: 'Wallet',
    value: `${currencySymbol}48,200`,
    detail: 'Available to spend across HavaVerse',
    to: '/wallet'
  },
  {
    label: 'Payment method',
    value: '•••• 4821',
    detail: 'Visa · expires 09/28',
    to: '/wallet'
  },
  {
    label: 'Subscriptions',
    value: '3 active',
    detail: 'HavaVerse Premium and two creator memberships',
    to: '/wallet'
  },
  ...(isCreator ?
  [
  {
    label: 'Creator earnings',
    value: `${currencySymbol}1.92M`,
    detail: 'Attributed this month · settled monthly',
    to: '/studio'
  },
  {
    label: 'Payout destination',
    value: 'GTBank •••• 7741',
    detail: 'Verified',
    to: '/wallet'
  }] :

  [])];


  return (
    <div className="space-y-4">
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) =>
        <li key={card.label}>
            <Link
            to={card.to}
            className="flex h-full flex-col rounded-2xl border border-white/5 bg-ink-850 p-4 transition-colors duration-150 ease-entrance hover:border-white/20">
            
              <span className="flex items-center gap-2">
                <CreditCardIcon className="h-3.5 w-3.5 text-brand-amber" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                  {card.label}
                </span>
                <ArrowRightIcon
                className="ml-auto h-3.5 w-3.5 text-mist-400"
                aria-hidden="true" />
              
              </span>
              <span className="mt-2 block text-lg font-bold tracking-tight text-white">
                {card.value}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-mist-400">
                {card.detail}
              </span>
            </Link>
          </li>
        )}
      </ul>

      <p className="flex items-start gap-2 rounded-xl border border-white/5 bg-ink-850 p-3.5 text-[11px] leading-relaxed text-mist-400">
        <ShieldIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-amber" aria-hidden="true" />
        Card numbers, bank details and balances are held by HavaPay and never rendered in
        full here. Every movement of money is confirmed by you — no agent, automation or
        autonomy level can authorise a payment on your behalf.
      </p>
    </div>);

}