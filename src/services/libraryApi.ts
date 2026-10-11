import { titles } from '../data/catalog';
import { tracks, artists, editions, memberships } from '../data/music';
import { episodes, shows } from '../data/podcast';
import { shorts } from '../data/shorts';
import { recommendedCommunities } from '../data/communityHub';
import { communities } from '../data/communities';
import { seedDiscussions, seedFanCreations } from '../data/communityContent';
import { marketProducts } from '../data/commerce';
import type { ResumePoint, TitleReactionRecord, WatchSession } from '../types/watch';
import type { DownloadRecord } from '../types/title';
import type { CommunityMembership } from '../types/communityEntities';
import type { FilmProject } from '../types/director';
import type { StudioProjectSummary } from '../types/studioProject';
import { titleBySlug as releaseTitleBySlug } from './releaseRegistry';
import type { LibraryItem, LibraryShelf, ShelfDefinition, ShelfId } from '../types/library';

/**
 * LIBRARY SERVICE — projection over the services that own each kind of state.
 *
 * Production contract (the HTTP implementation replaces `buildLibrary`, not
 * the UI):
 *   GET    /api/library                 → { shelves: LibraryShelf[] } for the session identity
 *   GET    /api/library/:shelf?cursor=  → paginated shelf
 * Mutations are NOT library endpoints. They go to the owning service so there
 * is one source of truth per fact:
 *   watchlist  → PUT/DELETE /api/watch/watchlist/:titleId
 *   continue   → DELETE     /api/play/:slug/resume
 *   history    → DELETE     /api/watch/history/:slug  (every session + resume)
 *   favourites → PUT        /api/watch/reactions/:slug { reaction: null }
 *   downloads  → DELETE     /api/downloads/:slug   (licence server revokes the offline key)
 *   music      → DELETE     /api/music/likes/:trackId
 *   podcasts   → DELETE     /api/podcast/saved/:episodeId
 *   saved      → DELETE     /api/shorts/saved/:slug | /api/community/saved/:key
 *   creators   → DELETE     /api/social/following/:handle
 * Purchases, memberships and creations are read-only here: refunds and
 * leaving happen where the transaction or membership lives.
 */

export const shelfDefinitions: ShelfDefinition[] = [
{
  id: 'continue',
  label: 'Continue watching',
  description: 'Part-way through, newest first.',
  emptyBody: 'Start anything and it waits here, at the second you stopped.',
  emptyAction: { label: 'Find something to watch', to: '/' },
  source: 'Watch · resume positions'
},
{
  id: 'watchlist',
  label: 'Watchlist',
  description: 'Saved for later.',
  emptyBody: 'Add films, series and live events from any title page.',
  emptyAction: { label: 'Browse films', to: '/browse/film' },
  source: 'Watch · watchlist'
},
{
  id: 'favourites',
  label: 'Liked',
  description: 'Films and series you gave a thumbs up.',
  emptyBody: 'Give a title a thumbs up from its page or the player and it is kept here.',
  emptyAction: { label: 'Browse films', to: '/browse/film' },
  source: 'Watch · reactions'
},
{
  id: 'history',
  label: 'Watch history',
  description: 'Every viewing session, newest first.',
  emptyBody: 'Your history appears as soon as you watch something.',
  emptyAction: { label: 'Go to Home', to: '/' },
  source: 'Watch · viewing sessions'
},
{
  id: 'music',
  label: 'Saved music',
  description: 'Tracks you have liked.',
  emptyBody: 'Like a track from the player or a track page and it lives here.',
  emptyAction: { label: 'Open Music', to: '/music' },
  source: 'Music · likes'
},
{
  id: 'podcasts',
  label: 'Podcasts',
  description: 'Saved episodes and the shows you follow.',
  emptyBody: 'Save an episode to come back to it, or follow a show.',
  emptyAction: { label: 'Open Podcast', to: '/podcast' },
  source: 'Podcast · saved & followed'
},
{
  id: 'saved',
  label: 'Saved',
  description: 'Shorts, discussions and fan work you kept.',
  emptyBody: 'Save a Short, a discussion or a fan creation and it collects here.',
  emptyAction: { label: 'Watch Shorts', to: '/shorts' },
  source: 'Shorts · Community saved items'
},
{
  id: 'creators',
  label: 'Following',
  description: 'Creators and artists you follow or back.',
  emptyBody: 'Follow a creator from any title, Short or profile.',
  emptyAction: { label: 'Discover creators', to: '/' },
  source: 'Social · following · Music memberships'
},
{
  id: 'communities',
  label: 'Communities',
  description: 'Where you are a member.',
  emptyBody: 'Join a community around something you watch.',
  emptyAction: { label: 'Explore communities', to: '/communities' },
  source: 'Community · memberships'
},
{
  id: 'purchased',
  label: 'Purchased',
  description: 'Products, editions and collectibles you own.',
  emptyBody: 'Anything you buy, collect or unlock is kept here.',
  emptyAction: { label: 'Visit Market', to: '/market' },
  source: 'Market · collection · Music editions'
},
{
  id: 'downloads',
  label: 'Downloads',
  description: 'Titles requested for offline viewing.',
  emptyBody: 'Download eligible titles from their title page.',
  emptyAction: { label: 'Browse films', to: '/browse/film' },
  source: 'Downloads'
},
{
  id: 'creations',
  label: 'My creations',
  description: 'Projects you are making in Studio.',
  emptyBody: 'Start a project in Studio and it appears here.',
  emptyAction: { label: 'Open Studio', to: '/studio' },
  source: 'Studio · projects'
}];


/** Raw user state read from each owning service. */
export interface LibrarySources {
  resume: ResumePoint[];
  history: WatchSession[];
  reactions: TitleReactionRecord[];
  watchlist: string[];
  downloads: DownloadRecord[];
  likedTracks: string[];
  savedEpisodes: string[];
  followedShows: string[];
  likedShorts: string[];
  savedShorts: string[];
  savedCommunityItems: string[];
  following: string[];
  musicMemberships: string[];
  memberships: CommunityMembership[];
  ownedProducts: string[];
  collectedEditions: string[];
  project: FilmProject | null;
  /** Every Studio project the creator owns (GET /api/studio/projects). */
  projects: StudioProjectSummary[];
  activeProjectId: string | null;
}

// Catalogue first, then titles published from Studio, so new releases can be saved and resumed.
const titleBySlug = (slug: string) => titles.find((t) => t.slug === slug) ?? releaseTitleBySlug(slug);

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

const projectStage: Record<string, string> = {
  PUBLISHED: 'Published',
  READY_TO_PUBLISH: 'Ready to publish',
  QUALITY_CONTROL: 'Quality control'
};

function shelfItems(id: ShelfId, s: LibrarySources): LibraryItem[] {
  switch (id) {
    case 'continue':
      return s.resume.
      filter((r) => r.completion > 0 && r.completion < 97).
      flatMap((r): LibraryItem[] => {
        const t = titleBySlug(r.slug);
        if (!t) return [];
        return [
        {
          key: `continue:title:${r.slug}`,
          shelf: id,
          kind: 'title',
          refId: r.slug,
          title: t.name,
          subtitle: `${t.kind} · ${t.creator}`,
          image: t.backdrop ?? t.poster,
          href: `/watch/${r.slug}`,
          progress: r.completion,
          status: `Resume at ${formatClock(r.positionSeconds)}`,
          at: r.updatedAt,
          removable: true,
          removeLabel: 'Clear progress'
        }];

      });
    case 'watchlist':
      return s.watchlist.flatMap((tid): LibraryItem[] => {
        const t = titles.find((x) => x.id === tid);
        if (!t) return [];
        return [
        {
          key: `watchlist:title:${t.id}`,
          shelf: id,
          kind: 'title',
          refId: t.id,
          title: t.name,
          subtitle: `${t.kind} · ${t.year} · ${t.runtime}`,
          image: t.backdrop ?? t.poster,
          href: `/title/${t.slug}`,
          removable: true,
          removeLabel: 'Remove from watchlist'
        }];

      });
    case 'favourites':
      return s.reactions.
      filter((r) => r.reaction === 'up').
      flatMap((r): LibraryItem[] => {
        const t = titleBySlug(r.slug);
        if (!t) return [];
        return [
        {
          key: `favourites:title:${r.slug}`,
          shelf: id,
          kind: 'title',
          refId: r.slug,
          title: t.name,
          subtitle: `${t.kind} · ${t.creator}`,
          image: t.backdrop ?? t.poster,
          href: `/title/${r.slug}`,
          at: r.at,
          removable: true,
          removeLabel: 'Remove like'
        }];

      });
    case 'history':
      return s.history.flatMap((session): LibraryItem[] => {
        const t = titleBySlug(session.slug);
        if (!t) return [];
        const finished = session.completion >= 97;
        const span =
        session.toSeconds > session.fromSeconds ?
        `${formatClock(session.fromSeconds)} → ${formatClock(session.toSeconds)}` :
        `at ${formatClock(session.toSeconds)}`;
        return [
        {
          key: `history:title:${session.id}`,
          shelf: id,
          kind: 'title',
          refId: session.slug,
          title: t.name,
          subtitle: `${t.kind} · ${span} · ${session.device}`,
          image: t.backdrop ?? t.poster,
          href: `/title/${session.slug}`,
          progress: finished ? 100 : session.completion,
          status: finished ? 'Finished' : `Reached ${session.completion}%`,
          at: session.endedAt,
          removable: true,
          removeLabel: 'Remove title from history'
        }];

      });
    case 'music':
      return s.likedTracks.flatMap((trackId): LibraryItem[] => {
        const t = tracks.find((x) => x.id === trackId);
        if (!t) return [];
        const artist = artists.find((a) => a.id === t.artistId);
        return [
        {
          key: `music:track:${t.id}`,
          shelf: id,
          kind: 'track',
          refId: t.id,
          title: t.title,
          subtitle: `${artist?.name ?? 'Unknown artist'} · ${formatClock(t.durationSeconds)}`,
          image: t.artwork,
          href: `/music/track/${t.id}`,
          removable: true,
          removeLabel: 'Unlike'
        }];

      });
    case 'podcasts':
      return [
      ...s.savedEpisodes.flatMap((eid): LibraryItem[] => {
        const e = episodes.find((x) => x.id === eid);
        if (!e) return [];
        const show = shows.find((x) => x.id === e.showId);
        return [
        {
          key: `podcasts:episode:${e.id}`,
          shelf: id,
          kind: 'episode',
          refId: e.id,
          title: e.title,
          subtitle: `${show?.title ?? 'Podcast'} · S${e.season} E${e.number}`,
          image: e.artwork,
          href: `/podcast/episode/${e.id}`,
          status: 'Saved episode',
          removable: true,
          removeLabel: 'Unsave'
        }];

      }),
      ...s.followedShows.flatMap((sid): LibraryItem[] => {
        const show = shows.find((x) => x.id === sid);
        if (!show) return [];
        return [
        {
          key: `podcasts:show:${show.id}`,
          shelf: id,
          kind: 'show',
          refId: show.id,
          title: show.title,
          subtitle: show.tagline,
          image: show.artwork,
          href: `/podcast/show/${show.id}`,
          status: 'Following',
          removable: false
        }];

      })];

    case 'saved':
      return [
      ...[...new Set([...s.savedShorts, ...s.likedShorts])].flatMap((slug): LibraryItem[] => {
        const sh = shorts.find((x) => x.slug === slug);
        if (!sh) return [];
        const saved = s.savedShorts.includes(slug);
        return [
        {
          key: `saved:short:${slug}`,
          shelf: id,
          kind: 'short',
          refId: slug,
          title: sh.caption,
          subtitle: `Short · ${sh.creator.name}`,
          image: sh.poster,
          href: `/shorts/${slug}`,
          status: saved ? 'Saved' : 'Liked',
          removable: saved,
          removeLabel: 'Unsave'
        }];

      }),
      ...s.savedCommunityItems.flatMap((key): LibraryItem[] => {
        const [type, ref] = key.split(':');
        if (type === 'discussion') {
          const d = seedDiscussions.find((x) => x.id === ref);
          if (!d) return [];
          return [
          {
            key: `saved:discussion:${ref}`,
            shelf: id,
            kind: 'discussion',
            refId: key,
            title: d.title,
            subtitle: `Discussion · ${d.replies.length} replies`,
            href: `/discussions/${ref}`,
            removable: true,
            removeLabel: 'Unsave'
          }];

        }
        if (type === 'fan-creation') {
          const f = seedFanCreations.find((x) => x.id === ref);
          if (!f) return [];
          return [
          {
            key: `saved:fan-creation:${ref}`,
            shelf: id,
            kind: 'fan-creation',
            refId: key,
            title: f.title,
            subtitle: `Fan creation · ${f.kind}`,
            image: f.image,
            href: `/fan-creations/${ref}`,
            removable: true,
            removeLabel: 'Unsave'
          }];

        }
        return [];
      })];

    case 'creators':
      return [
      ...s.following.map((handle): LibraryItem => {
        const t = titles.find((x) => x.creatorHandle === handle);
        return {
          key: `creators:creator:${handle}`,
          shelf: id,
          kind: 'creator',
          refId: handle,
          title: t?.creator ?? `@${handle.replace(/^@/, '')}`,
          subtitle: t ? `Creator of ${t.name}` : 'Creator',
          image: t?.poster,
          href: `/creator/${handle.replace(/^@/, '')}`,
          status: 'Following',
          removable: true,
          removeLabel: 'Unfollow'
        };
      }),
      ...s.musicMemberships.flatMap((membershipId): LibraryItem[] => {
        const mb = memberships.find((x) => x.id === membershipId);
        const a = mb && artists.find((x) => x.id === mb.artistId);
        if (!mb || !a) return [];
        return [
        {
          key: `creators:artist:${a.id}`,
          shelf: id,
          kind: 'creator',
          refId: a.id,
          title: a.name,
          subtitle: mb.name,
          image: a.avatar,
          href: `/music/artist/${a.id}`,
          status: 'Member',
          removable: false
        }];

      })];

    case 'communities':
      return s.memberships.flatMap((m): LibraryItem[] => {
        const c =
        recommendedCommunities.find((x) => x.slug === m.slug) ??
        communities.find((x) => x.slug === m.slug);
        if (!c) return [];
        const image = 'image' in c ? c.image : c.banner;
        return [
        {
          key: `communities:community:${m.slug}`,
          shelf: id,
          kind: 'community',
          refId: m.slug,
          title: c.name,
          subtitle: `${m.role} · joined ${m.joinedAt}`,
          image,
          href: `/community/${m.slug}`,
          status: m.muted ? 'Muted' : undefined,
          removable: false
        }];

      });
    case 'purchased':
      return [
      ...s.ownedProducts.flatMap((pid): LibraryItem[] => {
        const p = marketProducts.find((x) => x.id === pid);
        if (!p) return [];
        return [
        {
          key: `purchased:product:${p.id}`,
          shelf: id,
          kind: 'product',
          refId: p.id,
          title: p.name,
          subtitle: `Market · ${p.category}`,
          image: p.image,
          href: `/market/product/${p.id}`,
          status: 'Owned',
          removable: false
        }];

      }),
      ...s.collectedEditions.flatMap((eid): LibraryItem[] => {
        const e = editions.find((x) => x.id === eid);
        if (!e) return [];
        return [
        {
          key: `purchased:edition:${e.id}`,
          shelf: id,
          kind: 'edition',
          refId: e.id,
          title: e.name,
          subtitle: `Music · ${e.kind}`,
          image: e.image,
          href: `/music/track/${e.trackId}`,
          status: 'Collected',
          removable: false
        }];

      })];

    case 'downloads':
      return s.downloads.flatMap((d): LibraryItem[] => {
        const t = titleBySlug(d.slug);
        if (!t) return [];
        const status =
        d.state === 'preparing' ?
        'Preparing' :
        d.state === 'downloading' ?
        `Downloading ${d.progress}%` :
        'Offline licence not connected';
        return [
        {
          key: `downloads:title:${d.slug}`,
          shelf: id,
          kind: 'title',
          refId: d.slug,
          title: t.name,
          subtitle: `${t.kind} · ${d.quality}`,
          image: t.backdrop ?? t.poster,
          href: `/title/${d.slug}`,
          progress: d.progress,
          status,
          removable: d.state === 'downloaded',
          removeLabel: 'Remove download'
        }];

      });
    case 'creations':
      // Every active project the creator owns; the open one reflects live Director state.
      return s.projects.
      filter((p) => p.status === 'active').
      map((p): LibraryItem => {
        const open = p.id === s.activeProjectId;
        const stage = open && s.project ? s.project.state : p.stage;
        const release = p.release;
        return {
          key: `creations:project:${p.id}`,
          shelf: id,
          kind: 'project',
          refId: p.id,
          title: open && s.project ? s.project.title : p.title,
          subtitle: `${p.format} · ${
          p.counts.shots ? `${p.counts.approvedShots} of ${p.counts.shots} shots approved` : 'in story development'}${
          open ? ' · open in Studio' : ''}`,
          image: p.poster,
          href: release ? `/title/${release.slug}` : open ? '/studio' : '/studio/projects',
          status: release ?
          release.state === 'scheduled' ?
          'Premiere scheduled' :
          `Published · v${release.version}` :
          projectStage[stage] ?? stage.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
          removable: false
        };
      });
  }
}

/** The single projection used by the page today and replaced by GET /api/library tomorrow. */
export function buildLibrary(sources: LibrarySources): LibraryShelf[] {
  return shelfDefinitions.map((def) => ({ ...def, items: shelfItems(def.id, sources) }));
}

export const libraryApi = { shelfDefinitions, buildLibrary };