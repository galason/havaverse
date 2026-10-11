import { analytics } from './analytics';
import { isStringArray, readJSON, writeJSON } from '../utils/storage';

/**
 * SOCIAL GRAPH — who this identity follows.
 *
 * Production contract:
 *   GET    /api/social/following            → string[] (creator handles)
 *   PUT    /api/social/following/:handle
 *   DELETE /api/social/following/:handle
 *
 * The server owns the follow edge (it drives notifications and ranking).
 * Until it exists, follows persist on this device only.
 */

const KEY = 'hv.social.following';

const bare = (handle: string) => handle.replace(/^@/, '');

let following: string[] = readJSON<string[]>(KEY, [], isStringArray);

function listFollowing(): string[] {
  return [...following];
}

function setFollowing(handle: string, follow: boolean): string[] {
  const has = following.includes(handle);
  if (follow && !has) following = [...following, handle];
  if (!follow && has) following = following.filter((h) => h !== handle);
  writeJSON(KEY, following);
  if (follow && !has) analytics.emit('creator_followed', 'watch', `creator:${bare(handle)}`);
  return listFollowing();
}

export const socialApi = { listFollowing, setFollowing };