import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import type { CreativeUniverse } from '../../types/dashboard';
import { ProgressBar } from './primitives';

/**
 * The content graph of the viewer's own work, summarised. The point of this
 * module is the sentence underneath it: a HavaVerse creator is not producing
 * isolated videos, they are building a connected world — so every node links
 * to the real surface, and nodes with nothing behind them say so.
 */
export function CreativeUniversePanel({ universe }: {universe: CreativeUniverse;}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-ink-850">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="relative min-h-[180px]">
          <img src={universe.poster} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/50 to-transparent lg:bg-gradient-to-r" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display text-2xl tracking-wide text-white">{universe.title}</h3>
            <p className="mt-0.5 text-xs text-mist-300">
              {universe.format} · {universe.stage}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar value={universe.progress} tone="amber" />
              </div>
              <span className="text-xs font-semibold text-white">{universe.progress}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {universe.stats.map((stat) =>
            <div key={stat.label} className="rounded-lg bg-white/5 px-3 py-2.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 font-display text-xl tracking-wide text-white">
                  {stat.value}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {universe.nodes.map((node) =>
            node.ready ?
            <Link
              key={node.label}
              to={node.to}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-mist-200 transition-colors duration-150 ease-entrance hover:border-brand-indigo/40 hover:text-white">
              
                  {node.label}
                </Link> :

            <span
              key={node.label}
              title="Nothing published here yet"
              className="cursor-not-allowed rounded-full border border-dashed border-white/10 px-3 py-1.5 text-xs font-medium text-mist-400">
              
                  {node.label} · not yet
                </span>

            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-mist-400">
            You don’t just publish titles. Each of these is a real edge in the content graph, and
            audiences can walk them.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={universe.continueTo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
              Continue production
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              to={universe.universeTo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              View universe
            </Link>
            <a
              href="#hava-command"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-white/10">
              
              <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Ask Hava
            </a>
          </div>
        </div>
      </div>
    </div>);

}