import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { titles } from '../data/catalog';
import { TitleCard } from '../components/home/TitleCard';
import type { ContentTitle } from '../types/content';

const sections: Record<string, {heading: string;blurb: string;items: ContentTitle[];}> = {
  film: {
    heading: 'Movies',
    blurb: 'Features from HavaVerse Originals and independent creators.',
    items: titles.filter((t) => t.kind === 'Film')
  },
  series: {
    heading: 'Series',
    blurb: 'Episodic stories, season by season.',
    items: titles.filter((t) => t.kind === 'Series')
  },
  music: {
    heading: 'Music',
    blurb: 'Music videos, sessions and visual albums.',
    items: titles.filter((t) => t.kind === 'Music')
  },
  sports: {
    heading: 'Sports',
    blurb: 'Fixtures, live matches, highlights and analysis.',
    items: titles.filter((t) => t.kind === 'Sports')
  }
};

/** Personal shelves moved into the canonical Library. */
const libraryShelves: Record<string, string> = {
  watchlist: 'watchlist',
  continue: 'continue',
  downloads: 'downloads',
  history: 'history'
};

export function Browse() {
  const { section = 'film' } = useParams();
  if (libraryShelves[section]) return <Navigate to={`/library?shelf=${libraryShelves[section]}`} replace />;

  const config = sections[section];

  if (!config) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-8 text-center">
        <CompassIcon className="h-8 w-8 text-mist-400" aria-hidden="true" />
        <h1 className="text-xl font-bold capitalize text-white">{section}</h1>
        <p className="max-w-md text-sm leading-relaxed text-mist-300">
          This surface is part of a later phase of the HavaVerse roadmap. The MVP proves the core
          loop first: create in Studio, publish, discover on Home, then engage and monetise.
        </p>
        <Link
          to="/"
          className="mt-2 rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Back to home
        </Link>
      </div>);

  }

  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">{config.heading}</h1>
        <p className="mt-1 text-sm text-mist-400">{config.blurb}</p>
      </header>

      {config.items.length === 0 ?
      <p className="rounded-2xl border border-white/5 bg-ink-900 p-8 text-center text-sm text-mist-300">
          Nothing here yet. As creators publish, this shelf fills up automatically.
        </p> :

      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {config.items.map((item) =>
        <li key={item.id}>
              <TitleCard title={item} showProgress={section === 'continue'} />
            </li>
        )}
        </ul>
      }
    </div>);

}