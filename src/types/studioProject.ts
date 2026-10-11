/**
 * STUDIO PROJECTS — the creator's workspace around the production engine.
 *
 * A project is the unit a creator owns, switches between, duplicates, archives
 * and versions. Its production state (story bible, scenes, shots, continuity,
 * film memory) is held by the Director engine; this layer only knows how to
 * open, save and restore that state as a whole.
 */

export type ProjectStatus = 'active' | 'archived';

export type ProjectOrigin =
{kind: 'seed';} |
{kind: 'blank';} |
{kind: 'duplicate';fromId: string;fromTitle: string;};

export interface ProjectCounts {
  bibleEntries: number;
  characters: number;
  scenes: number;
  shots: number;
  approvedShots: number;
}

export interface ProjectReleaseRef {
  slug: string;
  version: number;
  publishedAt: number;
  state: 'live' | 'scheduled';
}

export interface StudioProjectSummary {
  id: string;
  title: string;
  format: string;
  logline: string;
  poster: string;
  owner: string;
  /** The Director pipeline state, e.g. STORYBOARDING. */
  stage: string;
  status: ProjectStatus;
  origin: ProjectOrigin;
  createdAt: number;
  updatedAt: number;
  counts: ProjectCounts;
  release?: ProjectReleaseRef;
}

export type ProjectVersionKind = 'named' | 'restore-point' | 'published';

export interface ProjectVersion {
  id: string;
  projectId: string;
  n: number;
  name: string;
  note?: string;
  kind: ProjectVersionKind;
  createdAt: number;
  createdBy: string;
  counts: ProjectCounts;
}

export interface ProjectComparisonRow {
  label: string;
  then: number;
  now: number;
}

export interface NewProjectForm {
  title: string;
  format: string;
  genre: string;
  logline: string;
  setting: string;
  characters: {name: string;note: string;}[];
}