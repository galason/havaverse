import React from 'react';
import { NavLink } from 'react-router-dom';
import { CompassIcon, HomeIcon, LayoutDashboardIcon, PlusIcon, UsersIcon } from 'lucide-react';

const items = [
{ label: 'Home', to: '/', icon: HomeIcon },
{ label: 'Discover', to: '/browse', icon: CompassIcon },
{ label: 'Create', to: '/studio', icon: PlusIcon, primary: true },
{ label: 'Communities', to: '/communities', icon: UsersIcon },
{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboardIcon }];


/**
 * Mobile-only bottom navigation for the dashboard, with Create elevated as
 * the centre action. Desktop keeps the global sidebar.
 */
export function DashboardMobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.primary) {
            return (
              <li key={item.to} className="-mt-5">
                <NavLink
                  to={item.to}
                  className="flex flex-col items-center gap-1 text-[10px] font-semibold text-white">
                  
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-indigo shadow-lg shadow-brand-indigo/30 ring-4 ring-ink-950 transition-colors duration-150 ease-entrance hover:bg-brand-violet">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {item.label}
                </NavLink>
              </li>);

          }
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ease-entrance ${
                isActive ? 'text-brand-violet' : 'text-mist-400 hover:text-white'}`

                }>
                
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>);

        })}
      </ul>
    </nav>);

}