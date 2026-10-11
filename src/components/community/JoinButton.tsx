import React from 'react';
import { CheckIcon, Loader2Icon } from 'lucide-react';
import { useCommunity } from '../../contexts/CommunityContext';

interface JoinButtonProps {
  slug: string;
  name: string;
  size?: 'sm' | 'md';
  full?: boolean;
}

export function JoinButton({ slug, name, size = 'sm', full = false }: JoinButtonProps) {
  const { isMember, join, leave, pendingCommunity } = useCommunity();
  const [hover, setHover] = React.useState(false);
  const joined = isMember(slug);
  const busy = pendingCommunity === slug;

  const label = busy ? 'Working…' : joined ? hover ? 'Leave' : 'Joined' : 'Join';

  return (
    <button
      type="button"
      disabled={busy}
      aria-pressed={joined}
      aria-label={joined ? `Leave ${name}` : `Join ${name}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (joined) leave(slug, name);else
        join(slug, name);
      }}
      className={[
      'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-150 ease-entrance disabled:opacity-60',
      size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-5 py-2.5 text-sm',
      full ? 'w-full' : '',
      joined ?
      hover ?
      'border border-live/50 text-live' :
      'border border-white/20 text-mist-200' :
      'bg-brand-indigo text-white hover:bg-brand-violet'].
      join(' ')}>
      
      {busy ?
      <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> :
      joined && !hover ?
      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> :
      null}
      {label}
    </button>);

}