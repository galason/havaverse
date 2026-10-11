import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, LibraryIcon } from 'lucide-react';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryItemCard } from '../components/library/LibraryItemCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/community/StateBlocks';
import type { LibraryShelf, ShelfId } from '../types/library';

const PREVIEW = 6;

export function Library() {
  const [params, setParams] = useSearchParams();
  const { shelves, total, remove, removing, creationsStatus, reloadCreations } = useLibrary();
  const requested = params.get('shelf') as ShelfId | null;
  const active = shelves.find((s) => s.id === requested) ?? null;

  const filled = shelves.filter((s) => s.items.length > 0);
  const empty = shelves.filter((s) => s.items.length === 0);

  function choose(id: ShelfId | null) {
    setParams(id ? { shelf: id } : {}, { replace: false });
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="min-h-full w-full bg-ink-950 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Library</h1>
          <p className="mt-1.5 text-sm text-mist-300">
            {total === 0 ?
            'Everything you save, follow, buy and make across HavaVerse lands here.' :
            `${total} things across ${filled.length} shelves — watching, listening, communities, purchases and your own work.`}
          </p>
        </div>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Library shelves" className="lg:sticky lg:top-20 lg:self-start">
          <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-3 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            <li className="shrink-0">
              <ShelfTab label="Everything" count={total} selected={!active} onClick={() => choose(null)} />
            </li>
            {shelves.map((s) =>
            <li key={s.id} className="shrink-0">
                <ShelfTab label={s.label} count={s.items.length} selected={active?.id === s.id} onClick={() => choose(s.id)} />
              </li>
            )}
          </ul>
        </nav>

        <main className="mt-4 min-w-0 lg:mt-0">
          {active ?
          <ShelfView
            shelf={active}
            onRemove={remove}
            removing={removing}
            creationsStatus={creationsStatus}
            reloadCreations={reloadCreations} /> :

          total === 0 ?
          <EmptyBlock
            icon={<LibraryIcon className="h-6 w-6" aria-hidden="true" />}
            title="Your library is empty"
            body="Save a title, like a track, join a community or start a Studio project — it all collects here."
            action={
            <Link to="/" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mist-100">
                  Discover HavaVerse
                </Link>
            } /> :


          <div className="space-y-12">
              {filled.map((shelf) =>
            <section key={shelf.id} aria-labelledby={`shelf-${shelf.id}`}>
                  <div className="mb-4 flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <h2 id={`shelf-${shelf.id}`} className="text-lg font-bold text-white">
                        {shelf.label}
                        <span className="ml-2 text-sm font-medium text-mist-400">{shelf.items.length}</span>
                      </h2>
                      <p className="text-xs text-mist-400">{shelf.description}</p>
                    </div>
                    {shelf.items.length > PREVIEW &&
                <button
                  type="button"
                  onClick={() => choose(shelf.id)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-mist-200 hover:text-white">
                  
                        See all
                        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                }
                  </div>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-6">
                    {shelf.items.slice(0, PREVIEW).map((item) =>
                <LibraryItemCard key={item.key} item={item} onRemove={remove} removing={removing === item.key} />
                )}
                  </ul>
                </section>
            )}

              {empty.length > 0 &&
            <section aria-labelledby="shelf-empty" className="border-t border-white/5 pt-6">
                  <h2 id="shelf-empty" className="text-xs font-semibold text-mist-400">
                    Nothing here yet
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {empty.map((s) =>
                <li key={s.id}>
                        <Link
                    to={s.emptyAction.to}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-mist-200 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
                    
                          {s.label}
                          <span className="text-mist-400">· {s.emptyAction.label}</span>
                        </Link>
                      </li>
                )}
                  </ul>
                </section>
            }
            </div>
          }
        </main>
      </div>
    </div>);

}

function ShelfTab({
  label,
  count,
  selected,
  onClick





}: {label: string;count: number;selected: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      className={[
      'flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150 ease-entrance lg:rounded-lg lg:py-2',
      selected ? 'bg-white/10 font-semibold text-white' : 'text-mist-300 hover:bg-white/5 hover:text-white'].
      join(' ')}>
      
      {label}
      <span className={['text-xs tabular-nums', selected ? 'text-mist-200' : 'text-mist-400'].join(' ')}>{count}</span>
    </button>);

}

function ShelfView({
  shelf,
  onRemove,
  removing,
  creationsStatus,
  reloadCreations






}: {shelf: LibraryShelf;onRemove: ReturnType<typeof useLibrary>['remove'];removing: string | null;creationsStatus: 'loading' | 'ready' | 'error';reloadCreations: () => Promise<void>;}) {
  const waitingOnStudio = shelf.id === 'creations' && creationsStatus !== 'ready';

  return (
    <section aria-labelledby="shelf-heading">
      <h2 id="shelf-heading" className="text-2xl font-bold text-white">
        {shelf.label}
      </h2>
      <p className="mt-1 text-sm text-mist-300">{shelf.description}</p>

      {shelf.id === 'downloads' && shelf.items.length > 0 &&
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-mist-400">
          The offline licence server isn’t connected yet, so these requests are recorded but can’t play offline.
          Nothing here is marked as available offline until a licence has actually been issued.
        </p>
      }

      <div className="mt-6">
        {waitingOnStudio ?
        creationsStatus === 'loading' ?
        <LoadingBlock label="Loading your Studio projects…" /> :

        <ErrorBlock message="Your Studio projects couldn’t be loaded. The rest of your library is unaffected." onRetry={reloadCreations} /> :

        shelf.items.length === 0 ?
        <EmptyBlock
          title={`No ${shelf.label.toLowerCase()} yet`}
          body={shelf.emptyBody}
          action={
          <Link
            to={shelf.emptyAction.to}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mist-100">
            
                {shelf.emptyAction.label}
              </Link>
          } /> :


        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {shelf.items.map((item) =>
          <LibraryItemCard key={item.key} item={item} onRemove={onRemove} removing={removing === item.key} />
          )}
          </ul>
        }
      </div>
    </section>);

}