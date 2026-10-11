import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon, HeartIcon, MessagesSquareIcon } from 'lucide-react';
import { formatClock, usePodcast } from '../../contexts/PodcastContext';
import type { Episode, Moment } from '../../types/podcast';

interface MomentCardProps {
  moment: Moment;
  episode: Episode;
  discussTo: string;
}

/**
 * A quote is a social object here: reactable, saveable, and discussable at
 * the exact second it was said.
 */
export function MomentCard({ moment, episode, discussTo }: MomentCardProps) {
  const { current, play, seek, saveIdea, hasIdea, pending } = usePodcast();
  const [reacted, setReacted] = React.useState(false);
  const saved = hasIdea(moment.id);
  const busy = pending === `idea:${moment.id}`;

  const jump = () => {
    if (current?.id !== episode.id) play(episode);
    seek(moment.atSeconds);
  };

  return (
    <article className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <button
        type="button"
        onClick={jump}
        className="text-[11px] font-semibold tabular-nums text-brand-cyan transition-colors duration-150 ease-entrance hover:text-white">
        
        {formatClock(moment.atSeconds)} — jump to this moment
      </button>

      <blockquote className="mt-2 text-sm leading-relaxed text-white">
        “{moment.text}”
      </blockquote>
      <p className="mt-1.5 text-[11px] text-mist-400">{moment.speaker}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setReacted((value) => !value)}
          aria-pressed={reacted}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums transition-colors duration-150 ease-entrance ${
          reacted ?
          'border-brand-magenta text-brand-magenta' :
          'border-white/10 text-mist-300 hover:text-white'}`
          }>
          
          <HeartIcon
            className={`h-3 w-3 ${reacted ? 'fill-current' : ''}`}
            aria-hidden="true" />
          
          {(moment.reactions + (reacted ? 1 : 0)).toLocaleString('en-NG')}
        </button>

        <Link
          to={discussTo}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
          
          <MessagesSquareIcon className="h-3 w-3" aria-hidden="true" />
          {moment.comments.toLocaleString('en-NG')}
        </Link>

        <button
          type="button"
          disabled={saved || busy}
          onClick={() =>
          saveIdea({
            momentId: moment.id,
            episodeId: episode.id,
            text: moment.text,
            speaker: moment.speaker,
            atSeconds: moment.atSeconds
          })
          }
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ease-entrance ${
          saved ?
          'cursor-default border-brand-amber/40 text-brand-amber' :
          'border-white/10 text-mist-300 hover:text-white'}`
          }>
          
          <BookmarkIcon
            className={`h-3 w-3 ${saved ? 'fill-current' : ''}`}
            aria-hidden="true" />
          
          {saved ? 'Saved' : busy ? 'Saving…' : 'Save idea'}
        </button>
      </div>
    </article>);

}