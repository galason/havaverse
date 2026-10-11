import React from 'react';
import { Link } from 'react-router-dom';
import { COMMUNITY_IMAGES } from '../../data/communityHub';

export function CommunityHero() {
  return (
    <section
      aria-labelledby="community-hero-heading"
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
      
      <img
        src={COMMUNITY_IMAGES.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-right" />
      
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950)/0.97)_8%,rgb(var(--c-ink-950)/0.6)_60%,rgb(var(--c-ink-950)/0.3)_100%)] sm:bg-[linear-gradient(90deg,rgb(var(--c-ink-950)/0.97)_0%,rgb(var(--c-ink-950)/0.85)_38%,rgb(var(--c-ink-950)/0.15)_78%)]" />

      <div className="relative max-w-full px-5 py-8 sm:max-w-[60%] sm:px-8 sm:py-12 lg:py-14">
        <h1
          id="community-hero-heading"
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          
          HavaVerse <span className="text-brand-magenta">Community</span>
        </h1>
        <p className="mt-2 text-base font-medium text-mist-100 sm:text-lg">
          Where entertainment becomes a shared experience.
        </p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-mist-300">
          Discover the people talking about what you watch, join communities around films, creators,
          music, sports and stories, and take part in the experience.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <a
            href="#explore-communities"
            className="rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
            
            Explore communities
          </a>
          <a
            href="#trending-conversations"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
            
            Find a conversation
          </a>
          <Link
            to="/sports"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
            
            What's live now
          </Link>
        </div>
      </div>
    </section>);

}