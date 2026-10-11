import React from 'react';
import { useApp } from './AppContext';
import { communityApi, savedKeys, setSaved } from '../services/communityApi';
import { liveReminders } from '../services/liveReminders';
import { achievementRules } from '../data/communityContent';
import type { SpoilerLevel } from '../types/community';
import type {
  ActivityCounters,
  CommunityMembership } from
'../types/communityEntities';

interface CommunityState {
  memberships: CommunityMembership[];
  isMember: (slug: string) => boolean;
  membership: (slug: string) => CommunityMembership | undefined;
  join: (slug: string, name: string) => Promise<void>;
  leave: (slug: string, name: string) => Promise<void>;
  setMuted: (slug: string, muted: boolean) => void;
  setNotifications: (slug: string, mode: CommunityMembership['notifications']) => void;
  pendingCommunity: string | null;

  reminders: string[];
  hasReminder: (eventId: string) => boolean;
  toggleReminder: (eventId: string, name: string) => void;

  joinedParties: string[];
  hasJoinedParty: (id: string) => boolean;
  joinParty: (id: string, title: string) => Promise<void>;
  leaveParty: (id: string) => void;

  votes: Record<string, string[]>;
  recordVote: (pollId: string, optionIds: string[]) => void;
  hasVoted: (pollId: string) => boolean;

  questionVotes: string[];
  toggleQuestionVote: (questionId: string) => void;

  /**
   * One saved-items collection for every community object. Keys are
   * `<type>:<id>` so discussions, fan creations and anything added later share
   * a single canonical store instead of per-page local flags.
   */
  savedItems: string[];
  isSavedItem: (key: string) => boolean;
  toggleSave: (key: string, label: string) => Promise<void>;

  /** Where the viewer has reached, used by the spoiler system. */
  spoilerLevel: SpoilerLevel;
  setSpoilerLevel: (level: SpoilerLevel) => void;
  revealed: string[];
  reveal: (id: string) => void;

  counters: ActivityCounters;
  bump: (metric: keyof ActivityCounters, by?: number) => void;
  earnedAchievements: string[];
}

const CommunityContext = React.createContext<CommunityState | null>(null);

const initialMemberships: CommunityMembership[] = [
{ slug: 'the-last-train', joinedAt: '3 months ago', muted: false, notifications: 'all', role: 'Member' },
{ slug: 'super-eagles', joinedAt: '1 year ago', muted: false, notifications: 'highlights', role: 'Member' }];


export function CommunityProvider({ children }: {children: React.ReactNode;}) {
  const { showToast } = useApp();
  const [memberships, setMemberships] = React.useState<CommunityMembership[]>(initialMemberships);
  const [pendingCommunity, setPendingCommunity] = React.useState<string | null>(null);
  // Reminders live in the shared Live store (keyed `community:<id>`), so a
  // reminder set here also shows on /live and Home's Live Now rail.
  const [reminderKeys, setReminderKeys] = React.useState<string[]>(() => liveReminders.all());
  React.useEffect(() => liveReminders.subscribe(setReminderKeys), []);
  const reminders = reminderKeys.
  filter((k) => k.startsWith('community:')).
  map((k) => k.slice('community:'.length));
  const [joinedParties, setJoinedParties] = React.useState<string[]>([]);
  const [votes, setVotes] = React.useState<Record<string, string[]>>({});
  const [questionVotes, setQuestionVotes] = React.useState<string[]>([]);
  const [savedItems, setSavedItems] = React.useState<string[]>(() => savedKeys());
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [spoilerLevel, setSpoilerLevel] = React.useState<SpoilerLevel>('current');
  const [revealed, setRevealed] = React.useState<string[]>([]);
  const [counters, setCounters] = React.useState<ActivityCounters>({
    discussions: 0,
    replies: 0,
    partiesHosted: 0,
    partiesJoined: 0,
    creations: 0,
    daysActive: 1
  });

  const value: CommunityState = {
    memberships,
    pendingCommunity,
    isMember: (slug) => memberships.some((m) => m.slug === slug),
    membership: (slug) => memberships.find((m) => m.slug === slug),

    join: async (slug, name) => {
      setPendingCommunity(slug);
      const result = await communityApi.joinCommunity(slug);
      setPendingCommunity(null);
      if (!result.ok) {
        showToast('Could not join. Try again.');
        return;
      }
      setMemberships((prev) => [
      ...prev,
      { slug, joinedAt: 'just now', muted: false, notifications: 'all', role: 'Member' }]
      );
      showToast(`Joined ${name}`);
    },

    leave: async (slug, name) => {
      setPendingCommunity(slug);
      const result = await communityApi.leaveCommunity(slug);
      setPendingCommunity(null);
      if (!result.ok) {
        showToast('Could not leave. Try again.');
        return;
      }
      setMemberships((prev) => prev.filter((m) => m.slug !== slug));
      showToast(`Left ${name}`);
    },

    setMuted: (slug, muted) => {
      setMemberships((prev) => prev.map((m) => m.slug === slug ? { ...m, muted } : m));
      showToast(muted ? 'Community muted' : 'Community unmuted');
    },

    setNotifications: (slug, notifications) => {
      setMemberships((prev) => prev.map((m) => m.slug === slug ? { ...m, notifications } : m));
      showToast(
        notifications === 'off' ?
        'Notifications off for this community' :
        `Notifications set to ${notifications}`
      );
    },

    reminders,
    hasReminder: (eventId) => reminders.includes(eventId),
    toggleReminder: (eventId, name) => {
      const on = liveReminders.toggle(`community:${eventId}`);
      showToast(on ? `Reminder set for ${name}` : 'Reminder removed');
    },

    joinedParties,
    hasJoinedParty: (id) => joinedParties.includes(id),
    joinParty: async (id, title) => {
      const result = await communityApi.joinWatchParty(id);
      if (!result.ok) {
        showToast('Could not join the watch party.');
        return;
      }
      setJoinedParties((prev) => prev.includes(id) ? prev : [...prev, id]);
      setCounters((prev) => ({ ...prev, partiesJoined: prev.partiesJoined + 1 }));
      showToast(`Joined ${title}`);
    },
    leaveParty: (id) => {
      setJoinedParties((prev) => prev.filter((p) => p !== id));
      showToast('Left the watch party');
    },

    votes,
    hasVoted: (pollId) => Boolean(votes[pollId]),
    recordVote: (pollId, optionIds) => setVotes((prev) => ({ ...prev, [pollId]: optionIds })),

    questionVotes,
    toggleQuestionVote: (questionId) =>
    setQuestionVotes((prev) =>
    prev.includes(questionId) ? prev.filter((q) => q !== questionId) : [...prev, questionId]
    ),

    savedItems,
    isSavedItem: (key) => savedItems.includes(key),
    // The service decides. Nothing is shown as saved until it confirms, and a
    // second click while one is in flight is ignored so a double-tap cannot
    // leave the collection out of step with the store.
    toggleSave: async (key, label) => {
      if (savingKey === key) return;
      const next = !savedItems.includes(key);
      setSavingKey(key);
      const result = await setSaved(key, next);
      setSavingKey(null);
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      setSavedItems((prev) => next ? [...prev, key] : prev.filter((k) => k !== key));
      showToast(next ? `Saved ${label}` : 'Removed from saved');
    },

    spoilerLevel,
    setSpoilerLevel,
    revealed,
    reveal: (id) => setRevealed((prev) => prev.includes(id) ? prev : [...prev, id]),

    counters,
    bump: (metric, by = 1) => setCounters((prev) => ({ ...prev, [metric]: prev[metric] + by })),
    earnedAchievements: achievementRules.
    filter((rule) => counters[rule.metric] >= rule.threshold).
    map((rule) => rule.id)
  };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = React.useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used inside CommunityProvider');
  return context;
}