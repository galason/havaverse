import React from 'react';
import { Link } from 'react-router-dom';
import { HavaVerseLogo } from '../brand/HavaVerseLogo';

const CINEMATIC = "/099466a5-f4c9-473d-9fbd-0fdca60821ce.jpg";


interface AuthLayoutProps {
  /** Hides the cinematic panel for short, focused steps (verification, OTP). */
  compact?: boolean;
  children: React.ReactNode;
}

export function AuthLayout({ compact = false, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-ink-950">
      {!compact &&
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden lg:block xl:w-[52%]">
          <img src={CINEMATIC} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.96)_5%,rgb(var(--c-ink-950)/0.35)_65%,rgb(var(--c-ink-950)/0.55)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-12 xl:p-16">
            <HavaVerseLogo variant="stacked" size="lg" labelled className="self-start" />
            <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Your entertainment universe starts here.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-mist-200">
              Create, watch, discover, connect and experience entertainment with HavaVerse.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-mist-400">
              One identity · One entertainment universe
            </p>
          </div>
        </aside>
      }

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            aria-label="HavaVerse home"
            className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo">
            
            <HavaVerseLogo variant="full" size="header" collapse="none" />
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
            
            Back to HavaVerse
          </Link>
        </header>

        <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-4 sm:items-center sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <footer className="px-5 pb-6 text-center text-[11px] text-mist-400 sm:px-8">
          © 2026 HavaVerse ·{' '}
          <Link to="/browse/terms" className="transition-colors hover:text-white">
            Terms
          </Link>{' '}
          ·{' '}
          <Link to="/browse/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
        </footer>
      </main>
    </div>);

}