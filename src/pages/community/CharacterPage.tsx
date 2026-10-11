import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, MessageSquareIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { OriginTag } from '../../components/community/OriginTag';
import type { CharacterRecord, Discussion } from '../../types/communityEntities';

export function CharacterPage() {
  const { characterId = '' } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = React.useState<CharacterRecord | null>(null);
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'missing'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [one, all] = await Promise.all([
    communityApi.getCharacter(characterId),
    communityApi.listDiscussions()]
    );
    if (one.ok && one.data) {
      const name = one.data.name.toLowerCase();
      setCharacter(one.data);
      setDiscussions(
        all.ok ?
        all.data.filter(
          (d) =>
          d.tags.some((t) => t.toLowerCase() === name) ||
          d.title.toLowerCase().includes(name) ||
          d.body.toLowerCase().includes(name)
        ) :
        []
      );
      setStatus('ready');
    } else {
      setStatus('missing');
    }
  }, [characterId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading character…" />
      </div>);

  }

  if (status === 'missing' || !character) {
    return (
      <div className="p-5">
        <ErrorBlock message="No character profile for that id." onRetry={load} />
      </div>);

  }

  return (
    <article className="mx-auto max-w-4xl p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <header className="flex flex-wrap gap-5">
        <img
          src={character.image}
          alt={character.name}
          className="h-48 w-36 shrink-0 rounded-2xl border border-white/5 object-cover" />
        
        <div className="min-w-0 flex-1">
          <OriginTag origin="official" label="Official character" />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{character.name}</h1>
          <p className="mt-1 text-sm text-mist-400">{character.role}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-200">{character.bio}</p>
          <Link
            to={`/universes/${character.universeId}`}
            className="mt-3 inline-block text-xs font-semibold text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
            
            Part of The Railway Universe →
          </Link>
        </div>
      </header>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
          <h2 className="text-sm font-bold text-white">Appears in</h2>
          <ul className="mt-2.5 space-y-1.5">
            {character.appearsIn.map((item) =>
            <li key={item.label}>
                <Link
                to={item.to}
                className="text-xs text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
                
                  {item.label} →
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
          <h2 className="text-sm font-bold text-white">Relationships</h2>
          <ul className="mt-2.5 space-y-1.5">
            {character.relationships.map((relation) =>
            <li key={relation.name} className="text-xs text-mist-300">
                <Link
                to={relation.to}
                className="font-semibold text-white transition-colors duration-150 ease-entrance hover:text-brand-magenta">
                
                  {relation.name}
                </Link>{' '}
                · {relation.relation}
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/5 bg-ink-900 p-4 lg:col-span-2">
          <h2 className="text-sm font-bold text-white">Quotes</h2>
          <ul className="mt-2.5 space-y-2">
            {character.quotes.map((quote) =>
            <li
              key={quote}
              className="border-l-2 border-brand-magenta/60 pl-3 text-sm italic leading-relaxed text-mist-200">
              
                {quote}
              </li>
            )}
          </ul>
        </section>
      </div>

      <section aria-labelledby="character-discussions" className="mt-6">
        <h2 id="character-discussions" className="mb-3 flex items-center gap-2 text-base font-bold text-white">
          <MessageSquareIcon className="h-4 w-4 text-brand-indigo" aria-hidden="true" />
          Fan discussions about {character.name}
        </h2>
        {discussions.length === 0 ?
        <p className="rounded-2xl border border-dashed border-white/10 bg-ink-900 px-4 py-6 text-center text-xs text-mist-400">
            Nobody has started a discussion about {character.name} yet.
          </p> :

        <ul className="space-y-2">
            {discussions.map((discussion) =>
          <li key={discussion.id}>
                <Link
              to={`/discussions/${discussion.id}`}
              className="block rounded-xl border border-white/5 bg-ink-900 p-3.5 transition-colors duration-150 ease-entrance hover:border-white/20">
              
                  <span className="block text-sm font-semibold text-white">{discussion.title}</span>
                  <span className="mt-0.5 block text-[11px] text-mist-400">
                    {discussion.kind} · {discussion.replies.length} replies ·{' '}
                    {discussion.likes.toLocaleString()} likes
                  </span>
                </Link>
              </li>
          )}
          </ul>
        }
      </section>
    </article>);

}