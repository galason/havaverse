import type { ContentTitle } from './content';

/**
 * PUBLISHING — a Studio project becoming a HavaVerse title.
 *
 * Publishing is a server transaction, not a navigation: the request is
 * validated against the same gate the Studio shows, a publication job runs,
 * and only its completion creates the published content entity that Search,
 * the content graph, recommendations and notifications consume.
 */

export type PreflightStatus = 'pass' | 'fail' | 'server';

export interface PreflightCheck {
  key: 'rights' | 'continuity' | 'quality' | 'metadata' | 'audience' | 'safety';
  label: string;
  status: PreflightStatus;
  detail: string;
  issues: string[];
  /** Where the creator resolves a failure. */
  fixTo?: string;
}

export interface ReleaseMetadata {
  title: string;
  logline: string;
  genre: string;
  maturity: string;
  languages: string[];
}

export type ReleaseVisibility = 'public' | 'unlisted';
export type ReleaseRegions = 'worldwide' | 'africa' | 'nigeria';

export interface ReleaseAudience {
  visibility: ReleaseVisibility;
  regions: ReleaseRegions;
  /** 'now', or a future epoch-ms premiere time. */
  releaseAt: 'now' | number;
}

export type PublishStepKey =
'validating' |
'packaging' |
'registering' |
'graph' |
'indexing' |
'recommendations' |
'notifying';

export interface PublishStep {
  key: PublishStepKey;
  label: string;
  detail: string;
  status: 'pending' | 'running' | 'done' | 'skipped';
  at?: number;
}

export interface PublishJob {
  id: string;
  projectId: string;
  projectTitle: string;
  slug: string;
  version: number;
  metadata: ReleaseMetadata;
  audience: ReleaseAudience;
  steps: PublishStep[];
  status: 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export interface PublishedRelease {
  id: string;
  slug: string;
  projectId: string;
  version: number;
  title: ContentTitle;
  publishedAt: number;
  releaseAt: number;
  visibility: ReleaseVisibility;
  regions: ReleaseRegions;
  shotCount: number;
  generationRecord: string;
  /** True when the slug already existed in the catalogue before this release. */
  catalogued: boolean;
}