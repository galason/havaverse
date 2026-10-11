import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import { HavaVerseLogo } from '../brand/HavaVerseLogo';
import { useAuth } from '../../contexts/AuthContext';
import { SearchBar } from './SearchBar';
import { NotificationsMenu } from './NotificationsMenu';
import { ProfileMenu } from './ProfileMenu';

interface TopBarProps {
  onOpenMenu: () => void;
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, bootstrapping } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-white/5 bg-ink-950/95 px-3 backdrop-blur sm:gap-4 sm:px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="rounded-lg p-2 text-mist-200 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white lg:hidden">
        
        <MenuIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      <Link
        to="/"
        aria-label="HavaVerse home"
        className="flex min-w-0 shrink-0 items-center rounded-lg px-0.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo lg:min-w-[200px]">
        
        <HavaVerseLogo
          variant="full"
          size="header"
          collapse={isAuthenticated || bootstrapping ? 'narrow' : 'sm'} />
        
      </Link>

      <div className="hidden min-w-0 flex-1 md:block">
        <SearchBar />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate('/search')}
          aria-label="Search"
          className="rounded-lg p-2 text-mist-300 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white md:hidden">
          
          <SearchIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {bootstrapping ?
        <span
          className="h-8 w-8 animate-pulse rounded-full bg-white/10"
          aria-label="Loading your account" /> :

        isAuthenticated ?
        <>
            <NotificationsMenu />

            <Link
            to="/studio"
            aria-label="Create"
            className="flex items-center gap-2 rounded-full bg-brand-indigo p-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet sm:px-4 sm:py-2">
            
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Create</span>
            </Link>

            <ProfileMenu />
          </> :

        <>
            <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
              Sign in
            </Link>
            <Link
            to="/register"
            className="rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
              Create account
            </Link>
          </>
        }
      </div>
    </header>);

}