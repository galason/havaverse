import type {
  ActivityEntry,
  ConnectedDevice,
  PermissionLevel,
  SearchHit,
  SettingDefinition,
  SettingValue } from
'../types/settings';
import {
  activityLog,
  aiCapabilities,
  connectedDevices,
  labExperiments,
  sections,
  settingRegistry } from
'../data/settings';

/**
 * The Hava Control data boundary.
 *
 * Every method below maps to a documented route on the settings service:
 *
 *   GET    /api/settings/registry          definitions, scoped to the caller's role
 *   GET    /api/settings/values            this identity's resolved values
 *   PATCH  /api/settings/values            partial write, audited, server-validated
 *   POST   /api/settings/search            natural-language resolve
 *   GET    /api/settings/activity          the account's change log
 *   GET    /api/settings/devices           active sessions and devices
 *   DELETE /api/settings/devices/:id       revoke one session
 *   POST   /api/settings/devices/revoke-all
 *   POST   /api/settings/ai/permissions    capability grant changes
 *   POST   /api/settings/labs/:id/join | /leave
 *
 * Visibility here is a convenience, never a control: the server re-checks role,
 * permission and region scope on every write and rejects anything the caller is
 * not entitled to change, regardless of what this client chose to render.
 */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Values = Record<string, SettingValue>;

const store = {
  values: null as Values | null,
  permissions: null as Record<string, PermissionLevel> | null,
  autonomy: 'collaborative',
  devices: [...connectedDevices],
  activity: [...activityLog],
  labs: labExperiments.reduce<Record<string, boolean>>((acc, lab) => {
    acc[lab.id] = lab.joined;
    return acc;
  }, {})
};

function defaults(): Values {
  return settingRegistry.reduce<Values>((acc, def) => {
    acc[def.id] = def.defaultValue;
    return acc;
  }, {});
}

/* --------------------------------------------------------------- registry */

export async function loadRegistry(
roles: string[])
: Promise<ServiceResult<SettingDefinition[]>> {
  await delay(220);
  return ok(settingRegistry.filter((def) => def.roleScope.some((r) => roles.includes(r))));
}

export async function loadValues(): Promise<ServiceResult<Values>> {
  await delay(260);
  if (!store.values) store.values = defaults();
  return ok({ ...store.values });
}

export async function saveValues(patch: Values): Promise<ServiceResult<Values>> {
  await delay(620);

  // Server-side validation is authoritative; this mirrors two of its rules so
  // the prototype cannot persist a state the real service would reject.
  const invalid = Object.entries(patch).find(([id, value]) => {
    const def = settingRegistry.find((d) => d.id === id);
    if (!def) return true;
    if (def.valueType === 'text') return typeof value !== 'string';
    if (def.options) return !def.options.some((o) => o.value === value);
    return false;
  });
  if (invalid) {
    return { ok: false, error: `“${invalid[0]}” was rejected by the settings service.` };
  }

  store.values = { ...(store.values ?? defaults()), ...patch };

  const changed = Object.keys(patch);
  const audited = changed.filter((id) => settingRegistry.find((d) => d.id === id)?.audit);
  if (audited.length > 0) {
    store.activity = [
    {
      id: `log-${Date.now()}`,
      label: `${audited.length} setting${audited.length > 1 ? 's' : ''} updated`,
      detail: audited.
      map((id) => settingRegistry.find((d) => d.id === id)?.label).
      filter(Boolean).
      join(' · '),
      at: 'just now',
      day: 'Today',
      kind: 'privacy'
    },
    ...store.activity];

  }

  return ok({ ...store.values });
}

/* ----------------------------------------------------------------- search */

/**
 * Resolves plain language to a control. People should not have to know the
 * taxonomy — "stop hava ai remembering me" must land on AI memory.
 */
export async function search(query: string): Promise<ServiceResult<SearchHit[]>> {
  await delay(180);
  const q = query.trim().toLowerCase();
  if (q.length < 2) return ok([]);

  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = settingRegistry.
  map((def) => {
    const haystack = [def.label, def.description ?? '', ...def.keywords].
    join(' ').
    toLowerCase();
    let score = 0;
    if (haystack.includes(q)) score += 40;
    def.keywords.forEach((k) => {
      if (q.includes(k.toLowerCase())) score += 25;
    });
    words.forEach((w) => {
      if (haystack.includes(w)) score += 8;
    });
    return { def, score };
  }).
  filter((row) => row.score > 0).
  sort((a, b) => b.score - a.score).
  slice(0, 6);

  const hits: SearchHit[] = scored.map(({ def }) => {
    const section = sections.find((s) => s.id === def.category);
    return {
      settingId: def.id,
      sectionId: def.category,
      label: def.label,
      path: `${section?.label ?? def.category}`,
      why: def.description ?? `Lives in ${section?.label ?? def.category}.`
    };
  });

  // Section-level fallback so a broad query still goes somewhere useful.
  if (hits.length === 0) {
    const section = sections.find(
      (s) => s.label.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q)
    );
    if (section) {
      hits.push({
        sectionId: section.id,
        label: section.label,
        path: section.label,
        why: section.blurb
      });
    }
  }

  return ok(hits);
}

/* ------------------------------------------------------------ ai controls */

export async function loadPermissions(): Promise<
  ServiceResult<Record<string, PermissionLevel>>>
{
  await delay(200);
  if (!store.permissions) {
    store.permissions = aiCapabilities.reduce<Record<string, PermissionLevel>>((acc, cap) => {
      acc[cap.id] = cap.locked ?? cap.defaultLevel;
      return acc;
    }, {});
  }
  return ok({ ...store.permissions });
}

export async function setPermission(
id: string,
level: PermissionLevel)
: Promise<ServiceResult<PermissionLevel>> {
  await delay(320);
  const cap = aiCapabilities.find((c) => c.id === id);
  if (!cap) return { ok: false, error: 'Unknown capability.' };
  if (cap.locked) {
    return { ok: false, error: cap.lockReason ?? 'This capability cannot be granted.' };
  }
  if (!store.permissions) await loadPermissions();
  store.permissions![id] = level;
  store.activity = [
  {
    id: `log-${Date.now()}`,
    label: 'Hava AI permission changed',
    detail: `${cap.label} → ${level === 'always' ? 'Always allow' : level === 'ask' ? 'Ask me' : 'Never'}`,
    at: 'just now',
    day: 'Today',
    kind: 'ai'
  },
  ...store.activity];

  return ok(level);
}

export async function setAutonomy(level: string): Promise<ServiceResult<string>> {
  await delay(280);
  store.autonomy = level;
  return ok(level);
}

export function currentAutonomy(): string {
  return store.autonomy;
}

/* ---------------------------------------------------------------- devices */

export async function listDevices(): Promise<ServiceResult<ConnectedDevice[]>> {
  await delay(240);
  return ok([...store.devices]);
}

export async function revokeDevice(id: string): Promise<ServiceResult<ConnectedDevice[]>> {
  await delay(520);
  const device = store.devices.find((d) => d.id === id);
  if (!device) return { ok: false, error: 'That session has already ended.' };
  if (device.current) {
    return { ok: false, error: 'Use Sign out to end the session you are using right now.' };
  }
  store.devices = store.devices.filter((d) => d.id !== id);
  store.activity = [
  {
    id: `log-${Date.now()}`,
    label: 'Device access revoked',
    detail: device.name,
    at: 'just now',
    day: 'Today',
    kind: 'security'
  },
  ...store.activity];

  return ok([...store.devices]);
}

export async function revokeAllDevices(): Promise<ServiceResult<ConnectedDevice[]>> {
  await delay(900);
  store.devices = store.devices.filter((d) => d.current);
  store.activity = [
  {
    id: `log-${Date.now()}`,
    label: 'Signed out of all other devices',
    at: 'just now',
    day: 'Today',
    kind: 'security'
  },
  ...store.activity];

  return ok([...store.devices]);
}

/* --------------------------------------------------------------- activity */

export async function listActivity(
kind?: ActivityEntry['kind'])
: Promise<ServiceResult<ActivityEntry[]>> {
  await delay(240);
  return ok(kind ? store.activity.filter((a) => a.kind === kind) : [...store.activity]);
}

/* ------------------------------------------------------------------- labs */

export async function toggleLab(id: string): Promise<ServiceResult<boolean>> {
  await delay(420);
  store.labs[id] = !store.labs[id];
  return ok(store.labs[id]);
}

export function labState(): Record<string, boolean> {
  return { ...store.labs };
}

/* Data export and account deletion are identity operations — see authApi. */

export const settingsApi = {
  loadRegistry,
  loadValues,
  saveValues,
  search,
  loadPermissions,
  setPermission,
  setAutonomy,
  currentAutonomy,
  listDevices,
  revokeDevice,
  revokeAllDevices,
  listActivity,
  toggleLab,
  labState
};