import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, LockIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import type { StoryBibleEntry } from '../../types/director';

const sectionTitle: Record<StoryBibleEntry['section'], string> = {
  narrative: 'Narrative',
  character: 'Characters',
  world: 'World',
  'production-rules': 'Production rules'
};

export function StoryBiblePage() {
  const { bible, characters, locations, status, reload, relockCharacter, pending } = useDirector();

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading the Story Bible…" />
      </div>);

  }
  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorBlock message="The Story Bible could not be loaded." onRetry={reload} />
      </div>);

  }

  const sections: StoryBibleEntry['section'][] = ['narrative', 'world', 'production-rules'];

  return (
    <div className="p-4 pb-12 sm:p-5">
      <Link
        to="/studio"
        className="mb-4 flex w-fit items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to the Director
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Story Bible</h1>
        <p className="mt-1 max-w-2xl text-sm text-mist-400">
          The continuity authority for the whole production. Locked entries cannot be contradicted
          by any agent — the Continuity Agent rejects generations that break them.
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => {
          const entries = bible.filter((e) => e.section === section);
          if (entries.length === 0) return null;
          return (
            <section key={section} aria-labelledby={`sb-${section}`}>
              <h2
                id={`sb-${section}`}
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
                
                {sectionTitle[section]}
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {entries.map((entry) =>
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                  
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      {entry.label}
                      {entry.locked &&
                    <LockIcon className="h-3 w-3 text-brand-cyan" aria-label="Locked" />
                    }
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-mist-200">{entry.value}</p>
                  </li>
                )}
              </ul>
            </section>);

        })}

        <section aria-labelledby="sb-characters">
          <h2
            id="sb-characters"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
            
            Characters
          </h2>
          <ul className="space-y-3">
            {characters.map((character) =>
            <li
              key={character.id}
              id={character.id}
              className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              
                <div className="flex flex-wrap items-start gap-4">
                  <img
                  src={character.portrait}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover" />
                
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white">{character.name}</h3>
                    <p className="text-[11px] text-mist-400">
                      {character.role} · {character.age} · {character.references} references
                    </p>
                    <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    character.continuity === 'locked' ?
                    'bg-brand-cyan/15 text-brand-cyan' :
                    'bg-brand-amber/15 text-brand-amber'}`
                    }>
                    
                      continuity {character.continuity}
                    </span>
                  </div>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {[
                ['Appearance', character.appearance],
                ['Wardrobe', character.wardrobe],
                ['Personality', character.personality],
                ['Motivation', character.motivation],
                ['Voice', character.voice],
                ['Arc', character.arc]].
                map(([label, value]) =>
                <div key={label}>
                      <dt className="text-[10px] uppercase tracking-wide text-mist-400">{label}</dt>
                      <dd className="text-xs leading-relaxed text-mist-200">{value}</dd>
                    </div>
                )}
                </dl>
                {character.continuity !== 'locked' &&
              <div className="mt-3 rounded-xl border border-brand-amber/30 bg-brand-amber/5 p-2.5">
                    <p className="text-[11px] leading-relaxed text-brand-amber">
                      This reference package has drifted. Shots containing this character will fail
                      the consistency check until it is re-locked.
                    </p>
                    <button
                  type="button"
                  onClick={() => relockCharacter(character.id)}
                  disabled={pending === `relock:${character.id}`}
                  className="mt-2 rounded-full border border-brand-amber/40 px-4 py-1.5 text-[11px] font-semibold text-brand-amber transition-colors duration-150 ease-entrance hover:bg-brand-amber/10 disabled:text-mist-400">
                  
                      {pending === `relock:${character.id}` ?
                  'Re-locking…' :
                  'Re-lock reference package'}
                    </button>
                  </div>
              }
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="sb-locations">
          <h2
            id="sb-locations"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
            
            Locations
          </h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {locations.map((location) =>
            <li
              key={location.id}
              className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
              
                <img src={location.plate} alt="" className="aspect-video w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white">{location.name}</h3>
                  <p className="text-[11px] text-mist-400">{location.period}</p>
                  <dl className="mt-2 space-y-1.5">
                    {[
                  ['Architecture', location.architecture],
                  ['Lighting', location.lighting],
                  ['Weather', location.weather]].
                  map(([label, value]) =>
                  <div key={label}>
                        <dt className="text-[10px] uppercase tracking-wide text-mist-400">
                          {label}
                        </dt>
                        <dd className="text-[11px] leading-relaxed text-mist-200">{value}</dd>
                      </div>
                  )}
                  </dl>
                  <p className="mt-2 text-[10px] text-mist-400">
                    Time variants: {location.timeVariants.join(' · ')}
                  </p>
                </div>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>);

}