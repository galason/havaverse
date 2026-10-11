/**
 * Hava Control — the configuration contract.
 *
 * Settings are DATA, not markup. The platform can introduce, retire, gate or
 * re-scope a control by editing the registry; no screen is redesigned and no
 * component is touched. Anything hardcoded into a panel is a bug.
 *
 * This is deliberately the same shape the server will serve from
 * `GET /api/settings/registry`, so the swap is a fetch, not a rewrite.
 */

export type SettingValue = string | boolean | number;

export type SettingValueType =
'toggle' |
'select' |
'segmented' |
'audience' |
'text' |
'scale';

/** Who a control is shown to. Enforcement still happens server-side. */
export type RoleScope = 'viewer' | 'creator' | 'organization';

/** High-impact capabilities are never a plain on/off. */
export type PermissionLevel = 'always' | 'ask' | 'never';

export interface SettingOption {
  value: string;
  label: string;
  /** Shown under the label when the consequence is not obvious. */
  description?: string;
}

export interface SettingDefinition {
  id: string;
  /** The section this control lives in. */
  category: string;
  /** Optional heading within the section. */
  group?: string;
  label: string;
  description?: string;
  valueType: SettingValueType;
  options?: SettingOption[];
  defaultValue: SettingValue;
  /** Hidden entirely from accounts outside this scope. */
  roleScope: RoleScope[];
  /** Server-side permission required to change it. */
  permission?: string;
  /** Greyed out, with the reason stated, until the dependency is met. */
  dependsOn?: {settingId: string;equals: SettingValue;};
  /** Stated when the value is constrained by territory rather than choice. */
  regionNote?: string;
  /** Requires deliberate confirmation before it takes effect. */
  confirm?: string;
  /** Whether a change is written to the account's security log. */
  audit: boolean;
  /** Free text used by settings search so people needn't know the taxonomy. */
  keywords: string[];
}

export type SectionRenderer =
'generic' |
'overview' |
'identity' |
'ai' |
'security' |
'devices' |
'havapay' |
'data' |
'family' |
'labs' |
'activity' |
'ecosystem' |
'appearance' |
'privacy' |
'sign-in' |
'notifications';

export interface SettingsSection {
  id: string;
  label: string;
  /** One line under the section title. */
  blurb: string;
  navGroup: string;
  renderer: SectionRenderer;
  roleScope: RoleScope[];
}

export interface NavGroup {
  id: string;
  label: string;
}

/* ------------------------------------------------------------ AI contract */

export interface AiCapability {
  id: string;
  label: string;
  description: string;
  /** Capabilities that can never be granted standing permission. */
  locked?: PermissionLevel;
  lockReason?: string;
  defaultLevel: PermissionLevel;
  /** understand | remember | act */
  ring: AiRing;
}

export type AiRing = 'understand' | 'remember' | 'act';

export type AutonomyLevel = 'guided' | 'collaborative' | 'delegated' | 'autonomous';

export interface AutonomyOption {
  id: AutonomyLevel;
  label: string;
  consequence: string;
}

/* ------------------------------------------------------- account surfaces */

export interface ConnectedDevice {
  id: string;
  name: string;
  kind: 'web' | 'phone' | 'tv' | 'desktop' | 'tablet';
  location: string;
  lastActive: string;
  current: boolean;
}

export interface EcosystemLink {
  id: string;
  label: string;
  to: string;
  status: 'connected' | 'available';
  permissions: string[];
}

export interface ActivityEntry {
  id: string;
  label: string;
  detail?: string;
  at: string;
  day: 'Today' | 'Yesterday' | 'Earlier';
  kind: 'ai' | 'security' | 'notification' | 'payment' | 'privacy';
}

export interface DataDomain {
  id: string;
  label: string;
  usedFor: string;
  stored: string;
  shared: string;
  /** The setting that governs this domain, so the map is not a dead diagram. */
  controlSettingId: string;
}

export interface FamilyProfile {
  id: string;
  name: string;
  tier: 'Adult' | 'Teen' | 'Child';
  avatar: string;
  maturity: string;
  screenTime: string;
  purchases: string;
  aiAccess: string;
}

export interface LabExperiment {
  id: string;
  label: string;
  blurb: string;
  joined: boolean;
  stability: 'Early' | 'Stable' | 'Winding down';
}

export interface SecuritySignal {
  id: string;
  label: string;
  value: string;
  state: 'good' | 'attention';
  action?: string;
}

/** What settings search returns — a resolved control, not a page of results. */
export interface SearchHit {
  settingId?: string;
  sectionId: string;
  label: string;
  path: string;
  why: string;
}