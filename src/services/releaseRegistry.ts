import { bySlug } from '../data/catalog';
import { readJSON, writeJSON } from '../utils/storage';
import type { ContentTitle } from '../types/content';
import type { PublishedRelease } from '../types/publishing';

/**
 * PUBLISHED CONTENT ENTITIES
 *
 * The one place a completed publication job lands. Stands in for:
 *
 *   GET  /api/content/titles/:slug        (catalogue + published releases)
 *   GET  /api/content/releases?project=:id
 *
 * It is deliberately a leaf module — the content graph, the title service,
 * the watch service and publishing all read it without depending on each
 * other. Only the publishing service writes to it.
 */

const KEY = 'hv.releases.v1';

let releases: PublishedRelease[] = readJSON<PublishedRelease[]>(KEY, []);
let revision = 0;

function persist() {
  writeJSON(KEY, releases);
  revision += 1;
}

const isLive = (r: PublishedRelease) => r.releaseAt <= Date.now();

/** Latest release per slug. */
function latestBySlug(): Map<string, PublishedRelease> {
  const map = new Map<string, PublishedRelease>();
  for (const r of releases) {
    const prev = map.get(r.slug);
    if (!prev || r.version > prev.version) map.set(r.slug, r);
  }
  return map;
}

export const releaseRegistry = {
  /** Bumps whenever a release is added, so caches (the graph) know to rebuild. */
  revision: () => revision,

  register(release: PublishedRelease) {
    releases = [release, ...releases];
    persist();
  },

  forProject: (projectId: string) =>
  releases.filter((r) => r.projectId === projectId).sort((a, b) => b.version - a.version),

  forSlug: (slug: string) => latestBySlug().get(slug),

  /**
   * Titles that exist only because they were published from Studio. Unlisted
   * releases and scheduled premieres stay out of discovery (graph, Search).
   */
  discoverableTitles(): ContentTitle[] {
    return [...latestBySlug().values()].
    filter((r) => !r.catalogued && r.visibility === 'public' && isLive(r)).
    map((r) => r.title);
  },

  /** Public releases whose premiere time hasn't arrived yet, soonest first. */
  scheduledPremieres(): PublishedRelease[] {
    return [...latestBySlug().values()].
    filter((r) => r.visibility === 'public' && !isLive(r)).
    sort((a, b) => a.releaseAt - b.releaseAt);
  },

  /** Every title reachable by URL: catalogue first, then Studio releases. */
  titleBySlug(slug: string): ContentTitle | undefined {
    const catalogued = bySlug(slug);
    if (catalogued) return catalogued;
    return latestBySlug().get(slug)?.title;
  },

  slugTaken(slug: string, exceptProjectId?: string): boolean {
    if (bySlug(slug)) return true;
    return releases.some((r) => r.slug === slug && r.projectId !== exceptProjectId);
  }
};

export const titleBySlug = releaseRegistry.titleBySlug;