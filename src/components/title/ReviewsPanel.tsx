import React from 'react';
import { EyeIcon, StarIcon, ThumbsUpIcon, Trash2Icon } from 'lucide-react';
import type { Review, ReviewSummary } from '../../types/title';
import { titleApi } from '../../services/titleApi';

interface ReviewsPanelProps {
  slug: string;
  summary: ReviewSummary;
  spoilerMode: 'free' | 'full';
  onToast: (message: string) => void;
}

export function ReviewsPanel({ slug, summary, spoilerMode, onToast }: ReviewsPanelProps) {
  const [reviews, setReviews] = React.useState<Review[]>(summary.reviews);
  const [yourRating, setYourRating] = React.useState<number | null>(summary.yourRating);
  const [draftRating, setDraftRating] = React.useState(0);
  const [body, setBody] = React.useState('');
  const [spoiler, setSpoiler] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState<string[]>([]);
  const [, force] = React.useReducer((n: number) => n + 1, 0);

  const mine = reviews.find((r) => r.mine);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await titleApi.submitReview(slug, draftRating, body, spoiler);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReviews((prev) => [result.data, ...prev.filter((r) => !r.mine)]);
    setYourRating(result.data.rating);
    setBody('');
    onToast('Your review is live');
  }

  async function remove() {
    await titleApi.deleteReview(slug);
    setReviews((prev) => prev.filter((r) => !r.mine));
    setYourRating(null);
    setDraftRating(0);
    onToast('Review removed');
  }

  const signals = [
  { label: 'HavaVerse', value: summary.hava, note: 'Blended signal' },
  { label: 'Community', value: summary.community, note: summary.communityCount },
  { label: 'Critics', value: summary.critics, note: summary.criticCount }];


  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {signals.map((s) =>
        <div key={s.label} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
              {s.label}
            </p>
            <p className="mt-1 font-display text-3xl text-white">{s.value.toFixed(1)}</p>
            <p className="text-[11px] text-mist-400">{s.note}</p>
          </div>
        )}
        <div className="rounded-2xl border border-white/5 bg-ink-900 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">
            Your rating
          </p>
          <p className="mt-1 font-display text-3xl text-white">
            {yourRating ? yourRating.toFixed(1) : '—'}
          </p>
          <p className="text-[11px] text-mist-400">
            {yourRating ? 'Counted in the community signal' : 'Not rated yet'}
          </p>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-mist-400">
        These are signals, not a verdict. Community and critic scores are reported separately
        and never merged into a single authoritative number.
      </p>

      {/* Write / manage your review */}
      {mine ?
      <div className="rounded-2xl border border-brand-indigo/30 bg-brand-indigo/5 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-white">
            Your review
            <span className="flex items-center gap-1 text-brand-amber">
              <StarIcon className="h-3 w-3 fill-brand-amber" aria-hidden="true" />
              {mine.rating}/10
            </span>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-200">{mine.body}</p>
          <button
          type="button"
          onClick={remove}
          className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-live">
          
            <Trash2Icon className="h-3 w-3" aria-hidden="true" />
            Delete review
          </button>
        </div> :

      <form onSubmit={submit} className="rounded-2xl border border-white/5 bg-ink-900 p-4">
          <p className="text-xs font-semibold text-white">Rate and review</p>
          <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Your rating">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) =>
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={draftRating === n}
            onClick={() => setDraftRating(n)}
            className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors duration-150 ease-entrance ${
            draftRating >= n ?
            'bg-brand-amber text-ink-950' :
            'border border-white/10 text-mist-300 hover:text-white'}`
            }>
            
                {n}
              </button>
          )}
          </div>
          <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="What worked, what didn’t?"
          aria-label="Your review"
          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo focus:outline-none" />
        
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-mist-300">
              <input
              type="checkbox"
              checked={spoiler}
              onChange={(e) => setSpoiler(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20 bg-ink-850" />
            
              Contains spoilers
            </label>
            <button
            type="submit"
            disabled={busy || draftRating === 0}
            className="ml-auto rounded-full bg-brand-indigo px-5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
            
              {busy ? 'Posting…' : 'Post review'}
            </button>
          </div>
          {error &&
        <p role="alert" className="mt-2 text-xs text-live">
              {error}
            </p>
        }
        </form>
      }

      <ul className="space-y-2">
        {reviews.
        filter((r) => !r.mine).
        map((review) => {
          const hidden = review.spoiler && spoilerMode === 'free' && !revealed.includes(review.id);
          const helpful = titleApi.isHelpful(review.id);
          return (
            <li
              key={review.id}
              className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              
                <div className="flex flex-wrap items-center gap-2.5">
                  <img src={review.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-semibold text-white">{review.author}</p>
                    <p className="text-[11px] text-mist-400">
                      {review.source === 'critic' ? 'Critic' : 'Community'} · {review.postedAt}
                    </p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-amber">
                    <StarIcon className="h-3 w-3 fill-brand-amber" aria-hidden="true" />
                    {review.rating}/10
                  </span>
                </div>

                {hidden ?
              <div className="mt-2.5 rounded-xl border border-white/10 bg-ink-850 p-3">
                    <p className="text-xs text-mist-300">
                      Hidden because this review discusses the ending.
                    </p>
                    <button
                  type="button"
                  onClick={() => setRevealed((r) => [...r, review.id])}
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-cyan">
                  
                      <EyeIcon className="h-3 w-3" aria-hidden="true" />
                      Reveal spoiler
                    </button>
                  </div> :

              <p className="mt-2 text-sm leading-relaxed text-mist-200">{review.body}</p>
              }

                <button
                type="button"
                onClick={async () => {
                  await titleApi.markHelpful(review.id);
                  force();
                }}
                aria-pressed={helpful}
                className={`mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
                helpful ? 'text-brand-cyan' : 'text-mist-400 hover:text-white'}`
                }>
                
                  <ThumbsUpIcon className="h-3 w-3" aria-hidden="true" />
                  Helpful · {review.helpful + (helpful ? 1 : 0)}
                </button>
              </li>);

        })}
      </ul>
    </div>);

}