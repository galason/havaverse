import React from 'react';
import { CheckIcon, MailIcon, PhoneIcon } from 'lucide-react';
import type { HavaIdentity } from '../../types/identity';

interface IdentityPanelProps {
  identity: HavaIdentity;
  onChange: (patch: {displayName?: string;bio?: string;}) => void;
  onToast: (message: string) => void;
}

/**
 * One identity, many surfaces. This panel edits the record itself; everything
 * a module layers on top (creator page, community presence, HavaPay) hangs
 * off it rather than duplicating it.
 */
export function IdentityPanel({ identity, onChange, onToast }: IdentityPanelProps) {
  const [displayName, setDisplayName] = React.useState(identity.profile.displayName);
  const [bio, setBio] = React.useState(identity.profile.bio);
  const dirty =
  displayName !== identity.profile.displayName || bio !== identity.profile.bio;

  const identities = [
  { label: 'Consumer', detail: 'Watchlist, history, entitlements', active: true },
  {
    label: 'Creator',
    detail: 'Studio projects, publishing, audience',
    active: identity.accountType !== 'viewer'
  },
  { label: 'Community', detail: 'Memberships, posts, reputation', active: true },
  { label: 'HavaPay', detail: 'Wallet, purchases, payouts', active: true },
  {
    label: 'AI',
    detail: 'Memory, preferences, permissions',
    active: true
  }];


  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={identity.profile.avatar}
            alt=""
            className="h-16 w-16 rounded-full object-cover" />
          
          <div className="min-w-0 flex-1 space-y-2.5">
            <label className="block">
              <span className="text-[11px] font-semibold text-mist-300">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white focus:border-brand-indigo focus:outline-none" />
              
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-mist-300">
                Bio <span className="text-mist-400">(optional)</span>
              </span>
              <textarea
                value={bio}
                rows={2}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white focus:border-brand-indigo focus:outline-none" />
              
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="flex items-center gap-1.5 text-[11px] text-mist-400">
            <MailIcon className="h-3 w-3" aria-hidden="true" />
            {identity.email}
            {identity.emailVerified &&
            <CheckIcon className="h-3 w-3 text-brand-cyan" aria-hidden="true" />
            }
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-mist-400">
            <PhoneIcon className="h-3 w-3" aria-hidden="true" />
            {identity.phone || 'No phone added'}
            {identity.phoneVerified &&
            <CheckIcon className="h-3 w-3 text-brand-cyan" aria-hidden="true" />
            }
          </p>
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              onChange({ displayName, bio });
              onToast('Identity updated');
            }}
            className="ml-auto rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
            
            Save identity
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-ink-850 p-4">
        <h3 className="text-sm font-bold text-white">One identity, every module</h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">
          These are facets of the same account, not separate logins. Gaining a facet never
          costs you another.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {identities.map((facet) =>
          <li
            key={facet.label}
            className={`rounded-xl border p-3 ${
            facet.active ? 'border-white/10 bg-ink-900' : 'border-dashed border-white/10'}`
            }>
            
              <p className="flex items-center gap-2 text-xs font-semibold text-white">
                {facet.label}
                <span
                className={`ml-auto text-[10px] font-semibold ${
                facet.active ? 'text-brand-cyan' : 'text-mist-400'}`
                }>
                
                  {facet.active ? 'Active' : 'Not enabled'}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">{facet.detail}</p>
            </li>
          )}
        </ul>
      </section>
    </div>);

}