import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookmarkIcon,
  ChevronDownIcon,
  CircleUserIcon,
  DownloadIcon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import { IMAGES } from '../../data/catalog';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { ThemeSwitcher } from '../settings/ThemeSwitcher';
import { familyProfiles } from '../../data/settings';

const links = [
{ label: 'Creator studio', to: '/studio', icon: SparklesIcon },
{ label: 'Library', to: '/library', icon: BookmarkIcon },
{ label: 'Downloads', to: '/library?shelf=downloads', icon: DownloadIcon },
{ label: 'Wallet', to: '/wallet', icon: WalletIcon },
{ label: 'Communities', to: '/communities', icon: UsersIcon },
{ label: 'Connect a TV', to: '/activate', icon: MonitorSmartphoneIcon },
{ label: 'Settings', to: '/settings', icon: SettingsIcon }];


export function ProfileMenu() {
  const [open, setOpen] = React.useState(false);
  const { showToast } = useApp();
  const { identity, signOut } = useAuth();
  const navigate = useNavigate();
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const avatar = identity?.profile.avatar || IMAGES.creator;
  const name = identity?.profile.displayName || 'HavaVerse member';
  // Derived from the identity record, never a hard-coded plan name.
  const accountLine = identity ?
  identity.capabilities.includes('premium') ?
  'Premium' :
  identity.accountType === 'viewer' ?
  'Viewer account' :
  'Creator account' :
  'Signed out';
  // Household profiles are account data owned by Settings → Family.
  const profiles = familyProfiles;
  const [active, setActive] = React.useState(profiles[0]?.id ?? '');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-150 ease-entrance hover:bg-white/5">
        
        <img
          src={avatar}
          alt=""
          className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-indigo/50" />
        
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-xs font-semibold text-white">{name}</span>
          <span className="block text-[10px] text-mist-400">{accountLine}</span>
        </span>
        <ChevronDownIcon className="hidden h-4 w-4 text-mist-400 sm:block" aria-hidden="true" />
      </button>

      {open &&
      <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/5 p-4">
            <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-[11px] text-mist-400">
                {identity?.email ?? 'Not signed in'}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-brand-cyan">
                <ShieldCheckIcon className="h-3 w-3" aria-hidden="true" />
                {identity?.emailVerified ? 'Verified identity' : 'Email not verified'}
              </p>
            </div>
          </div>

          <div className="border-b border-white/5 p-2">
            <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist-400">
              Switch profile
            </p>
            <ul className="flex gap-1.5 px-1 pb-1">
              {profiles.map((profile) =>
            <li key={profile.id} className="flex-1">
                  <button
                type="button"
                onClick={() => {
                  setActive(profile.id);
                  showToast(`Switched to ${profile.name}`);
                }}
                aria-pressed={active === profile.id}
                className={[
                'flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] transition-colors duration-150 ease-entrance',
                active === profile.id ?
                'bg-brand-indigo/20 text-white ring-1 ring-brand-indigo/40' :
                'text-mist-300 hover:bg-white/5 hover:text-white'].
                join(' ')}>
                
                    {profile.avatar ?
                <img src={profile.avatar} alt="" className="h-6 w-6 rounded-full object-cover" /> :

                <CircleUserIcon className="h-5 w-5" aria-hidden="true" />
                }
                    <span className="truncate">{profile.name}</span>
                    <span className="text-[9px] text-mist-400">{profile.tier}</span>
                  </button>
                </li>
            )}
            </ul>
          </div>

          <ul className="p-2">
            {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                  <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
                  
                    <Icon className="h-4 w-4 text-mist-400" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>);

          })}
          </ul>

          <div className="border-t border-white/5 px-3 py-2.5">
            <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist-400">
              Appearance
            </p>
            <ThemeSwitcher />
          </div>

          <div className="border-t border-white/5 p-2">
            <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
              showToast('Signed out of this device');
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
            
              <LogOutIcon className="h-4 w-4 text-mist-400" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      }
    </div>);

}