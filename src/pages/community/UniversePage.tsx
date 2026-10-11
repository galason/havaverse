import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpenIcon,
  ClapperboardIcon,
  FilmIcon,
  Gamepad2Icon,
  MusicIcon,
  PaletteIcon,
  UserIcon } from
'lucide-react';
import { communityApi } from '../../services/communityApi';
import { seedCharacters } from '../../data/communityContent';
import { personById } from '../../data/communityPeople';
import { recommendedCommunities } from '../../data/communityHub';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { OriginTag } from '../../components/community/OriginTag';
import { JoinButton } from '../../components/community/JoinButton';
import type { FanCreationRecord, UniverseRecord } from '../../types/communityEntities';

const icons = {
  Film: FilmIcon,
  Book: BookOpenIcon,
  Character: UserIcon,
  Music: MusicIcon,
  'Behind the scenes': ClapperboardIcon,
  Game: Gamepad2Icon,
  'Fan work': PaletteIcon
} as const;

const tabs = ['Overview', 'Characters', 'Stories', 'Media'] as const;
type Tab = (typeof tabs)[number];

export function UniversePage() {
  const { universeId = 'railway', section } = useParams();
  const [universe, setUniverse] = React.useState<UniverseRecord | null>(null);
  const [creations, setCreations] = React.useState<FanCreationRecord[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const initialTab: Tab =
  section === 'characters' ?
  'Characters' :
  section === 'stories' ?
  'Stories' :
  section === 'media' ?
  'Media' :
  'Overview';
  const [tab, setTab] = React.useState<Tab>(initialTab);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [one, all] = await Promise.all([
    communityApi.getUniverse(universeId),
    communityApi.listFanCreations()]
    );
    if (one.ok && one.data) {
      setUniverse(one.data);
      setCreations(all.ok ? all.data.filter((c) => c.universeId === universeId) : []);
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [universeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading universe…" />
      </div>);

  }

  if (status === 'missing' || !universe) {
    return (
      <div className="p-5">
        <ErrorBlock message="That universe does not exist yet." onRetry={load} />
      </div>);

  }

  const community = recommendedCommunities.find((c) => c.slug === universe.communitySlug);
  const characters = seedCharacters.filter((c) => c.universeId === universe.id);
  const officialNodes = universe.nodes.filter((n) => n.official);

  return (
    <article className="pb-12">
      <div className="relative h-52 w-full overflow-hidden sm:h-64">
        <img src={universe.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--c-ink-950))_10%,rgb(var(--c-ink-950)/0.4)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-magenta">
            Story universe
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {universe.name}
          </h1>
          <p className="mt-1 text-sm text-mist-300">{universe.members} members</p>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <p className="max-w-2xl flex-1 text-sm leading-relaxed text-mist-300">
            {universe.description}
          </p>
          {community && <JoinButton slug={community.slug} name={community.name} size="md" />}
        </div>

        <div role="tablist" aria-label="Universe sections" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto border-b border-white/5 pb-0">
          {tabs.map((option) =>
          <button
            key={option}
            role="tab"
            type="button"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={[
            'shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ease-entrance',
            tab === option ?
            'border-brand-magenta text-white' :
            'border-transparent text-mist-400 hover:text-white'].
            join(' ')}>
            
              {option}
            </button>
          )}
        </div>

        {tab === 'Overview' &&
        <section aria-label="Everything in this universe" className="mt-5">
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
              {universe.nodes.map((node) => {
              const Icon = icons[node.kind];
              return (
                <li key={node.id} className="bg-ink-900">
                    <Link
                    to={node.to}
                    className="flex h-full items-start gap-3 p-4 transition-colors duration-150 ease-entrance hover:bg-white/5">
                    
                      <span
                      className={[
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      node.official ?
                      'bg-brand-indigo/15 text-brand-indigo' :
                      'bg-brand-amber/15 text-brand-amber'].
                      join(' ')}>
                      
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-white">
                          {node.label}
                        </span>
                        <span className="mt-1 block">
                          <OriginTag origin={node.official ? 'official' : 'fan'} />
                        </span>
                        <span className="mt-1 block text-[11px] text-mist-400">{node.meta}</span>
                      </span>
                    </Link>
                  </li>);

            })}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
              {officialNodes.length} official works and {creations.length} fan contributions share
              these edges. Play reads them for recommendations, Studio for rights, Market for
              products.
            </p>
          </section>
        }

        {tab === 'Characters' &&
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) =>
          <li key={character.id}>
                <Link
              to={`/characters/${character.id}`}
              className="flex h-full gap-3 overflow-hidden rounded-2xl border border-white/5 bg-ink-900 p-3 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  <img
                src={character.image}
                alt=""
                loading="lazy"
                className="h-20 w-16 shrink-0 rounded-lg object-cover" />
              
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">{character.name}</span>
                    <span className="block text-[11px] text-mist-400">{character.role}</span>
                    <span className="mt-1.5 block line-clamp-3 text-xs leading-relaxed text-mist-300">
                      {character.bio}
                    </span>
                  </span>
                </Link>
              </li>
          )}
          </ul>
        }

        {tab === 'Stories' &&
        <div className="mt-5 space-y-3">
            <article className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <OriginTag origin="official" />
              <h2 className="mt-2 text-base font-bold text-white">Railway Chronicles</h2>
              <p className="mt-1 text-xs text-mist-400">Serialised story · 14 chapters · Adaeze Films</p>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">
                The written companion to the film, following the line's construction forty years
                before Amara was born.
              </p>
              <Link
              to="/title/the-last-train"
              className="mt-3 inline-block text-xs font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
              
                Open the film this belongs to →
              </Link>
            </article>
            {creations.
          filter((c) => c.kind === 'Fan story' || c.kind === 'Theory').
          map((creation) =>
          <article key={creation.id} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                  <OriginTag origin="fan" />
                  <h2 className="mt-2 text-base font-bold text-white">
                    <Link
                to={`/fan-creations/${creation.id}`}
                className="transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                
                      {creation.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-mist-400">
                    {personById(creation.authorId).name} · {creation.views} views
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-mist-300">{creation.body}</p>
                </article>
          )}
          </div>
        }

        {tab === 'Media' &&
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {creations.map((creation) =>
          <li key={creation.id}>
                <Link
              to={`/fan-creations/${creation.id}`}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  {creation.image ?
              <img src={creation.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /> :

              <span className="flex aspect-[4/3] w-full items-center justify-center bg-ink-850">
                      <PaletteIcon className="h-6 w-6 text-mist-400" aria-hidden="true" />
                    </span>
              }
                  <span className="p-3">
                    <OriginTag origin="fan" />
                    <span className="mt-1.5 block text-xs font-bold text-white">
                      {creation.title}
                    </span>
                    <span className="block text-[11px] text-mist-400">{creation.kind}</span>
                  </span>
                </Link>
              </li>
          )}
          </ul>
        }
      </div>
    </article>);

}