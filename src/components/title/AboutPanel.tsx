import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import type { ContentTitle } from '../../types/content';
import type { TitleExperience } from '../../types/title';

interface AboutPanelProps {
  title: ContentTitle;
  experience: TitleExperience;
}

export function AboutPanel({ title, experience }: AboutPanelProps) {
  const [open, setOpen] = React.useState(false);

  const rows: [string, React.ReactNode][] = [
  ['Genre', `${title.genre} · ${experience.themes.slice(0, 2).join(' · ')}`],
  ['Runtime', title.runtime],
  ['Release date', experience.releaseDate],
  ['Country', experience.country],
  ['Languages', experience.audio.join(' · ')],
  ['Subtitles', experience.subtitles.join(' · ')],
  [
  'Rating',
  <span key="r" className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-live/40 bg-live/10 px-1.5 py-0.5 text-[10px] font-semibold text-live">
          {title.maturity}
        </span>
        <span className="text-mist-300">{experience.advisories.join(', ')}</span>
      </span>],

  ['Production', experience.productionStatus],
  ['AI production', experience.aiProduction]];


  return (
    <section
      aria-labelledby="about-heading"
      className="rounded-2xl border border-white/5 bg-ink-900 p-5">
      
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <h2 id="about-heading" className="text-lg font-bold tracking-tight text-white">
            About this title
          </h2>
          <p
            className={`mt-2 text-sm leading-relaxed text-mist-200 ${open ? '' : 'line-clamp-4'}`}>
            
            {experience.synopsis}
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-indigo">
            
            {open ? 'Show less' : 'Read more'}
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform duration-150 ease-entrance ${open ? 'rotate-180' : ''}`}
              aria-hidden="true" />
            
          </button>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {experience.themes.map((theme) =>
            <li
              key={theme}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist-200">
              
                {theme}
              </li>
            )}
          </ul>
        </div>

        <dl className="space-y-2 border-t border-white/5 pt-4 text-xs lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {rows.map(([label, value]) =>
          <div key={label} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
              <dt className="text-mist-400">{label}</dt>
              <dd className="text-mist-100">{value}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>);

}