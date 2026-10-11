import React from 'react';
import { communityApi } from '../../services/communityApi';
import { useCommunity } from '../../contexts/CommunityContext';
import { useApp } from '../../contexts/AppContext';
import type { Discussion, DiscussionKind } from '../../types/communityEntities';
import type { SpoilerLevel } from '../../types/community';

const kinds: DiscussionKind[] = ['Discussion', 'Theory', 'Debate', 'Review', 'Question'];
const spoilers: {id: SpoilerLevel;label: string;}[] = [
{ id: 'safe', label: 'No spoilers' },
{ id: 'current', label: 'Up to episode 5' },
{ id: 'full', label: 'Full spoilers' }];


interface NewDiscussionFormProps {
  communitySlug: string;
  onCreated: (discussion: Discussion) => void;
  onCancel: () => void;
}

export function NewDiscussionForm({ communitySlug, onCreated, onCancel }: NewDiscussionFormProps) {
  const { showToast } = useApp();
  const { bump } = useCommunity();
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [kind, setKind] = React.useState<DiscussionKind>('Discussion');
  const [spoilerLevel, setSpoilerLevel] = React.useState<SpoilerLevel>('safe');
  const [tags, setTags] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await communityApi.createDiscussion({
      communitySlug,
      title,
      body,
      kind,
      spoilerLevel,
      tags: tags.
      split(',').
      map((tag) => tag.trim()).
      filter(Boolean)
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    bump('discussions');
    showToast('Discussion posted');
    onCreated(result.data);
  };

  const field =
  'w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-3 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none';

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-ink-900 p-4">
      <h2 className="text-sm font-bold text-white">Start a discussion</h2>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor="nd-title" className="mb-1.5 block text-xs font-medium text-mist-200">
            Title
          </label>
          <input
            id="nd-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to talk about?"
            className={field} />
          
        </div>

        <div>
          <label htmlFor="nd-body" className="mb-1.5 block text-xs font-medium text-mist-200">
            Body
          </label>
          <textarea
            id="nd-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Make your case. Timestamps help."
            className={`${field} resize-none`} />
          
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="nd-kind" className="mb-1.5 block text-xs font-medium text-mist-200">
              Type
            </label>
            <select
              id="nd-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as DiscussionKind)}
              className="h-11 w-full rounded-xl border border-white/10 bg-ink-850 px-3 text-sm text-white focus:border-brand-indigo focus:outline-none">
              
              {kinds.map((option) =>
              <option key={option} value={option}>
                  {option}
                </option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="nd-tags" className="mb-1.5 block text-xs font-medium text-mist-200">
              Tags <span className="text-mist-400">(comma separated)</span>
            </label>
            <input
              id="nd-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Amara, Continuity"
              className="h-11 w-full rounded-xl border border-white/10 bg-ink-850 px-3 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
            
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-mist-200">Spoiler level</legend>
          <div className="flex flex-wrap gap-1.5">
            {spoilers.map((option) =>
            <label
              key={option.id}
              className={[
              'cursor-pointer rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance',
              spoilerLevel === option.id ?
              'border-brand-indigo bg-brand-indigo/15 text-white' :
              'border-white/10 text-mist-300 hover:text-white'].
              join(' ')}>
              
                <input
                type="radio"
                name="spoiler"
                checked={spoilerLevel === option.id}
                onChange={() => setSpoilerLevel(option.id)}
                className="sr-only" />
              
                {option.label}
              </label>
            )}
          </div>
        </fieldset>
      </div>

      {error &&
      <p role="alert" className="mt-3 text-[11px] font-semibold text-live">
          {error}
        </p>
      }

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="rounded-lg bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
          
          {submitting ? 'Posting…' : 'Post discussion'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
          
          Cancel
        </button>
      </div>
    </form>);

}