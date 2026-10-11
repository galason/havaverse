import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';
import { activityCards, liveFeature, myCommunities } from '../../data/communityHub';

export function HappeningNow() {
  return (
    <section aria-labelledby="happening-heading">
      <h2 id="happening-heading" className="mb-3 text-lg font-bold tracking-tight text-white">
        What's happening on HavaVerse
      </h2>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] xl:grid-cols-[1.15fr_1fr_0.78fr]">
        <Link
          to={liveFeature.to}
          className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl border border-live/30">
          
          <img
            src={liveFeature.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.03]" />
          
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.96)_10%,rgb(var(--c-ink-950)/0.25)_85%)]" />
          <span className="absolute left-4 top-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded bg-live px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              Live now
            </span>
            <span className="rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-mist-100 backdrop-blur">
              {liveFeature.watching} fans watching
            </span>
          </span>
          <span className="relative p-5">
            <span className="block text-xl font-bold text-white">{liveFeature.title}</span>
            <span className="mt-0.5 block text-xs text-mist-300">{liveFeature.subtitle}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance group-hover:bg-brand-violet">
              Join the conversation
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </span>
        </Link>

        <ul className="space-y-2">
          {activityCards.map((card) =>
          <li key={card.id}>
              <Link
              to={card.to}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-2 transition-colors duration-150 ease-entrance hover:border-white/15">
              
                <span className="relative shrink-0">
                  <img
                  src={card.image}
                  alt=""
                  loading="lazy"
                  className="h-14 w-20 rounded-lg object-cover" />
                
                  {card.live &&
                <span className="absolute left-1 top-1 rounded bg-live px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                      Live
                    </span>
                }
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {card.title}
                  </span>
                  <span className="block text-[11px] leading-relaxed text-mist-400">
                    {card.meta}
                  </span>
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-mist-400" aria-hidden="true" />
              </Link>
            </li>
          )}
        </ul>

        <section
          aria-labelledby="my-communities-heading"
          className="hidden rounded-2xl border border-white/5 bg-ink-900 p-4 xl:block">
          
          <div className="mb-3 flex items-center gap-2">
            <h3 id="my-communities-heading" className="text-sm font-bold text-white">
              My communities
            </h3>
            <a
              href="#explore-communities"
              className="ml-auto text-[11px] font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
              
              View all
            </a>
          </div>
          <ul className="space-y-1">
            {myCommunities.map((community) =>
            <li key={community.slug}>
                <Link
                to={`/community/${community.slug}`}
                className="flex items-center gap-3 rounded-xl p-1.5 transition-colors duration-150 ease-entrance hover:bg-white/5">
                
                  <img
                  src={community.image}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {community.name}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-brand-cyan">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" aria-hidden="true" />
                      {community.online} online
                    </span>
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>
    </section>);

}