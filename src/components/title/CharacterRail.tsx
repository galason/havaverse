import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, EyeIcon, MessageCircleIcon, XIcon } from 'lucide-react';
import type { TitleCharacter } from '../../types/title';
import { bySlug } from '../../data/catalog';

interface CharacterRailProps {
  characters: TitleCharacter[];
  /** Full story mode reveals characters the record marks as spoilers. */
  spoilerMode: 'free' | 'full';
  onToast: (message: string) => void;
}

/**
 * Characters open in a contextual drawer rather than a navigation, so the
 * viewer never loses their place on the title page. The drawer still offers
 * the full character page for anyone who wants to leave.
 */
export function CharacterRail({ characters, spoilerMode, onToast }: CharacterRailProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState<string[]>([]);

  const open = characters.find((c) => c.id === openId) ?? null;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {characters.map((character) => {
          const hidden =
          character.spoiler && spoilerMode === 'free' && !revealed.includes(character.id);
          return (
            <li key={character.id} className="w-40 shrink-0 sm:w-44">
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-ink-850">
                <div className="relative aspect-[3/4]">
                  <img
                    src={character.image}
                    alt=""
                    className={`h-full w-full object-cover transition-transform duration-200 ease-entrance group-hover:scale-[1.03] ${
                    hidden ? 'blur-xl' : ''}`
                    } />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                  {hidden ?
                  <div className="absolute inset-0 grid place-items-center p-3 text-center">
                      <div>
                        <p className="text-[11px] font-semibold text-white">
                          Hidden — appears later in the story
                        </p>
                        <button
                        type="button"
                        onClick={() => setRevealed((r) => [...r, character.id])}
                        className="mt-2 flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[11px] font-semibold text-white">
                        
                          <EyeIcon className="h-3 w-3" aria-hidden="true" />
                          Reveal
                        </button>
                      </div>
                    </div> :

                  <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-sm font-bold text-white">{character.name}</p>
                      <p className="text-[11px] text-mist-300">{character.role}</p>
                    </div>
                  }
                </div>
                {!hidden &&
                <button
                  type="button"
                  onClick={() => setOpenId(character.id)}
                  className="absolute inset-0"
                  aria-label={`Open ${character.name}`} />

                }
              </div>
            </li>);

        })}
      </ul>

      {open &&
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <button
          type="button"
          aria-label="Close character"
          onClick={() => setOpenId(null)}
          className="absolute inset-0 bg-ink-950/80" />
        
          <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-ink-950">
            <div className="relative aspect-[4/3] shrink-0">
              <img src={open.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
              <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="Close"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink-950/70 text-white backdrop-blur hover:bg-ink-900">
              
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-3xl uppercase tracking-tight text-white">
                  {open.name}
                </h3>
                <p className="text-xs text-mist-300">{open.role}</p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <p className="text-sm leading-relaxed text-mist-200">{open.bio}</p>

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                  Appears in
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {open.appearsIn.map((slug) => {
                  const t = bySlug(slug);
                  if (!t) return null;
                  return (
                    <li key={slug}>
                        <Link
                        to={`/title/${slug}`}
                        onClick={() => setOpenId(null)}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900 p-2.5 transition-colors duration-150 ease-entrance hover:border-white/20">
                        
                          <img
                          src={t.poster}
                          alt=""
                          className="h-12 w-9 rounded object-cover" />
                        
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-white">
                              {t.name}
                            </span>
                            <span className="block text-[11px] text-mist-400">
                              {t.kind} · {t.year}
                            </span>
                          </span>
                          <ArrowRightIcon
                          className="ml-auto h-3.5 w-3.5 text-mist-400"
                          aria-hidden="true" />
                        
                        </Link>
                      </li>);

                })}
                </ul>
              </div>

              {open.relationships.length > 0 &&
            <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
                    Relationships
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {open.relationships.map((rel) =>
                <li
                  key={rel.name}
                  className="flex items-baseline justify-between gap-3 text-xs">
                  
                        <span className="font-semibold text-white">{rel.name}</span>
                        <span className="text-right text-mist-400">{rel.relation}</span>
                      </li>
                )}
                  </ul>
                </div>
            }

              <div className="space-y-2">
                {open.to &&
              <Link
                to={open.to}
                onClick={() => setOpenId(null)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-ink-950">
                
                    Explore character
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
              }
                <button
                type="button"
                onClick={() =>
                onToast(
                  `${open.name} is a fictional character — replies are generated, not canon`
                )
                }
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
                
                  <MessageCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Talk to {open.name}
                </button>
                <p className="text-center text-[10px] leading-relaxed text-mist-400">
                  Character conversations are explicitly fictional and generated. They never
                  establish official story canon.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    </>);

}