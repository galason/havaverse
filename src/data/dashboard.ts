import type { ActivityEvent, DashboardModuleConfig, Insight } from '../types/dashboard';

/**
 * The dashboard module manifest.
 *
 * In production the Control Room owns this record: enabling a module,
 * reordering it, restricting it to an audience, region or capability, or
 * scheduling a window are all configuration changes, not frontend changes.
 * The page renders whatever survives resolution and knows nothing about the
 * list below.
 */
export const dashboardModules: DashboardModuleConfig[] = [
{
  id: 'pulse',
  heading: 'My HavaVerse pulse',
  enabled: true,
  position: 10,
  audience: [],
  regions: 'all',
  slot: 'main'
},
{
  id: 'command',
  heading: 'HavaVerse AI',
  subheading: 'What would you like to get done?',
  enabled: true,
  position: 20,
  audience: [],
  regions: 'all',
  slot: 'main'
},
{
  id: 'my-day',
  heading: 'My day',
  subheading: 'What needs you right now',
  enabled: true,
  position: 30,
  audience: [],
  regions: 'all',
  slot: 'main'
},
{
  id: 'continue',
  heading: 'Continue where you left off',
  enabled: true,
  position: 40,
  audience: ['returning', 'in-production', 'in-communities'],
  regions: 'all',
  slot: 'main'
},
{
  id: 'creative-universe',
  heading: 'My creative universe',
  subheading: 'You don’t just publish titles. You build connected worlds.',
  enabled: true,
  position: 50,
  audience: ['in-production'],
  requires: 'create',
  regions: 'all',
  slot: 'main'
},
{
  id: 'ai-production',
  heading: 'AI production',
  enabled: true,
  position: 60,
  audience: ['in-production'],
  requires: 'create',
  regions: 'all',
  slot: 'main'
},
{
  id: 'activity',
  heading: 'Recently in your HavaVerse',
  enabled: true,
  position: 70,
  audience: ['returning'],
  regions: 'all',
  slot: 'main'
},
{
  id: 'creator-pulse',
  heading: 'Creator pulse',
  enabled: true,
  position: 80,
  audience: ['creator'],
  requires: 'publish',
  regions: 'all',
  slot: 'main'
},
{
  id: 'economy-pulse',
  heading: 'HavaPay',
  enabled: true,
  position: 90,
  audience: [],
  requires: 'wallet',
  regions: 'all',
  slot: 'main'
},
{
  id: 'library-pulse',
  heading: 'Your library',
  enabled: true,
  position: 100,
  audience: [],
  regions: 'all',
  slot: 'main'
},
{
  id: 'up-next',
  heading: 'Up next',
  enabled: true,
  position: 10,
  audience: [],
  regions: 'all',
  slot: 'rail'
},
{
  id: 'insights',
  heading: 'Hava AI insight',
  enabled: true,
  position: 20,
  audience: [],
  regions: 'all',
  slot: 'rail'
},
{
  id: 'community-pulse',
  heading: 'Community pulse',
  enabled: true,
  position: 30,
  audience: ['in-communities'],
  regions: 'all',
  slot: 'rail'
}];


/**
 * Personal history that no other service owns yet (saves, joins, follows).
 * Timestamps are relative offsets in minutes so the feed keeps ageing rather
 * than freezing at an authored clock time. Production replaces this with the
 * activity service; the shape is identical.
 */
export const seedActivity: {minutesAgo: number;event: Omit<ActivityEvent, 'at'>;}[] = [
{
  minutesAgo: 42,
  event: {
    id: 'act-comment',
    kind: 'community',
    text: 'Someone commented on your Short “Night Shift”',
    to: '/shorts?short=night-shift',
    unread: true
  }
},
{
  minutesAgo: 126,
  event: {
    id: 'act-saved',
    kind: 'library',
    text: 'You saved Lagos 2042',
    to: '/title/lagos-2042'
  }
},
{
  minutesAgo: 1_500,
  event: {
    id: 'act-joined',
    kind: 'community',
    text: 'You joined The Last Train Fan Club',
    to: '/community/the-last-train'
  }
},
{
  minutesAgo: 1_680,
  event: {
    id: 'act-published',
    kind: 'publish',
    text: 'Your Short “Night Shift” was published',
    to: '/shorts?short=night-shift'
  }
},
{
  minutesAgo: 2_880,
  event: {
    id: 'act-follow',
    kind: 'follow',
    text: 'You followed Kofi Studios',
    to: '/creator/adaezefilms'
  }
}];


/**
 * Observations, not instructions. Each one has to end somewhere the user can
 * actually go, or it does not belong on the dashboard.
 */
export const seedInsights: Insight[] = [
{
  id: 'ins-audience',
  text: 'Your Short “Night Shift” is getting noticeably more engagement from viewers who also watched The Last Train.',
  actionLabel: 'Explore connection',
  to: '/universes/railway'
},
{
  id: 'ins-tasks',
  text: 'Character continuity is unlocked on Mrs Bassey, so any shot she appears in will fail its consistency check.',
  actionLabel: 'Open Story Bible',
  to: '/studio/bible'
},
{
  id: 'ins-publish',
  text: 'Publishing is still blocked on The Last Train. I can walk you through what is outstanding.',
  actionLabel: 'Review checklist',
  to: '/studio'
}];


/**
 * Suggested commands. These are seeds for the input, not canned answers —
 * every one of them is interpreted by the same resolver as typed text.
 */
export const commandPrompts = [
'Continue my latest project',
'Show me what needs attention',
'What’s happening with my audience?',
'Prepare my film for publishing',
'Explain my earnings',
'What should I watch tonight?'];


/** Creator metrics seed. Replaced by the analytics service when it exists. */
export const creatorMetrics = {
  followers: '12.4K',
  views: '84K',
  watchTime: '21h',
  growth: '+8.2%',
  latestTitle: 'Night Shift',
  latestState: 'Published'
};