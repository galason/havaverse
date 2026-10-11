import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, UsersIcon } from 'lucide-react';
import { watchApi } from '../../services/watchApi';
import { Sheet } from './Sheet';

type Visibility = 'private' | 'friends' | 'community';

const options: {id: Visibility;label: string;detail: string;}[] = [
{ id: 'private', label: 'Private', detail: 'Only people you send the link to.' },
{ id: 'friends', label: 'Friends only', detail: 'Anyone you follow who also follows you.' },
{ id: 'community', label: 'Community', detail: 'Open to members of the title’s community.' }];


interface WatchPartySheetProps {
  slug: string;
  titleName: string;
  onClose: () => void;
  onCreated: (partyId: string) => void;
}

export function WatchPartySheet({ slug, titleName, onClose, onCreated }: WatchPartySheetProps) {
  const [visibility, setVisibility] = React.useState<Visibility>('friends');
  const [creating, setCreating] = React.useState(false);
  const [created, setCreated] = React.useState<{id: string;inviteUrl: string;} | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function create() {
    setCreating(true);
    const result = await watchApi.createParty(slug, visibility);
    setCreating(false);
    if (!result.ok) return;
    watchApi.track('watch_party_created', slug, visibility);
    setCreated(result.data);
    onCreated(result.data.id);
  }

  if (created) {
    return (
      <Sheet title="Your watch party is live" onClose={onClose}>
        <p className="flex items-center gap-2 text-sm text-white">
          <CheckIcon className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
          Playback in this tab is now the party's clock.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5">
          <input
            readOnly
            value={created.inviteUrl}
            aria-label="Invite link"
            className="w-full bg-transparent text-xs text-mist-200 focus:outline-none" />
          
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(created.inviteUrl).catch(() => undefined);
              setCopied(true);
            }}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-950">
            
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
          Guests joining from another device need the realtime service to share your clock. Until
          that is connected, each viewer runs their own playback and the chat is local to this tab.
        </p>
        <Link
          to={`/watch-parties/${created.id}`}
          className="mt-4 block rounded-full bg-brand-indigo px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
          
          Open the party room
        </Link>
      </Sheet>);

  }

  return (
    <Sheet title="Start a watch party" description={titleName} onClose={onClose}>
      <fieldset>
        <legend className="sr-only">Who can join</legend>
        <div className="space-y-2">
          {options.map((option) =>
          <label
            key={option.id}
            className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors duration-150 ease-entrance ${
            visibility === option.id ?
            'border-brand-indigo bg-brand-indigo/5' :
            'border-white/10 hover:border-white/25'}`
            }>
            
              <input
              type="radio"
              name="visibility"
              checked={visibility === option.id}
              onChange={() => setVisibility(option.id)}
              className="mt-0.5 h-3.5 w-3.5 accent-brand-indigo" />
            
              <span>
                <span className="block text-xs font-semibold text-white">{option.label}</span>
                <span className="block text-[11px] text-mist-400">{option.detail}</span>
              </span>
            </label>
          )}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={create}
        disabled={creating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-indigo px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet disabled:bg-ink-700 disabled:text-mist-400">
        
        <UsersIcon className="h-4 w-4" aria-hidden="true" />
        {creating ? 'Starting…' : 'Start watch party'}
      </button>
    </Sheet>);

}