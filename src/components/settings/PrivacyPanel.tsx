import React from 'react';
import { EyeIcon, GlobeIcon, LockIcon, UsersIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SettingRow } from './SettingRow';
import type { ProfilePrivacy, ProfileVisibility } from '../../types/identity';
import type { SettingDefinition } from '../../types/settings';

type Viewer = 'anyone' | 'follower' | 'self';

const visibilityOptions: {
  value: ProfileVisibility;
  label: string;
  body: string;
  icon: typeof GlobeIcon;
}[] = [
{ value: 'public', label: 'Public', body: 'Anyone on HavaVerse can open your profile.', icon: GlobeIcon },
{ value: 'followers', label: 'Followers', body: 'Others see your name and photo, nothing more.', icon: UsersIcon },
{ value: 'private', label: 'Only me', body: 'Your profile page is hidden from everyone else.', icon: LockIcon }];


const contentToggles: {key: keyof ProfilePrivacy;label: string;body: string;}[] = [
{ key: 'showCommunities', label: 'Communities on my profile', body: 'The communities you have joined.' },
{ key: 'showCreations', label: 'Creations on my profile', body: 'Published work and fan creations.' },
{ key: 'discoverableByEmail', label: 'Find me by email', body: 'Someone who knows your email can find you.' },
{ key: 'discoverableByPhone', label: 'Find me by phone', body: 'Someone with your number can find you.' }];


interface PrivacyPanelProps {
  /** The registry's social-presence definitions (who can follow, message, mention…). */
  defs: SettingDefinition[];
  highlight: string | null;
  onToast: (m: string) => void;
}

/**
 * Your social presence, in two layers: what the identity service reveals on
 * your profile (saved immediately), and who can reach you (registry settings,
 * saved with the Save bar). The preview shows the result through other eyes.
 */
export function PrivacyPanel({ defs, highlight, onToast }: PrivacyPanelProps) {
  const { identity, updatePrivacy } = useAuth();
  const [saving, setSaving] = React.useState<keyof ProfilePrivacy | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (!identity) return null;
  const privacy = identity.privacy;

  async function change<K extends keyof ProfilePrivacy>(key: K, value: ProfilePrivacy[K]) {
    setSaving(key);
    setError(null);
    const result = await updatePrivacy({ [key]: value } as Partial<ProfilePrivacy>);
    setSaving(null);
    if (!result.ok) setError(result.error);else
    onToast('Privacy saved');
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <section aria-labelledby="visibility-h" className="rounded-2xl border border-white/5 bg-ink-850 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id="visibility-h" className="text-sm font-bold text-white">
              Who can see my profile
            </h3>
            <span className="text-[11px] text-mist-400">Saves immediately</span>
          </div>
          <div role="radiogroup" aria-labelledby="visibility-h" className="mt-3 grid gap-2 sm:grid-cols-3">
            {visibilityOptions.map((option) => {
              const selected = privacy.visibility === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={saving !== null}
                  onClick={() => !selected && change('visibility', option.value)}
                  className={`rounded-xl border p-3 text-left transition-colors duration-150 ease-entrance disabled:cursor-wait ${
                  selected ? 'border-brand-indigo bg-brand-indigo/10' : 'border-white/5 bg-ink-900 hover:border-white/15'}`
                  }>
                  
                  <Icon className={`h-4 w-4 ${selected ? 'text-brand-indigo' : 'text-mist-400'}`} aria-hidden="true" />
                  <span className="mt-2 block text-xs font-semibold text-white">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-mist-400">{option.body}</span>
                </button>);

            })}
          </div>

          <ul className="mt-4 divide-y divide-white/5">
            {contentToggles.map((toggle) => {
              const on = Boolean(privacy[toggle.key]);
              return (
                <li key={toggle.key} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">{toggle.label}</p>
                    <p className="text-[11px] text-mist-400">{toggle.body}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={toggle.label}
                    disabled={saving !== null}
                    onClick={() => change(toggle.key, !on as ProfilePrivacy[typeof toggle.key])}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-entrance disabled:opacity-60 ${
                    on ? 'bg-brand-indigo' : 'bg-ink-700'}`
                    }>
                    
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ease-entrance ${
                      on ? 'translate-x-[22px]' : 'translate-x-0.5'}`
                      } />
                    
                  </button>
                </li>);

            })}
          </ul>
          {error &&
          <p role="alert" className="mt-2 text-xs text-live">
              {error}
            </p>
          }
        </section>

        {defs.length > 0 &&
        <section aria-labelledby="reach-h" className="space-y-2">
            <h3 id="reach-h" className="text-sm font-bold text-white">
              Who can reach you
            </h3>
            {defs.map((def) =>
          <SettingRow key={def.id} def={def} highlighted={highlight === def.id} />
          )}
          </section>
        }
      </div>

      <ProfilePreview privacy={privacy} />
    </div>);

}

function ProfilePreview({ privacy }: {privacy: ProfilePrivacy;}) {
  const { identity } = useAuth();
  const { valueOf } = useSettings();
  const [viewer, setViewer] = React.useState<Viewer>('anyone');
  if (!identity) return null;

  const reaches = (settingId: string) => {
    if (viewer === 'self') return true;
    const audience = String(valueOf(settingId) ?? 'nobody');
    return audience === 'everyone' || viewer === 'follower' && audience === 'followers';
  };

  const open =
  viewer === 'self' ||
  privacy.visibility === 'public' ||
  privacy.visibility === 'followers' && viewer === 'follower';
  const hidden = viewer !== 'self' && privacy.visibility === 'private';
  const isCreator = identity.accountType !== 'viewer';

  const rows: {label: string;visible: boolean;}[] = [
  { label: 'Bio', visible: open },
  { label: 'Communities', visible: open && (viewer === 'self' || privacy.showCommunities) },
  ...(isCreator ? [{ label: 'Creations', visible: open && (viewer === 'self' || privacy.showCreations) }] : []),
  { label: 'Activity', visible: open && reaches('social.activity') },
  { label: 'What you are watching', visible: open && reaches('social.watching') },
  { label: 'Follow button', visible: viewer !== 'self' && !hidden && reaches('social.follow') },
  { label: 'Message button', visible: viewer !== 'self' && !hidden && reaches('social.message') }];


  return (
    <aside aria-labelledby="preview-h" className="self-start rounded-2xl border border-white/5 bg-ink-850 p-4 xl:sticky xl:top-20">
      <h3 id="preview-h" className="flex items-center gap-2 text-sm font-bold text-white">
        <EyeIcon className="h-4 w-4 text-mist-300" aria-hidden="true" />
        How others see you
      </h3>
      <div role="tablist" aria-label="Preview as" className="mt-3 flex rounded-full bg-ink-900 p-0.5">
        {(
        [
        ['anyone', 'Anyone'],
        ['follower', 'Follower'],
        ['self', 'You']] as
        const).
        map(([id, label]) =>
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={viewer === id}
          onClick={() => setViewer(id)}
          className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          viewer === id ? 'bg-ink-700 text-white' : 'text-mist-400 hover:text-white'}`
          }>
          
            {label}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {identity.profile.avatar && !hidden ?
        <img src={identity.profile.avatar} alt="" className="h-12 w-12 rounded-full object-cover" /> :

        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-700 text-sm font-bold text-white">
            {hidden ? <LockIcon className="h-4 w-4 text-mist-400" aria-hidden="true" /> : identity.profile.displayName.charAt(0)}
          </span>
        }
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {hidden ? 'Profile unavailable' : identity.profile.displayName || identity.username}
          </p>
          {!hidden && <p className="truncate text-xs text-mist-400">@{identity.username}</p>}
        </div>
      </div>
      {open && identity.profile.bio &&
      <p className="mt-3 text-xs leading-relaxed text-mist-200">{identity.profile.bio}</p>
      }

      <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
        {rows.map((row) =>
        <li key={row.label} className="flex items-center justify-between text-[11px]">
            <span className="text-mist-300">{row.label}</span>
            <span className={row.visible ? 'font-semibold text-white' : 'text-mist-400'}>
              {row.visible ? 'Visible' : 'Hidden'}
            </span>
          </li>
        )}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
        "Who can reach you" changes show here before you save them. The server applies these rules — this
        page never decides what others see.
      </p>
    </aside>);

}