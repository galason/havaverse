import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import { titles } from '../../data/catalog';
import { recommendedCommunities } from '../../data/communityHub';
import { useApp } from '../../contexts/AppContext';
import { useCommunity } from '../../contexts/CommunityContext';
import type { WatchPartyRecord } from '../../types/communityEntities';

const visibilities: {id: WatchPartyRecord['visibility'];label: string;blurb: string;}[] = [
{ id: 'public', label: 'Public', blurb: 'Anyone on HavaVerse can join.' },
{ id: 'community', label: 'Community', blurb: 'Only members of the chosen community.' },
{ id: 'invite', label: 'Invite only', blurb: 'Only people you share the link with.' }];


export function CreateWatchParty() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { bump } = useCommunity();

  const [title, setTitle] = React.useState('');
  const [contentSlug, setContentSlug] = React.useState(titles[0]?.slug ?? '');
  const [communitySlug, setCommunitySlug] = React.useState(recommendedCommunities[0].slug);
  const [when, setWhen] = React.useState('');
  const [visibility, setVisibility] = React.useState<WatchPartyRecord['visibility']>('public');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const content = titles.find((t) => t.slug === contentSlug);
    const result = await communityApi.createWatchParty({
      title,
      description,
      contentSlug,
      contentTitle: content?.name ?? 'Selected title',
      communitySlug,
      when: when ? `Scheduled · ${when}` : 'Starting now',
      visibility
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    bump('partiesHosted');
    showToast('Watch party created');
    navigate(`/watch-parties/${result.data.id}`);
  };

  const field =
  'h-11 w-full rounded-xl border border-white/10 bg-ink-850 px-3 text-sm text-white transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none';

  return (
    <div className="mx-auto max-w-2xl p-4 pb-12 sm:p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-white">Create a watch party</h1>
      <p className="mt-1 text-sm text-mist-400">
        Pick something to watch, choose who it is for, and invite your community.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="wp-title" className="mb-1.5 block text-xs font-medium text-mist-200">
            Party name
          </label>
          <input
            id="wp-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Friday night rewatch"
            className={field} />
          
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="wp-content" className="mb-1.5 block text-xs font-medium text-mist-200">
              What are you watching?
            </label>
            <select
              id="wp-content"
              value={contentSlug}
              onChange={(e) => setContentSlug(e.target.value)}
              className={field}>
              
              {titles.map((t) =>
              <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="wp-community" className="mb-1.5 block text-xs font-medium text-mist-200">
              Community
            </label>
            <select
              id="wp-community"
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              className={field}>
              
              {recommendedCommunities.map((c) =>
              <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="wp-when" className="mb-1.5 block text-xs font-medium text-mist-200">
            Start time <span className="text-mist-400">(leave empty to start now)</span>
          </label>
          <input id="wp-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={field} />
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-medium text-mist-200">Who can join?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {visibilities.map((option) => {
              const active = visibility === option.id;
              return (
                <label
                  key={option.id}
                  className={[
                  'cursor-pointer rounded-xl border p-3 transition-colors duration-150 ease-entrance',
                  active ? 'border-brand-indigo bg-brand-indigo/10' : 'border-white/10 bg-ink-850 hover:border-white/25'].
                  join(' ')}>
                  
                  <input
                    type="radio"
                    name="visibility"
                    value={option.id}
                    checked={active}
                    onChange={() => setVisibility(option.id)}
                    className="sr-only" />
                  
                  <span className="block text-xs font-bold text-white">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-mist-400">
                    {option.blurb}
                  </span>
                </label>);

            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="wp-desc" className="mb-1.5 block text-xs font-medium text-mist-200">
            Description <span className="text-mist-400">(optional)</span>
          </label>
          <textarea
            id="wp-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Spoiler rules, what you'll be watching for, anything people should know."
            className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-3.5 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
          
        </div>

        {error &&
        <p role="alert" className="rounded-xl border border-live/30 bg-live/5 px-3 py-2.5 text-xs font-semibold text-live">
            {error}
          </p>
        }

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
            
            {submitting ? 'Creating…' : 'Create watch party'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/watch-parties')}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors duration-150 ease-entrance hover:text-white">
            
            Cancel
          </button>
        </div>
      </form>
    </div>);

}