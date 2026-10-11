import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRightIcon,
  ClockIcon,
  LayersIcon,
  MenuIcon,
  PlayCircleIcon,
  SparklesIcon,
  VideoIcon,
  XIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { ControlNav } from '../components/settings/ControlNav';
import { SettingRow } from '../components/settings/SettingRow';
import { OverviewPanel } from '../components/settings/OverviewPanel';
import { AiRelationship } from '../components/settings/AiRelationship';
import { SecurityPanel } from '../components/settings/SecurityPanel';
import { DevicesPanel } from '../components/settings/DevicesPanel';
import { HavaPayPanel } from '../components/settings/HavaPayPanel';
import { DataPanel } from '../components/settings/DataPanel';
import { FamilyPanel } from '../components/settings/FamilyPanel';
import { LabsPanel } from '../components/settings/LabsPanel';
import { ActivityPanel } from '../components/settings/ActivityPanel';
import { EcosystemPanel } from '../components/settings/EcosystemPanel';
import { IdentityPanel } from '../components/settings/IdentityPanel';
import { AskHava } from '../components/settings/AskHava';
import { AppearancePanel } from '../components/settings/AppearancePanel';
import { PrivacyPanel } from '../components/settings/PrivacyPanel';
import { SignInMethodsPanel } from '../components/settings/SignInMethodsPanel';
import { NotificationPreferences } from '../components/notifications/NotificationPreferences';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/community/StateBlocks';
import { formatDay } from '../utils/time';

export function Settings() {
  const { section = 'overview' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { identity, updateProfile, setAccountType } = useAuth();
  const {
    status,
    reload,
    sections,
    registry,
    dirtyIds,
    saving,
    saveError,
    save,
    reset,
    valueOf
  } = useSettings();

  const [highlight, setHighlight] = React.useState<string | null>(null);
  const [navOpen, setNavOpen] = React.useState(false);

  const go = React.useCallback(
    (sectionId: string, settingId?: string) => {
      navigate(sectionId === 'overview' ? '/settings' : `/settings/${sectionId}`);
      setHighlight(settingId ?? null);
      setNavOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [navigate]
  );

  // The highlight is a pointer, not a state — it fades once you have seen it.
  React.useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => setHighlight(null), 6000);
    return () => window.clearTimeout(t);
  }, [highlight]);

  if (status === 'loading') {
    return (
      <div className="p-4 sm:p-5">
        <LoadingBlock label="Loading your controls" />
      </div>);

  }

  if (status === 'error' || !identity) {
    return (
      <div className="p-4 sm:p-5">
        <ErrorBlock message="Your settings could not be loaded." onRetry={reload} />
      </div>);

  }

  const current = sections.find((s) => s.id === section) ?? sections[0];
  const isCreator = identity.accountType !== 'viewer';
  const currency = String(valueOf('region.currency') ?? 'NGN');
  const symbol =
  { NGN: '₦', GHS: '₵', KES: 'KSh', USD: '$', GBP: '£' }[currency] ?? '₦';

  const strip = [
  {
    id: 'personalization',
    eyebrow: 'Experience',
    title: 'Personalized',
    detail: 'Entertainment · Sports · Community',
    cta: 'Customize',
    icon: PlayCircleIcon
  },
  {
    id: 'ai-preferences',
    eyebrow: 'Hava AI',
    title: valueOf('ai.memory') ? 'Hava AI is active' : 'Hava AI runs without memory',
    detail: 'Personal assistant + recommendations',
    cta: 'Configure',
    icon: SparklesIcon
  },
  isCreator ?
  {
    id: 'studio',
    eyebrow: 'Creator',
    title: 'Creator mode',
    detail: 'Studio · AI Director · Earnings',
    cta: 'Manage',
    icon: VideoIcon
  } :
  {
    id: 'account',
    eyebrow: 'Creator',
    title: 'Not a creator yet',
    detail: 'Add creating to this account — you keep everything you have',
    cta: 'Become a creator',
    icon: VideoIcon
  }];


  function renderSection() {
    switch (current.renderer) {
      case 'overview':
        return (
          <OverviewPanel
            name={identity!.profile.displayName || identity!.username}
            handle={identity!.username}
            avatar={identity!.profile.avatar}
            isCreator={isCreator}
            onGo={go}
            onToast={showToast} />);


      case 'identity':
        return (
          <IdentityPanel
            identity={identity!}
            onChange={(patch) => updateProfile(patch)}
            onToast={showToast} />);


      case 'ai':
        return <AiRelationship onToast={showToast} />;
      case 'security':
        return <SecurityPanel onToast={showToast} />;
      case 'devices':
        return <DevicesPanel onToast={showToast} />;
      case 'havapay':
        return <HavaPayPanel isCreator={isCreator} currencySymbol={symbol} />;
      case 'data':
        return <DataPanel onToast={showToast} />;
      case 'family':
        return <FamilyPanel onToast={showToast} />;
      case 'labs':
        return <LabsPanel onToast={showToast} />;
      case 'activity':
        return <ActivityPanel only="ai" />;
      case 'ecosystem':
        return <EcosystemPanel />;
      case 'appearance':
        return <AppearancePanel />;
      case 'privacy':
        return (
          <PrivacyPanel
            defs={registry.filter((d) => d.category === current.id)}
            highlight={highlight}
            onToast={showToast} />);


      case 'sign-in':
        return <SignInMethodsPanel onToast={showToast} />;
      case 'notifications':
        return <NotificationPreferences />;
      default:{
          const defs = registry.filter((d) => d.category === current.id);
          if (defs.length === 0) {
            return (
              <EmptyBlock
                title="Nothing to configure here yet"
                body="This section has no controls available to your account." />);


          }
          const groups = Array.from(new Set(defs.map((d) => d.group ?? '')));
          return (
            <div className="space-y-4">
            {groups.map((group) =>
              <div key={group || 'default'} className="space-y-2">
                {group &&
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                    {group}
                  </h3>
                }
                {defs.
                filter((d) => (d.group ?? '') === group).
                map((def) =>
                <SettingRow key={def.id} def={def} highlighted={highlight === def.id} />
                )}
              </div>
              )}
          </div>);

        }
    }
  }

  return (
    <div className="pb-14">
      <div className="grid lg:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_320px]">
        {/* ---------------------------------------------------------- nav */}
        <div className="hidden border-r border-white/5 p-4 lg:block">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)]">
            <ControlNav sections={sections} active={current.id} onSelect={go} />
          </div>
        </div>

        {/* --------------------------------------------------------- main */}
        <main className="min-w-0 p-4 sm:p-5">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-mist-200">
              
              <MenuIcon className="h-3.5 w-3.5" aria-hidden="true" />
              All settings
            </button>
            <p className="truncate text-xs text-mist-400">{current.label}</p>
          </div>

          <h1 className="mt-3 font-display text-3xl uppercase tracking-tight text-white sm:text-4xl lg:mt-0">
            Hava Control
          </h1>
          <p className="mt-0.5 text-sm text-mist-400">Your HavaVerse, configured around you.</p>

          {/* identity bar */}
          <section className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/5 bg-ink-900 p-4">
            <img
              src={identity.profile.avatar}
              alt=""
              className="h-14 w-14 rounded-full object-cover" />
            
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-white">
                {identity.profile.displayName || identity.username}
              </p>
              <p className="flex flex-wrap items-center gap-2 text-xs text-mist-400">
                @{identity.username}
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-mist-200">
                  {isCreator ? 'Viewer · Creator' : 'Viewer'}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-mist-200">
                  Personal account
                </span>
              </p>
            </div>

            <div className="hidden sm:block">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" aria-hidden="true" />
                HavaVerse active
              </p>
              <p className="text-[11px] text-mist-400">
                {dirtyIds.length > 0 ? 'Unsaved changes' : 'Synced moments ago'}
              </p>
            </div>

            {/* Save only becomes prominent when there is something to save. */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                disabled={dirtyIds.length === 0}
                onClick={reset}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white disabled:opacity-40">
                
                Reset
              </button>
              <button
                type="button"
                disabled={dirtyIds.length === 0 || saving}
                onClick={async () => {
                  const typeChanged = dirtyIds.includes('account.type');
                  const nextType = valueOf('account.type');
                  const done = await save();
                  if (!done) return;
                  // Account type is identity, not preference: it has to reach
                  // the identity service so capabilities actually change.
                  if (
                  typeChanged &&
                  typeof nextType === 'string' &&
                  nextType !== identity.accountType)
                  {
                    await setAccountType(nextType as 'viewer' | 'creator' | 'both');
                  }
                  showToast('Your HavaVerse has been updated');
                }}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance ${
                dirtyIds.length === 0 ?
                'bg-ink-800 text-mist-400' :
                'bg-brand-indigo text-white hover:bg-brand-violet'}`
                }>
                
                {saving ?
                'Saving…' :
                dirtyIds.length > 0 ?
                `Save ${dirtyIds.length} change${dirtyIds.length > 1 ? 's' : ''}` :
                'Save changes'}
              </button>
            </div>

            {saveError &&
            <p role="alert" className="w-full text-xs text-live">
                {saveError}
              </p>
            }
          </section>

          {/* command strip */}
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {strip.map((card) =>
            <li key={card.id}>
                <button
                type="button"
                onClick={() => go(card.id)}
                className="flex h-full w-full flex-col rounded-2xl border border-white/5 bg-ink-900 p-4 text-left transition-colors duration-150 ease-entrance hover:border-brand-indigo/40">
                
                  <span className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-indigo/15">
                      <card.icon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                      {card.eyebrow}
                    </span>
                  </span>
                  <span className="mt-2.5 block text-sm font-bold text-white">{card.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-mist-400">
                    {card.detail}
                  </span>
                  <span className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-brand-indigo">
                    {card.cta}
                    <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
                  </span>
                </button>
              </li>
            )}
          </ul>

          {identity.deletion && current.id !== 'data' &&
          <div
            role="status"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-live/40 bg-live/5 px-4 py-3">
            
              <p className="text-xs text-mist-200">
                <span className="font-semibold text-white">Your account is scheduled for deletion</span> on{' '}
                {formatDay(identity.deletion.scheduledFor)}. You can still cancel.
              </p>
              <button
              type="button"
              onClick={() => go('data')}
              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-mist-200 hover:text-white">
              
                Review
              </button>
            </div>
          }

          {/* the section itself */}
          <section aria-labelledby="section-heading" className="mt-6">
            {current.id !== 'overview' &&
            <header className="mb-3">
                <h2
                id="section-heading"
                className="text-lg font-bold tracking-tight text-white">
                
                  {current.label}
                </h2>
                <p className="mt-0.5 text-xs text-mist-400">{current.blurb}</p>
              </header>
            }
            {renderSection()}
          </section>

          <footer className="mt-8 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-[11px] text-mist-400">
            <Link to="/browse/support">Help &amp; support</Link>
            <Link to="/browse/legal">Legal</Link>
            <Link to="/browse/about">About HavaVerse</Link>
          </footer>
        </main>

        {/* ----------------------------------------------------- side rail */}
        <aside className="space-y-4 p-4 sm:p-5 xl:border-l xl:border-white/5">
          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <ClockIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              Recent changes
            </h2>
            <div className="mt-3">
              <ActivityPanel compact limit={5} />
            </div>
            <button
              type="button"
              onClick={() => go('ai-activity')}
              className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-brand-indigo">
              
              View full activity
              <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
            </button>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <LayersIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              Your HavaVerse ecosystem
            </h2>
            <p className="mt-0.5 text-[11px] text-mist-400">All your connected experiences.</p>
            <div className="mt-3">
              <EcosystemPanel compact />
            </div>
          </section>

          <AskHava onGo={go} />
        </aside>
      </div>

      {/* ------------------------------------------------------ mobile nav */}
      {navOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <button
          type="button"
          aria-label="Close settings navigation"
          onClick={() => setNavOpen(false)}
          className="absolute inset-0 bg-ink-950/80" />
        
          <div className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[85vw] flex-col border-r border-white/10 bg-ink-950 p-4">
            <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close"
            className="mb-2 ml-auto grid h-8 w-8 place-items-center rounded-full text-mist-400 hover:bg-white/5 hover:text-white">
            
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <ControlNav sections={sections} active={current.id} onSelect={go} />
          </div>
        </div>
      }
    </div>);

}