import React from 'react';
import { CheckIcon, CoinsIcon, MapPinIcon, SparklesIcon } from 'lucide-react';
import { adaeze, tiers } from '../data/social';
import { titles } from '../data/catalog';
import { TitleCard } from '../components/home/TitleCard';
import { TipSheet } from '../components/wallet/TipSheet';
import { walletApi } from '../services/walletApi';
import { useApp } from '../contexts/AppContext';

export function CreatorPage() {
  const { showToast } = useApp();
  const [following, setFollowing] = React.useState(false);
  const [tipOpen, setTipOpen] = React.useState(false);
  const [joined, setJoined] = React.useState<string[]>([]);
  const [joining, setJoining] = React.useState<string | null>(null);

  async function join(tierId: string, name: string) {
    setJoining(tierId);
    const quoted = Number(tiers.find((t) => t.id === tierId)?.price.replace(/[^\d]/g, '') || 0);
    const result = await walletApi.joinMembership(adaeze.handle, tierId, quoted);
    setJoining(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setJoined((prev) => [...new Set([...prev, tierId])]);
    showToast(`You're in — ${name} · reference ${result.data.reference}`);
  }

  return (
    <article>
      <div className="relative h-56 w-full overflow-hidden">
        <img src={adaeze.banner} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_5%,rgb(var(--c-ink-950)/0.4)_100%)]" />
      </div>

      <header className="-mt-16 flex flex-wrap items-end gap-5 px-5">
        <img
          src={adaeze.avatar}
          alt=""
          className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-4 ring-ink-950" />
        
        <div className="min-w-0 flex-1 pb-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">{adaeze.name}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist-400">
            <span>{adaeze.handle}</span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" aria-hidden="true" />
              {adaeze.location}
            </span>
            <span>{adaeze.languages.join(' · ')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setFollowing((f) => !f)}
            aria-pressed={following}
            className={[
            'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
            following ?
            'border border-white/20 text-mist-200 hover:text-white' :
            'bg-brand-indigo text-white hover:bg-brand-violet'].
            join(' ')}>
            
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            type="button"
            onClick={() => setTipOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            <CoinsIcon className="h-4 w-4" aria-hidden="true" />
            Send a tip
          </button>
        </div>
      </header>

      <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <p className="max-w-2xl text-sm leading-relaxed text-mist-200">{adaeze.bio}</p>

          <dl className="flex flex-wrap gap-x-10 gap-y-4 border-y border-white/5 py-4">
            {[
            ['Followers', adaeze.followers],
            ['Total views', adaeze.totalViews],
            ['Published works', String(adaeze.published)],
            ['Joined', 'March 2024']].
            map(([k, v]) =>
            <div key={k}>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-mist-400">{k}</dt>
                <dd className="mt-0.5 font-display text-2xl tracking-wide text-white">{v}</dd>
              </div>
            )}
          </dl>

          <section aria-labelledby="works-heading">
            <h2 id="works-heading" className="mb-3 text-lg font-bold tracking-tight text-white">
              Published works
            </h2>
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {titles.map((t) =>
              <li key={t.id}>
                  <TitleCard title={t} />
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="ip-heading">
            <h2 id="ip-heading" className="mb-1 text-lg font-bold tracking-tight text-white">
              IP universe
            </h2>
            <p className="mb-4 text-xs text-mist-400">
              Everything connected to this studio in the HavaVerse content graph.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
              ['Amara Okonkwo', 'Character · appears in 3 works'],
              ['The Railway', 'World · 6 locations'],
              ['The Last Train', 'Film · franchise root'],
              ['Night Line', 'Original score · 12 tracks']].
              map(([name, meta]) =>
              <li
                key={name}
                className="flex flex-col rounded-xl border border-white/5 bg-ink-900 p-4">
                
                  <span className="text-sm font-semibold text-white">{name}</span>
                  <span className="mt-auto pt-2 text-[11px] text-mist-400">{meta}</span>
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-labelledby="tiers-heading">
            <h2 id="tiers-heading" className="mb-1 text-sm font-bold text-white">
              Membership
            </h2>
            <p className="mb-3 text-[11px] text-mist-400">
              Back the studio directly. Cancel any time.
            </p>
            <ul className="space-y-3">
              {tiers.map((tier) =>
              <li
                key={tier.id}
                className={[
                'flex flex-col rounded-2xl border p-4',
                tier.highlighted ?
                'border-brand-indigo/50 bg-brand-indigo/10' :
                'border-white/5 bg-ink-900'].
                join(' ')}>
                
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                    {tier.highlighted &&
                  <span className="rounded bg-brand-indigo px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Most popular
                      </span>
                  }
                  </div>
                  <p className="mt-0.5 text-xs text-mist-300">{tier.price}</p>
                  <ul className="mt-3 space-y-1.5">
                    {tier.perks.map((perk) =>
                  <li key={perk} className="flex gap-2 text-[11px] leading-relaxed text-mist-200">
                        <CheckIcon
                      className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan"
                      aria-hidden="true" />
                    
                        {perk}
                      </li>
                  )}
                  </ul>
                  <button
                  type="button"
                  onClick={() => join(tier.id, tier.name)}
                  disabled={joining === tier.id || joined.includes(tier.id)}
                  className={[
                  'mt-auto w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-entrance disabled:opacity-70',
                  joined.includes(tier.id) ?
                  'border border-brand-cyan/40 text-brand-cyan' :
                  tier.highlighted ?
                  'bg-brand-indigo text-white hover:bg-brand-violet' :
                  'border border-white/10 text-white hover:bg-white/5'].
                  join(' ')}>
                  
                    {joined.includes(tier.id) ?
                  `Member · ${tier.name}` :
                  joining === tier.id ?
                  'Joining…' :
                  `Join ${tier.name}`}
                  </button>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <SparklesIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
              In production
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-mist-300">
              “The Last Train: Southbound” is 71% through storyboarding in the AI Entertainment
              Director. Producers and above can read the script now.
            </p>
          </section>
        </aside>
      </div>

      {tipOpen &&
      <TipSheet
        creator={adaeze.name}
        handle={adaeze.handle}
        onClose={() => setTipOpen(false)} />

      }
    </article>);

}