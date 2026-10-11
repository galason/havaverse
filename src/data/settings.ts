import type {
  ActivityEntry,
  AiCapability,
  AutonomyOption,
  ConnectedDevice,
  DataDomain,
  EcosystemLink,
  FamilyProfile,
  LabExperiment,
  NavGroup,
  SecuritySignal,
  SettingDefinition,
  SettingsSection } from
'../types/settings';

/* ------------------------------------------------------------- navigation */

export const navGroups: NavGroup[] = [
{ id: 'account', label: 'Account' },
{ id: 'experience', label: 'Experience' },
{ id: 'ai', label: 'Hava AI' },
{ id: 'creator', label: 'Creator' },
{ id: 'economy', label: 'Economy' },
{ id: 'social', label: 'Social' },
{ id: 'family', label: 'Family' },
{ id: 'data', label: 'Data & privacy' },
{ id: 'advanced', label: 'Advanced' }];


export const sections: SettingsSection[] = [
{
  id: 'overview',
  label: 'Overview',
  blurb: 'Shape how HavaVerse works for you.',
  navGroup: 'account',
  renderer: 'overview',
  roleScope: ['viewer', 'creator', 'organization']
},

/* account */
{
  id: 'profile',
  label: 'Profile & identity',
  blurb: 'Who you are across every HavaVerse module.',
  navGroup: 'account',
  renderer: 'identity',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'account',
  label: 'Account',
  blurb: 'Email, phone and how this account is addressed.',
  navGroup: 'account',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'security',
  label: 'Security',
  blurb: 'Credentials, sessions and the record of who got in.',
  navGroup: 'account',
  renderer: 'security',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'sign-in-methods',
  label: 'Sign-in methods',
  blurb: 'Every way into this one identity — password and linked accounts.',
  navGroup: 'account',
  renderer: 'sign-in',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'devices',
  label: 'Connected devices',
  blurb: 'Everywhere this identity is currently signed in.',
  navGroup: 'account',
  renderer: 'devices',
  roleScope: ['viewer', 'creator', 'organization']
},

/* experience */
{
  id: 'appearance',
  label: 'Appearance',
  blurb: 'Dark, Light, or follow your device.',
  navGroup: 'experience',
  renderer: 'appearance',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'personalization',
  label: 'Personalization',
  blurb: 'How hard HavaVerse tries to predict you.',
  navGroup: 'experience',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'playback',
  label: 'Playback',
  blurb: 'Quality, autoplay and what happens on a poor connection.',
  navGroup: 'experience',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'region',
  label: 'Language & region',
  blurb: 'Language, currency and the territory your catalogue is licensed in.',
  navGroup: 'experience',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'accessibility',
  label: 'Accessibility',
  blurb: 'Motion, contrast, captions and interface density.',
  navGroup: 'experience',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'notifications',
  label: 'Notifications',
  blurb: 'What is worth interrupting you for, and where.',
  navGroup: 'experience',
  renderer: 'notifications',
  roleScope: ['viewer', 'creator', 'organization']
},

/* hava ai */
{
  id: 'ai-preferences',
  label: 'AI preferences',
  blurb: 'Configure what Hava AI can understand, remember and do.',
  navGroup: 'ai',
  renderer: 'ai',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'ai-memory',
  label: 'AI memory',
  blurb: 'What Hava AI is allowed to retain between sessions.',
  navGroup: 'ai',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'recommendations',
  label: 'Recommendations',
  blurb: 'The signals behind what you are shown.',
  navGroup: 'ai',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'ai-activity',
  label: 'AI activity',
  blurb: 'Every AI decision recorded against this account.',
  navGroup: 'ai',
  renderer: 'activity',
  roleScope: ['viewer', 'creator', 'organization']
},

/* creator */
{
  id: 'creator-identity',
  label: 'Creator identity',
  blurb: 'How audiences and the graph see your work.',
  navGroup: 'creator',
  renderer: 'generic',
  roleScope: ['creator', 'organization']
},
{
  id: 'studio',
  label: 'Studio preferences',
  blurb: 'Defaults every new project inherits.',
  navGroup: 'creator',
  renderer: 'generic',
  roleScope: ['creator', 'organization']
},
{
  id: 'ai-director',
  label: 'AI Director',
  blurb: 'Autonomy, quality, budget and where a human must sign off.',
  navGroup: 'creator',
  renderer: 'generic',
  roleScope: ['creator', 'organization']
},
{
  id: 'publishing',
  label: 'Publishing',
  blurb: 'Visibility, rating and the labelling rules you cannot switch off.',
  navGroup: 'creator',
  renderer: 'generic',
  roleScope: ['creator', 'organization']
},
{
  id: 'monetization',
  label: 'Monetization',
  blurb: 'Which economic relationships your audience can have with you.',
  navGroup: 'creator',
  renderer: 'generic',
  roleScope: ['creator', 'organization']
},

/* economy */
{
  id: 'havapay',
  label: 'HavaPay',
  blurb: 'Wallet, payment methods, payouts and what money needs approval.',
  navGroup: 'economy',
  renderer: 'havapay',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'subscriptions',
  label: 'Subscriptions',
  blurb: 'Recurring relationships with HavaVerse and with creators.',
  navGroup: 'economy',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},

/* social */
{
  id: 'social-presence',
  label: 'Your social presence',
  blurb: 'Who can see your profile, who can reach you, and how you look to others.',
  navGroup: 'social',
  renderer: 'privacy',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'communities',
  label: 'Communities',
  blurb: 'Invitations, digests and how you appear inside communities.',
  navGroup: 'social',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'watch-parties',
  label: 'Watch parties',
  blurb: 'Who may pull you into a room, and what they see when you are there.',
  navGroup: 'social',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
},

/* family */
{
  id: 'family',
  label: 'Family space',
  blurb: 'Profiles on this account and the limits each one carries.',
  navGroup: 'family',
  renderer: 'family',
  roleScope: ['viewer', 'creator', 'organization']
},

/* data */
{
  id: 'data',
  label: 'Your data',
  blurb: 'What HavaVerse holds, what it is used for, and how to stop it.',
  navGroup: 'data',
  renderer: 'data',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'ecosystem',
  label: 'Connected ecosystem',
  blurb: 'The HavaVerse modules and outside services this identity reaches.',
  navGroup: 'data',
  renderer: 'ecosystem',
  roleScope: ['viewer', 'creator', 'organization']
},

/* advanced */
{
  id: 'labs',
  label: 'Hava Labs',
  blurb: 'Try emerging HavaVerse experiences before they reach everyone.',
  navGroup: 'advanced',
  renderer: 'labs',
  roleScope: ['viewer', 'creator', 'organization']
},
{
  id: 'developer',
  label: 'Developer access',
  blurb: 'Keys and programmatic access to your own HavaVerse data.',
  navGroup: 'advanced',
  renderer: 'generic',
  roleScope: ['viewer', 'creator', 'organization']
}];


/* --------------------------------------------------------------- registry */

const AUDIENCE = [
{ value: 'everyone', label: 'Everyone' },
{ value: 'followers', label: 'Followers' },
{ value: 'following', label: 'People I follow' },
{ value: 'community', label: 'Community members' },
{ value: 'nobody', label: 'Only me' }];


const all: SettingDefinition['roleScope'] = ['viewer', 'creator', 'organization'];
const creatorOnly: SettingDefinition['roleScope'] = ['creator', 'organization'];

export const settingRegistry: SettingDefinition[] = [
/* ------------------------------------------------------------- account */
{
  id: 'account.handle-visibility',
  category: 'account',
  label: 'Show my username publicly',
  description: 'Turn this off and people can only reach you through your display name.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['username', 'handle', 'public']
},
{
  id: 'account.email-digest',
  category: 'account',
  label: 'Account email',
  description: 'Where security notices and receipts are sent.',
  valueType: 'select',
  options: [
  { value: 'primary', label: 'Primary address' },
  { value: 'secondary', label: 'Secondary address' }],

  defaultValue: 'primary',
  roleScope: all,
  audit: true,
  keywords: ['email', 'address', 'receipts']
},
{
  id: 'account.type',
  category: 'account',
  label: 'How you use HavaVerse',
  description:
  'Changing this adds capabilities — it never removes the ones you already have.',
  valueType: 'segmented',
  options: [
  { value: 'viewer', label: 'Viewer' },
  { value: 'creator', label: 'Creator' },
  { value: 'both', label: 'Both' }],

  defaultValue: 'both',
  roleScope: all,
  audit: true,
  keywords: ['creator', 'viewer', 'account type', 'become a creator']
},

/* ------------------------------------------------------ personalization */
{
  id: 'personalization.intensity',
  category: 'personalization',
  label: 'Personalization intensity',
  description:
  'At Low, HavaVerse leans on what is new and well made rather than on your history.',
  valueType: 'segmented',
  options: [
  { value: 'off', label: 'Off' },
  { value: 'low', label: 'Low' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'high', label: 'High' }],

  defaultValue: 'high',
  roleScope: all,
  audit: false,
  keywords: ['personalized', 'recommendations', 'less personalized', 'algorithm']
},
{
  id: 'personalization.new-creators',
  category: 'personalization',
  label: 'Surface creators I have never watched',
  description: 'Reserves part of every shelf for work with no audience yet.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  dependsOn: { settingId: 'personalization.intensity', equals: 'off' },
  audit: false,
  keywords: ['new creators', 'discovery', 'emerging']
},
{
  id: 'personalization.regional',
  category: 'personalization',
  label: 'Prioritise content from my region',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['nigerian content', 'local', 'region', 'african']
},
{
  id: 'personalization.language-first',
  category: 'personalization',
  label: 'Lead with my languages',
  description: 'Titles available in your languages are shown before dubbed alternatives.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['language', 'yoruba', 'pidgin', 'dub']
},

/* ------------------------------------------------------------ playback */
{
  id: 'playback.quality',
  category: 'playback',
  label: 'Default quality',
  valueType: 'select',
  options: [
  { value: 'auto', label: 'Auto', description: 'Adapts to your connection' },
  { value: '2160', label: '4K' },
  { value: '1080', label: '1080p' },
  { value: '720', label: '720p' },
  { value: '480', label: '480p — data saver' }],

  defaultValue: 'auto',
  roleScope: all,
  audit: false,
  keywords: ['quality', '4k', 'resolution', 'data']
},
{
  id: 'playback.autoplay',
  category: 'playback',
  label: 'Autoplay the next title',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['autoplay', 'next episode', 'up next']
},
{
  id: 'playback.previews',
  category: 'playback',
  label: 'Play previews while browsing',
  valueType: 'toggle',
  defaultValue: false,
  roleScope: all,
  audit: false,
  keywords: ['preview', 'trailer', 'hover']
},
{
  id: 'playback.download-quality',
  category: 'playback',
  label: 'Download quality',
  valueType: 'select',
  options: [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' }],

  defaultValue: 'standard',
  roleScope: all,
  audit: false,
  keywords: ['download', 'offline']
},

/* -------------------------------------------------------------- region */
{
  id: 'region.country',
  category: 'region',
  label: 'Country',
  description: 'Determines which catalogue is licensed to you and how you are taxed.',
  valueType: 'select',
  options: [
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' }],

  defaultValue: 'NG',
  roleScope: all,
  regionNote:
  'Some titles will appear or disappear when this changes. That is licensing, not preference.',
  audit: true,
  keywords: ['country', 'region', 'territory']
},
{
  id: 'region.interface-language',
  category: 'region',
  label: 'Interface language',
  valueType: 'select',
  options: [
  { value: 'en', label: 'English' },
  { value: 'pcm', label: 'Nigerian Pidgin' },
  { value: 'yo', label: 'Yorùbá' },
  { value: 'ig', label: 'Igbo' },
  { value: 'ha', label: 'Hausa' },
  { value: 'fr', label: 'Français' },
  { value: 'sw', label: 'Kiswahili' }],

  defaultValue: 'en',
  roleScope: all,
  audit: false,
  keywords: ['language', 'change my language', 'interface']
},
{
  id: 'region.audio-language',
  category: 'region',
  label: 'Preferred audio',
  valueType: 'select',
  options: [
  { value: 'original', label: 'Original language' },
  { value: 'en', label: 'English' },
  { value: 'pcm', label: 'Nigerian Pidgin' },
  { value: 'yo', label: 'Yorùbá' }],

  defaultValue: 'original',
  roleScope: all,
  audit: false,
  keywords: ['audio', 'dub', 'language']
},
{
  id: 'region.subtitles',
  category: 'region',
  label: 'Subtitles',
  valueType: 'select',
  options: [
  { value: 'off', label: 'Off' },
  { value: 'en', label: 'English' },
  { value: 'en-cc', label: 'English (CC)' },
  { value: 'yo', label: 'Yorùbá' }],

  defaultValue: 'en',
  roleScope: all,
  audit: false,
  keywords: ['subtitle', 'captions', 'cc']
},
{
  id: 'region.currency',
  category: 'region',
  label: 'Currency',
  description: 'Prices are converted for display. Settlement currency is set by HavaPay.',
  valueType: 'select',
  options: [
  { value: 'NGN', label: '₦ Nigerian Naira' },
  { value: 'GHS', label: '₵ Ghanaian Cedi' },
  { value: 'KES', label: 'KSh Kenyan Shilling' },
  { value: 'USD', label: '$ US Dollar' },
  { value: 'GBP', label: '£ Pound Sterling' }],

  defaultValue: 'NGN',
  roleScope: all,
  audit: false,
  keywords: ['currency', 'naira', 'price']
},

/* ------------------------------------------------------- accessibility */
{
  id: 'a11y.reduced-motion',
  category: 'accessibility',
  label: 'Reduce motion',
  description: 'Follows your system preference unless you override it here.',
  valueType: 'toggle',
  defaultValue: false,
  roleScope: all,
  audit: false,
  keywords: ['motion', 'animation', 'vestibular']
},
{
  id: 'a11y.density',
  category: 'accessibility',
  label: 'Interface density',
  valueType: 'segmented',
  options: [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' }],

  defaultValue: 'comfortable',
  roleScope: all,
  audit: false,
  keywords: ['density', 'compact', 'spacing']
},
{
  id: 'a11y.captions-default',
  category: 'accessibility',
  label: 'Always start with captions on',
  valueType: 'toggle',
  defaultValue: false,
  roleScope: all,
  audit: false,
  keywords: ['captions', 'subtitles', 'deaf']
},
{
  id: 'a11y.cinematic',
  category: 'accessibility',
  label: 'Cinematic mode',
  description: 'Dims the interface around the player once playback starts.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['cinematic', 'dim', 'immersive']
},

/* notifications: channel × category preferences are owned by the
   notification service (services/notificationsApi.ts), rendered by the
   'notifications' section renderer — not duplicated in this registry. */

/* ----------------------------------------------------------- ai memory */
{
  id: 'ai.memory',
  category: 'ai-memory',
  label: 'Let Hava AI remember me between sessions',
  description:
  'Turn this off and Hava AI starts every conversation with no history of your taste.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: true,
  keywords: [
  'memory',
  'remember',
  'stop remembering',
  'forget',
  "don't want hava ai remembering"]

},
{
  id: 'ai.memory.taste',
  category: 'ai-memory',
  label: 'Remember genres and creators I return to',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  dependsOn: { settingId: 'ai.memory', equals: false },
  audit: true,
  keywords: ['taste', 'genres', 'favourite creators']
},
{
  id: 'ai.memory.creative',
  category: 'ai-memory',
  label: 'Remember my creative preferences',
  description: 'Camera language, pacing and tone carried between Studio projects.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  dependsOn: { settingId: 'ai.memory', equals: false },
  audit: true,
  keywords: ['creative', 'studio', 'director', 'style']
},
{
  id: 'ai.memory.retention',
  category: 'ai-memory',
  label: 'Keep memory for',
  valueType: 'select',
  options: [
  { value: '30', label: '30 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: 'A year' },
  { value: 'forever', label: 'Until I delete it' }],

  defaultValue: '365',
  roleScope: all,
  dependsOn: { settingId: 'ai.memory', equals: false },
  audit: true,
  keywords: ['retention', 'delete', 'how long']
},

/* ----------------------------------------------------- recommendations */
{
  id: 'rec.watch-history',
  category: 'recommendations',
  label: 'Use my watch history',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['history', 'what data', 'recommend']
},
{
  id: 'rec.search-history',
  category: 'recommendations',
  label: 'Use my searches',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['search', 'queries']
},
{
  id: 'rec.community',
  category: 'recommendations',
  label: 'Use my community activity',
  description: 'Discussions you read and communities you join shape what is surfaced.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['community', 'discussions']
},
{
  id: 'rec.purchases',
  category: 'recommendations',
  label: 'Use what I have collected in Market',
  valueType: 'toggle',
  defaultValue: false,
  roleScope: all,
  audit: false,
  keywords: ['market', 'purchases', 'collection']
},

/* --------------------------------------------------- creator identity */
{
  id: 'creator.display-name',
  category: 'creator-identity',
  label: 'Creator name',
  valueType: 'text',
  defaultValue: 'Studio Ikeja',
  roleScope: creatorOnly,
  audit: true,
  keywords: ['creator name', 'studio']
},
{
  id: 'creator.category',
  category: 'creator-identity',
  label: 'Primary discipline',
  valueType: 'select',
  options: [
  { value: 'film', label: 'Film' },
  { value: 'series', label: 'Series' },
  { value: 'music', label: 'Music' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'sports', label: 'Sports' }],

  defaultValue: 'film',
  roleScope: creatorOnly,
  audit: false,
  keywords: ['category', 'discipline']
},
{
  id: 'creator.open-to-collab',
  category: 'creator-identity',
  label: 'Open to collaboration',
  description: 'Shows a contact route on your creator page.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: false,
  keywords: ['collaboration', 'contact']
},

/* -------------------------------------------------------------- studio */
{
  id: 'studio.aspect',
  category: 'studio',
  label: 'Default aspect ratio',
  valueType: 'select',
  options: [
  { value: '2.39', label: '2.39:1 — anamorphic' },
  { value: '1.85', label: '1.85:1' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16 — vertical' }],

  defaultValue: '2.39',
  roleScope: creatorOnly,
  audit: false,
  keywords: ['aspect ratio', 'format']
},
{
  id: 'studio.resolution',
  category: 'studio',
  label: 'Default generation resolution',
  valueType: 'select',
  options: [
  { value: '4k', label: '4K' },
  { value: '2k', label: '2K' },
  { value: '1080', label: '1080p' }],

  defaultValue: '2k',
  roleScope: creatorOnly,
  audit: false,
  keywords: ['resolution', 'quality', 'generation']
},
{
  id: 'studio.asset-retention',
  category: 'studio',
  label: 'Keep superseded versions',
  description: 'Older generations stay restorable instead of being cleared.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: false,
  keywords: ['versions', 'storage', 'history']
},

/* --------------------------------------------------------- ai director */
{
  id: 'director.quality',
  category: 'ai-director',
  label: 'Generation quality target',
  description: 'Higher quality costs more credits and takes longer per shot.',
  valueType: 'segmented',
  options: [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'final', label: 'Final' }],

  defaultValue: 'review',
  roleScope: creatorOnly,
  audit: false,
  keywords: ['quality', 'generation', 'credits']
},
{
  id: 'director.budget',
  category: 'ai-director',
  label: 'Stop generating above',
  description: 'A hard ceiling per project. The Director pauses and asks rather than overrunning.',
  valueType: 'select',
  options: [
  { value: '5000', label: '5,000 credits' },
  { value: '20000', label: '20,000 credits' },
  { value: '50000', label: '50,000 credits' },
  { value: 'none', label: 'No ceiling' }],

  defaultValue: '20000',
  roleScope: creatorOnly,
  confirm: 'Removing the ceiling means a single command could consume your whole balance.',
  audit: true,
  keywords: ['budget', 'credits', 'spend', 'cost']
},
{
  id: 'director.continuity-strict',
  category: 'ai-director',
  label: 'Fail shots that break continuity',
  description:
  'A shot that drifts from a locked character or location is marked Needs revision instead of being accepted.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: false,
  keywords: ['continuity', 'character', 'consistency', 'qc']
},
{
  id: 'director.approval-gates',
  category: 'ai-director',
  label: 'Human approval required at',
  valueType: 'select',
  options: [
  { value: 'all', label: 'Every stage' },
  { value: 'key', label: 'Screenplay, shots and publish' },
  { value: 'publish', label: 'Publish only' }],

  defaultValue: 'key',
  roleScope: creatorOnly,
  audit: true,
  keywords: ['approval', 'gates', 'sign off']
},

/* ---------------------------------------------------------- publishing */
{
  id: 'publish.visibility',
  category: 'publishing',
  label: 'Default visibility for new work',
  valueType: 'select',
  options: [
  { value: 'private', label: 'Private' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'followers', label: 'Followers first' },
  { value: 'public', label: 'Public' }],

  defaultValue: 'private',
  roleScope: creatorOnly,
  audit: true,
  keywords: ['visibility', 'private', 'publish']
},
{
  id: 'publish.auto-subtitles',
  category: 'publishing',
  label: 'Generate subtitles automatically',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: false,
  keywords: ['subtitles', 'captions', 'accessibility']
},
{
  id: 'publish.auto-dub',
  category: 'publishing',
  label: 'Offer AI dubs in other languages',
  description: 'Dubs are labelled as generated and can be withdrawn per language.',
  valueType: 'toggle',
  defaultValue: false,
  roleScope: creatorOnly,
  audit: true,
  keywords: ['dub', 'language', 'translate']
},
{
  id: 'publish.ai-label',
  category: 'publishing',
  label: 'Label AI-assisted sequences',
  description:
  'Required platform-wide. It cannot be switched off, and appears in the content credits.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  confirm: 'Platform policy — this control is fixed.',
  audit: true,
  keywords: ['ai label', 'disclosure', 'generated']
},

/* -------------------------------------------------------- monetization */
{
  id: 'money.tips',
  category: 'monetization',
  label: 'Accept support from viewers',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: true,
  keywords: ['tips', 'support', 'donations']
},
{
  id: 'money.memberships',
  category: 'monetization',
  label: 'Offer memberships',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: true,
  keywords: ['membership', 'subscription', 'inner circle']
},
{
  id: 'money.store',
  category: 'monetization',
  label: 'Run a Market store',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: creatorOnly,
  audit: true,
  keywords: ['market', 'store', 'merch']
},
{
  id: 'money.payout-cadence',
  category: 'monetization',
  label: 'Payout cadence',
  valueType: 'select',
  options: [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'threshold', label: 'When I reach a threshold' }],

  defaultValue: 'monthly',
  roleScope: creatorOnly,
  audit: true,
  keywords: ['payout', 'earnings', 'manage payouts', 'bank']
},

/* ------------------------------------------------------------- havapay */
{
  id: 'pay.confirm-every',
  category: 'havapay',
  label: 'Confirm every payment',
  description: 'Even small purchases ask before money leaves the wallet.',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: true,
  keywords: ['payment', 'confirm', 'security']
},
{
  id: 'pay.biometric',
  category: 'havapay',
  label: 'Require biometrics above',
  valueType: 'select',
  options: [
  { value: '0', label: 'Every transaction' },
  { value: '500000', label: '₦5,000' },
  { value: '2500000', label: '₦25,000' },
  { value: 'never', label: 'Never' }],

  defaultValue: '500000',
  roleScope: all,
  audit: true,
  keywords: ['biometric', 'face id', 'fingerprint']
},
{
  id: 'pay.auto-renew',
  category: 'subscriptions',
  label: 'Renew subscriptions automatically',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: true,
  keywords: ['renew', 'subscription', 'cancel']
},
{
  id: 'pay.receipts',
  category: 'subscriptions',
  label: 'Email a receipt for every charge',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['receipt', 'invoice']
},

/* ------------------------------------------------------------- social */
{
  id: 'social.follow',
  category: 'social-presence',
  label: 'Who can follow me',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'everyone',
  roleScope: all,
  audit: false,
  keywords: ['follow', 'followers', 'privacy']
},
{
  id: 'social.message',
  category: 'social-presence',
  label: 'Who can message me',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'followers',
  roleScope: all,
  audit: false,
  keywords: ['message', 'dm', 'inbox']
},
{
  id: 'social.mention',
  category: 'social-presence',
  label: 'Who can mention me',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'everyone',
  roleScope: all,
  audit: false,
  keywords: ['mention', 'tag']
},
{
  id: 'social.activity',
  category: 'social-presence',
  label: 'Who can see my activity',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'followers',
  roleScope: all,
  audit: false,
  keywords: ['activity', 'visible', 'profile']
},
{
  id: 'social.watching',
  category: 'social-presence',
  label: 'Who can see what I am watching',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'nobody',
  roleScope: all,
  audit: false,
  keywords: ['watching', 'now playing', 'presence']
},
{
  id: 'community.invites',
  category: 'communities',
  label: 'Who can invite me to communities',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'following',
  roleScope: all,
  audit: false,
  keywords: ['community', 'invite']
},
{
  id: 'community.digest',
  category: 'communities',
  label: 'Community digest',
  valueType: 'select',
  options: [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'off', label: 'Off' }],

  defaultValue: 'weekly',
  roleScope: all,
  audit: false,
  keywords: ['digest', 'summary', 'community']
},
{
  id: 'community.spoilers',
  category: 'communities',
  label: 'Default spoiler filter',
  description: 'HavaVerse knows where you stopped and can hide anything past it.',
  valueType: 'segmented',
  options: [
  { value: 'safe', label: 'Safe for me' },
  { value: 'progress', label: 'Up to my progress' },
  { value: 'all', label: 'Show everything' }],

  defaultValue: 'safe',
  roleScope: all,
  audit: false,
  keywords: ['spoiler', 'episode', 'hide']
},
{
  id: 'party.invites',
  category: 'watch-parties',
  label: 'Who can invite me to a watch party',
  valueType: 'audience',
  options: AUDIENCE,
  defaultValue: 'following',
  roleScope: all,
  audit: false,
  keywords: ['watch party', 'invite']
},
{
  id: 'party.auto-mute',
  category: 'watch-parties',
  label: 'Join muted',
  valueType: 'toggle',
  defaultValue: true,
  roleScope: all,
  audit: false,
  keywords: ['mute', 'watch party', 'audio']
},

/* ----------------------------------------------------------- developer */
{
  id: 'dev.api-access',
  category: 'developer',
  label: 'Programmatic access to my data',
  description: 'Issues a personal key scoped to your own account only.',
  valueType: 'toggle',
  defaultValue: false,
  roleScope: all,
  confirm: 'A key can read everything this account can read. Treat it as a password.',
  audit: true,
  keywords: ['api', 'developer', 'key', 'token']
},
{
  id: 'dev.webhooks',
  category: 'developer',
  label: 'Webhook endpoint',
  valueType: 'text',
  defaultValue: '',
  roleScope: creatorOnly,
  dependsOn: { settingId: 'dev.api-access', equals: false },
  audit: true,
  keywords: ['webhook', 'endpoint', 'integration']
}];


/* -------------------------------------------------------------- hava ai */

export const aiCapabilities: AiCapability[] = [
{
  id: 'understand.viewing',
  ring: 'understand',
  label: 'Viewing behaviour',
  description: 'What you watch, finish and abandon.',
  defaultLevel: 'always'
},
{
  id: 'understand.creator',
  ring: 'understand',
  label: 'Creator activity',
  description: 'Projects, shots and production decisions in Studio.',
  defaultLevel: 'always'
},
{
  id: 'understand.communities',
  ring: 'understand',
  label: 'Communities',
  description: 'Which conversations you take part in.',
  defaultLevel: 'always'
},
{
  id: 'understand.accessibility',
  ring: 'understand',
  label: 'Language & accessibility',
  description: 'So responses and content arrive in a form you can use.',
  defaultLevel: 'always'
},
{
  id: 'remember.taste',
  ring: 'remember',
  label: 'Favourite genres and creators',
  description: 'Carried between sessions so you do not restate them.',
  defaultLevel: 'always'
},
{
  id: 'remember.watch',
  ring: 'remember',
  label: 'Watch preferences',
  description: 'Quality, language, subtitles and where you stopped.',
  defaultLevel: 'always'
},
{
  id: 'remember.creative',
  ring: 'remember',
  label: 'Creative preferences',
  description: 'Camera language, pacing and tone across your projects.',
  defaultLevel: 'always'
},
{
  id: 'act.recommend',
  ring: 'act',
  label: 'Personalise recommendations',
  description: 'Decide what appears on your shelves.',
  defaultLevel: 'always'
},
{
  id: 'act.organise',
  ring: 'act',
  label: 'Organise your library and watchlists',
  description: 'Group, sort and build lists on your behalf.',
  defaultLevel: 'always'
},
{
  id: 'act.summarise',
  ring: 'act',
  label: 'Summarise content and discussions',
  description: 'Catch-ups and spoiler-safe recaps.',
  defaultLevel: 'always'
},
{
  id: 'act.studio',
  ring: 'act',
  label: 'Assist in Studio',
  description: 'Plan shots, draft scenes and run generation jobs you approve.',
  defaultLevel: 'always'
},
{
  id: 'act.monetize',
  ring: 'act',
  label: 'Suggest monetization',
  description: 'Propose pricing, memberships and Market products.',
  defaultLevel: 'ask'
},
{
  id: 'act.publish',
  ring: 'act',
  label: 'Publish content',
  description: 'Make work public under your name.',
  defaultLevel: 'ask'
},
{
  id: 'act.spend',
  ring: 'act',
  label: 'Spend HavaPay funds',
  description: 'Move money out of your wallet.',
  defaultLevel: 'never',
  locked: 'never',
  lockReason:
  'Financial authority is never delegated to an agent. Every payment is confirmed by you.'
}];


export const autonomyOptions: AutonomyOption[] = [
{
  id: 'guided',
  label: 'Guided',
  consequence:
  'Hava AI explains and suggests. You perform every creative action yourself.'
},
{
  id: 'collaborative',
  label: 'Collaborative',
  consequence:
  'Hava AI generates proposals and waits for your approval before any important creative action.'
},
{
  id: 'delegated',
  label: 'Delegated',
  consequence:
  'Hava AI executes production workflows you have already approved, and keeps you informed as it goes.'
},
{
  id: 'autonomous',
  label: 'Autonomous',
  consequence:
  'Hava AI runs the pipeline end to end and surfaces only exceptions. Rights, payment and publishing still stop for you.'
}];


/* ------------------------------------------------------- account surfaces */

export const connectedDevices: ConnectedDevice[] = [
{
  id: 'd1',
  name: 'Chrome on Windows',
  kind: 'web',
  location: 'Lagos, Nigeria',
  lastActive: 'Active now',
  current: true
},
{
  id: 'd2',
  name: 'iPhone 15 Pro',
  kind: 'phone',
  location: 'Lagos, Nigeria',
  lastActive: '11:12 this morning',
  current: false
},
{
  id: 'd3',
  name: 'Android TV — Living room',
  kind: 'tv',
  location: 'Lagos, Nigeria',
  lastActive: 'Yesterday, 21:40',
  current: false
},
{
  id: 'd4',
  name: 'MacBook Pro',
  kind: 'desktop',
  location: 'Accra, Ghana',
  lastActive: '4 days ago',
  current: false
}];


export const ecosystemLinks: EcosystemLink[] = [
{
  id: 'studio',
  label: 'HavaVerse Studio',
  to: '/studio',
  status: 'connected',
  permissions: ['Your projects', 'Generation credits', 'Creator identity']
},
{
  id: 'play',
  label: 'HavaVerse Play',
  to: '/',
  status: 'connected',
  permissions: ['Watch history', 'Watchlist', 'Entitlements']
},
{
  id: 'live',
  label: 'HavaVerse Live',
  to: '/sports',
  status: 'connected',
  permissions: ['Event reminders', 'Predictions']
},
{
  id: 'community',
  label: 'HavaVerse Community',
  to: '/communities',
  status: 'connected',
  permissions: ['Memberships', 'Posts and replies', 'Viewing progress']
},
{
  id: 'market',
  label: 'HavaVerse Market',
  to: '/market',
  status: 'connected',
  permissions: ['Orders', 'Collection', 'Shipping address']
},
{
  id: 'havapay',
  label: 'HavaPay',
  to: '/wallet',
  status: 'connected',
  permissions: ['Wallet balance', 'Payment methods', 'Payouts']
}];


export const activityLog: ActivityEntry[] = [
{
  id: 'a1',
  label: 'AI memory preference updated',
  detail: 'Retention shortened to a year',
  at: '2:34 PM',
  day: 'Today',
  kind: 'ai'
},
{
  id: 'a2',
  label: 'New device connected',
  detail: 'iPhone 15 Pro · Lagos',
  at: '11:12 AM',
  day: 'Today',
  kind: 'security'
},
{
  id: 'a3',
  label: 'Hava AI built a watchlist',
  detail: '"Lagos night" — 6 titles',
  at: '9:02 AM',
  day: 'Today',
  kind: 'ai'
},
{
  id: 'a4',
  label: 'Notification preferences changed',
  detail: 'Push set to Smart',
  at: '7:48 PM',
  day: 'Yesterday',
  kind: 'notification'
},
{
  id: 'a5',
  label: 'Payment method added',
  detail: '•••• 4821',
  at: '3:21 PM',
  day: 'Yesterday',
  kind: 'payment'
},
{
  id: 'a6',
  label: 'Hava AI declined an action',
  detail: 'Asked to publish Scene 12 — held for your approval',
  at: '1:05 PM',
  day: 'Yesterday',
  kind: 'ai'
},
{
  id: 'a7',
  label: 'Profile visibility changed',
  detail: 'Activity limited to followers',
  at: 'Mon',
  day: 'Earlier',
  kind: 'privacy'
}];


export const dataDomains: DataDomain[] = [
{
  id: 'viewing',
  label: 'Viewing',
  usedFor: 'Resume, recommendations, spoiler protection',
  stored: 'While your account is open',
  shared: 'Creators see aggregate counts only',
  controlSettingId: 'rec.watch-history'
},
{
  id: 'search',
  label: 'Search',
  usedFor: 'Results ranking and recent searches',
  stored: '90 days',
  shared: 'Never shared',
  controlSettingId: 'rec.search-history'
},
{
  id: 'ai',
  label: 'Hava AI',
  usedFor: 'Memory, personalisation and assistance',
  stored: 'Per your retention setting',
  shared: 'Never used to train shared models',
  controlSettingId: 'ai.memory'
},
{
  id: 'social',
  label: 'Social',
  usedFor: 'Communities, replies, reactions',
  stored: 'Until you delete the post',
  shared: 'Visible per your audience settings',
  controlSettingId: 'social.activity'
},
{
  id: 'purchases',
  label: 'Purchases',
  usedFor: 'Orders, entitlements, your collection',
  stored: '7 years — statutory',
  shared: 'Creator sees the sale, not you',
  controlSettingId: 'rec.purchases'
},
{
  id: 'device',
  label: 'Device',
  usedFor: 'Playback quality and session security',
  stored: 'While the session is active',
  shared: 'Never shared',
  controlSettingId: 'playback.quality'
}];


export const familyProfiles: FamilyProfile[] = [
{
  id: 'f1',
  name: 'David',
  tier: 'Adult',
  avatar: "/a5a337e4-e160-4f17-9a1a-72ef9e489fb4.jpg",
  maturity: 'No restriction',
  screenTime: 'Unlimited',
  purchases: 'Allowed',
  aiAccess: 'Full'
},
{
  id: 'f2',
  name: 'Amara',
  tier: 'Teen',
  avatar: "/6e5ea6a3-56be-447a-96c9-aa02bddb7b08.jpg",
  maturity: 'PG-16 and below',
  screenTime: '3 hours on school nights',
  purchases: 'Ask first',
  aiAccess: 'Assist only — no publishing'
},
{
  id: 'f3',
  name: 'Junior',
  tier: 'Child',
  avatar: "/2e44c4cd-afde-4b46-99e3-e7b726869491.jpg",
  maturity: 'PG and below',
  screenTime: '1 hour daily',
  purchases: 'Blocked',
  aiAccess: 'Recommendations only'
}];


export const labExperiments: LabExperiment[] = [
{
  id: 'lab-director',
  label: 'AI Director Labs',
  blurb: 'Next-generation shot planning with multi-scene continuity.',
  joined: true,
  stability: 'Early'
},
{
  id: 'lab-discovery',
  label: 'Semantic discovery',
  blurb: 'Describe a mood in a sentence instead of browsing genres.',
  joined: true,
  stability: 'Stable'
},
{
  id: 'lab-interactive',
  label: 'Interactive stories',
  blurb: 'Titles where the audience decides what the next scene is.',
  joined: false,
  stability: 'Early'
},
{
  id: 'lab-immersive',
  label: 'Immersive watch',
  blurb: 'Spatial audio and ambient room lighting during playback.',
  joined: false,
  stability: 'Early'
},
{
  id: 'lab-rooms',
  label: 'Persistent listening rooms',
  blurb: 'Always-on audio rooms attached to a community.',
  joined: false,
  stability: 'Winding down'
}];


export const securitySignals: SecuritySignal[] = [
{ id: 's1', label: 'Password', value: 'Changed 4 months ago', state: 'good' },
{ id: 's2', label: 'Passkeys', value: 'Not set up', state: 'attention', action: 'Add a passkey' },
{
  id: 's3',
  label: 'Two-factor authentication',
  value: 'Authenticator app',
  state: 'good'
},
{ id: 's4', label: 'Recovery email', value: 'Verified', state: 'good' },
{
  id: 's5',
  label: 'Recovery phone',
  value: 'Not verified',
  state: 'attention',
  action: 'Verify phone'
},
{ id: 's6', label: 'Unrecognised sign-ins', value: 'None in 30 days', state: 'good' }];