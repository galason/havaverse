import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useMusic } from '../contexts/MusicContext';
import { usePodcast } from '../contexts/PodcastContext';
import { useCommunity } from '../contexts/CommunityContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useDirector } from '../contexts/DirectorContext';
import { watchApi } from '../services/watchApi';
import { titleApi } from '../services/titleApi';
import { shortsApi } from '../services/shortsApi';
import { projectsApi } from '../services/projectsApi';
import { buildLibrary } from '../services/libraryApi';
import type { LibraryItem, LibraryShelf } from '../types/library';

/**
 * Reads every shelf from the service that owns it and routes removals back to
 * that same service. The Library never holds its own copy of anything.
 */
export function useLibrary(): {
  shelves: LibraryShelf[];
  total: number;
  remove: (item: LibraryItem) => Promise<void>;
  removing: string | null;
  creationsStatus: 'loading' | 'ready' | 'error';
  reloadCreations: () => Promise<void>;
} {
  const app = useApp();
  const music = useMusic();
  const podcast = usePodcast();
  const community = useCommunity();
  const commerce = useCommerce();
  const director = useDirector();
  const [tick, setTick] = React.useState(0);
  const [removing, setRemoving] = React.useState<string | null>(null);

  // Downloads progress lives in the download service; poll only while one is active.
  const downloads = titleApi.listDownloads();
  const active = downloads.some((d) => d.state !== 'downloaded');
  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 800);
    return () => window.clearInterval(id);
  }, [active]);

  const shelves = React.useMemo(
    () =>
    buildLibrary({
      resume: watchApi.listResume(),
      history: watchApi.listHistory(),
      reactions: watchApi.listReactions(),
      watchlist: app.watchlist,
      downloads: titleApi.listDownloads(),
      likedTracks: music.likes,
      savedEpisodes: podcast.saved,
      followedShows: podcast.followed,
      likedShorts: shortsApi.listLiked(),
      savedShorts: shortsApi.listSaved(),
      savedCommunityItems: community.savedItems,
      following: app.following,
      musicMemberships: music.memberOf,
      memberships: community.memberships,
      ownedProducts: commerce.collection,
      collectedEditions: music.collected,
      project: director.project,
      projects: projectsApi.listSync(),
      activeProjectId: projectsApi.activeId()
    }),
    // tick re-reads service-held stores (resume, downloads, shorts) after a removal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
    tick,
    app.watchlist,
    app.following,
    music.likes,
    music.memberOf,
    music.collected,
    podcast.saved,
    podcast.followed,
    community.savedItems,
    community.memberships,
    commerce.collection,
    director.project]

  );

  async function remove(item: LibraryItem) {
    if (!item.removable || removing) return;
    setRemoving(item.key);
    try {
      switch (item.shelf) {
        case 'watchlist':
          app.toggleWatchlist(item.refId);
          break;
        case 'continue':
          watchApi.clearResume(item.refId);
          app.showToast('Progress cleared');
          break;
        case 'history':
          watchApi.clearHistory(item.refId);
          app.showToast(`${item.title} removed from history`);
          break;
        case 'favourites':
          watchApi.setReaction(item.refId, null);
          app.showToast('Like removed');
          break;
        case 'downloads':{
            const result = await titleApi.removeDownload(item.refId);
            app.showToast(result.ok ? 'Download removed' : result.error);
            break;
          }
        case 'music':
          music.toggleLike(item.refId);
          break;
        case 'podcasts':
          podcast.toggleSave(item.refId);
          break;
        case 'saved':
          if (item.kind === 'short') {
            const result = await shortsApi.toggleSave(item.refId);
            app.showToast(result.ok ? 'Removed from saved' : result.error);
          } else {
            await community.toggleSave(item.refId, item.title);
          }
          break;
        case 'creators':
          app.toggleFollow(item.refId);
          break;
        default:
          break;
      }
    } finally {
      setRemoving(null);
      setTick((t) => t + 1);
    }
  }

  return {
    shelves,
    total: shelves.reduce((n, s) => n + s.items.length, 0),
    remove,
    removing,
    creationsStatus: director.status,
    reloadCreations: director.reload
  };
}