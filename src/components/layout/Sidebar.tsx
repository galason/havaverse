import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClapperboardIcon,
  CompassIcon,
  FilmIcon,
  GlobeIcon,
  HomeIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  MicIcon,
  MusicIcon,
  RadioIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  PackageIcon,
  TrendingUpIcon,
  TrophyIcon,
  TvIcon,
  UsersIcon,
  VideoIcon,
  WalletIcon } from
'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{className?: string;}>;
}

const browse: NavItem[] = [
{ label: 'Home', to: '/', icon: HomeIcon },
{ label: 'Movies', to: '/browse/film', icon: FilmIcon },
{ label: 'Series', to: '/browse/series', icon: TvIcon },
{ label: 'Sports', to: '/sports', icon: TrophyIcon },
{ label: 'Live', to: '/live', icon: RadioIcon },
{ label: 'Shorts', to: '/shorts', icon: VideoIcon },
{ label: 'Creators', to: '/creator/adaezefilms', icon: ClapperboardIcon },
{ label: 'Music', to: '/music', icon: MusicIcon },
{ label: 'Podcasts', to: '/podcast', icon: MicIcon },
{ label: 'Communities', to: '/communities', icon: UsersIcon },
{ label: 'Market', to: '/market', icon: ShoppingBagIcon }];


const mySpace: NavItem[] = [
{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboardIcon },
{ label: 'Library', to: '/library', icon: LibraryIcon },
{ label: 'My Collection', to: '/market/collection', icon: LayersIcon },
{ label: 'Orders', to: '/market/orders', icon: PackageIcon },
{ label: 'Music Passport', to: '/music/passport', icon: GlobeIcon },
{ label: 'Conversation Passport', to: '/podcast/passport', icon: CompassIcon },
{ label: 'Wallet', to: '/wallet', icon: WalletIcon }];


function NavRow({ item, onNavigate }: {item: NavItem;onNavigate?: () => void;}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
      [
      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-entrance',
      isActive ?
      'bg-brand-indigo/20 text-white ring-1 ring-brand-indigo/40' :
      'text-mist-300 hover:bg-white/5 hover:text-white'].
      join(' ')
      }>
      
      {({ isActive }) =>
      <>
          <Icon
          className={[
          'h-[18px] w-[18px] shrink-0 transition-colors duration-150',
          isActive ? 'text-brand-indigo' : 'text-mist-400 group-hover:text-mist-200'].
          join(' ')} />
        
          <span className="truncate">{item.label}</span>
        </>
      }
    </NavLink>);

}

export function Sidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { identity } = useAuth();
  // Capability-driven: the earnings workspace appears only when the identity can monetize.
  const personal = identity?.capabilities.includes('monetize') ?
  [...mySpace, { label: 'Creator economy', to: '/creator/economy', icon: TrendingUpIcon }] :
  mySpace;
  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-[248px] shrink-0 flex-col border-r border-white/5 bg-ink-900 lg:w-[232px]">
      
      <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {browse.map((item) =>
          <li key={item.to}>
              <NavRow item={item} onNavigate={onNavigate} />
            </li>
          )}
        </ul>

        <p className="px-3 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
          My space
        </p>
        <ul className="space-y-1">
          {personal.map((item) =>
          <li key={item.to}>
              <NavRow item={item} onNavigate={onNavigate} />
            </li>
          )}
        </ul>

        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-indigo/25 bg-ink-800 p-4">
          <SparklesIcon className="h-5 w-5 text-brand-magenta" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold leading-snug text-white">
            Turn your imagination into entertainment.
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-mist-300">
            Create films, series, shorts and music videos with the AI Entertainment Director.
          </p>
          <NavLink
            to="/studio"
            onClick={onNavigate}
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-brand-indigo px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
            Start creating
          </NavLink>
        </div>
      </div>

      <div className="border-t border-white/5 px-3 py-3">
        <NavRow
          item={{ label: 'Settings', to: '/settings', icon: SettingsIcon }}
          onNavigate={onNavigate} />
        
      </div>
    </nav>);

}