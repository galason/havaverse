import React from 'react';
import { PlusIcon } from 'lucide-react';
import { familyProfiles } from '../../data/settings';

export function FamilyPanel({ onToast }: {onToast: (m: string) => void;}) {
  return (
    <div className="space-y-4">
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {familyProfiles.map((profile) =>
        <li
          key={profile.id}
          className="rounded-2xl border border-white/5 bg-ink-850 p-4">
          
            <div className="flex items-center gap-3">
              <img
              src={profile.avatar}
              alt=""
              className="h-11 w-11 rounded-full object-cover" />
            
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{profile.name}</p>
                <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                profile.tier === 'Adult' ?
                'bg-white/10 text-mist-200' :
                profile.tier === 'Teen' ?
                'bg-brand-indigo/20 text-brand-indigo' :
                'bg-brand-amber/15 text-brand-amber'}`
                }>
                
                  {profile.tier}
                </span>
              </div>
            </div>

            <dl className="mt-3 space-y-1.5">
              {[
            ['Content', profile.maturity],
            ['Screen time', profile.screenTime],
            ['Purchases', profile.purchases],
            ['Hava AI', profile.aiAccess]].
            map(([label, value]) =>
            <div key={label} className="flex items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-[11px] text-mist-400">{label}</dt>
                  <dd className="truncate text-right text-[11px] font-semibold text-white">
                    {value}
                  </dd>
                </div>
            )}
            </dl>

            <button
            type="button"
            onClick={() => onToast(`Editing limits for ${profile.name}`)}
            className="mt-3 w-full rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Edit limits
            </button>
          </li>
        )}

        <li>
          <button
            type="button"
            onClick={() => onToast('New profiles inherit the strictest limits until you relax them')}
            className="flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-4 text-mist-400 transition-colors duration-150 ease-entrance hover:border-white/30 hover:text-white">
            
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold">Add a profile</span>
          </button>
        </li>
      </ul>

      <p className="rounded-xl border border-white/5 bg-ink-850 p-3.5 text-[11px] leading-relaxed text-mist-400">
        Limits are enforced by the identity service, not by this interface. A child profile
        cannot lift its own restrictions even with the device unlocked.
      </p>
    </div>);

}