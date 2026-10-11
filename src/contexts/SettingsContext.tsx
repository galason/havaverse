import React from 'react';
import type { RoleScope, SettingDefinition, SettingValue } from '../types/settings';
import { sections as allSections } from '../data/settings';
import { settingsApi } from '../services/settingsApi';
import { useAuth } from './AuthContext';

type Values = Record<string, SettingValue>;

interface SettingsContextValue {
  status: 'loading' | 'ready' | 'error';
  reload: () => void;
  roles: RoleScope[];
  /** Definitions this account is allowed to see. */
  registry: SettingDefinition[];
  /** Sections this account is allowed to see, in nav order. */
  sections: typeof allSections;
  /** Saved value plus any unsaved edit on top. */
  valueOf: (id: string) => SettingValue;
  /** True when a dependency is unmet, with the reason to state. */
  blockedBy: (def: SettingDefinition) => string | null;
  setDraft: (id: string, value: SettingValue) => void;
  dirtyIds: string[];
  saving: boolean;
  saveError: string;
  save: () => Promise<boolean>;
  reset: () => void;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: {children: React.ReactNode;}) {
  const { identity } = useAuth();
  const accountType = identity?.accountType;

  const roles = React.useMemo<RoleScope[]>(() => {
    const type = accountType ?? 'viewer';
    if (type === 'creator' || type === 'both') return ['viewer', 'creator'];
    return ['viewer'];
  }, [accountType]);

  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [registry, setRegistry] = React.useState<SettingDefinition[]>([]);
  const [saved, setSaved] = React.useState<Values>({});
  const [draft, setDraftState] = React.useState<Values>({});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const [reg, vals] = await Promise.all([
    settingsApi.loadRegistry(roles),
    settingsApi.loadValues()]
    );
    if (!reg.ok || !vals.ok) {
      setStatus('error');
      return;
    }
    setRegistry(reg.data);
    // Account type is owned by the identity service, so the registry default
    // never wins over what the account actually is.
    setSaved(accountType ? { ...vals.data, 'account.type': accountType } : vals.data);
    setDraftState({});
    setStatus('ready');
  }, [roles, accountType]);

  React.useEffect(() => {
    load();
  }, [load]);

  const sections = React.useMemo(
    () => allSections.filter((s) => s.roleScope.some((r) => roles.includes(r))),
    [roles]
  );

  const valueOf = React.useCallback(
    (id: string) => id in draft ? draft[id] : saved[id],
    [draft, saved]
  );

  const blockedBy = React.useCallback(
    (def: SettingDefinition) => {
      if (!def.dependsOn) return null;
      const current = def.dependsOn.settingId in draft ?
      draft[def.dependsOn.settingId] :
      saved[def.dependsOn.settingId];
      if (current !== def.dependsOn.equals) return null;
      const parent = registry.find((d) => d.id === def.dependsOn!.settingId);
      return `Unavailable while “${parent?.label ?? def.dependsOn.settingId}” is set this way.`;
    },
    [draft, saved, registry]
  );

  const setDraft = React.useCallback(
    (id: string, value: SettingValue) => {
      setSaveError('');
      setDraftState((prev) => {
        const next = { ...prev };
        // Returning a value to its saved state clears it from the diff, so the
        // unsaved indicator reflects real change rather than any interaction.
        if (saved[id] === value) delete next[id];else
        next[id] = value;
        return next;
      });
    },
    [saved]
  );

  const save = React.useCallback(async () => {
    if (Object.keys(draft).length === 0) return true;
    setSaving(true);
    setSaveError('');
    const result = await settingsApi.saveValues(draft);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return false;
    }
    setSaved(result.data);
    setDraftState({});
    return true;
  }, [draft]);

  const value: SettingsContextValue = {
    status,
    reload: load,
    roles,
    registry,
    sections,
    valueOf,
    blockedBy,
    setDraft,
    dirtyIds: Object.keys(draft),
    saving,
    saveError,
    save,
    reset: () => {
      setDraftState({});
      setSaveError('');
    }
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}