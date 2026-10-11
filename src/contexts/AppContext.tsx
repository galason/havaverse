import React from 'react';
import { watchApi } from '../services/watchApi';
import { socialApi } from '../services/socialApi';
import { notificationsApi } from '../services/notificationsApi';
import type { AppNotification } from '../types/notifications';

interface AppState {
  watchlist: string[];
  isSaved: (id: string) => boolean;
  toggleWatchlist: (id: string) => void;
  following: string[];
  isFollowing: (handle: string) => boolean;
  toggleFollow: (handle: string) => void;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  toast: string | null;
  showToast: (message: string) => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: {children: React.ReactNode;}) {
  // Seeded from the services that own them; every change writes back through them.
  const [watchlist, setWatchlist] = React.useState<string[]>(() => watchApi.listWatchlist());
  const [following, setFollowing] = React.useState<string[]>(() => socialApi.listFollowing());
  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => notificationsApi.snapshot());
  const [toast, setToast] = React.useState<string | null>(null);
  const timer = React.useRef<number>();

  const showToast = React.useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  // The notification service owns the inbox; every change (new arrival,
  // read state, dismissal) is mirrored here for the header and the centre.
  React.useEffect(() => notificationsApi.subscribe((next) => setNotifications(next)), []);

  const value: AppState = {
    watchlist,
    isSaved: (id) => watchlist.includes(id),
    toggleWatchlist: (id) => {
      const saved = watchlist.includes(id);
      setWatchlist(watchApi.setWatchlisted(id, !saved));
      showToast(saved ? 'Removed from your watchlist' : 'Added to your watchlist');
    },
    following,
    isFollowing: (handle) => following.includes(handle),
    toggleFollow: (handle) => {
      const was = following.includes(handle);
      setFollowing(socialApi.setFollowing(handle, !was));
      showToast(was ? `Unfollowed ${handle}` : `Following ${handle}`);
    },
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAllRead: () => notificationsApi.markAllRead(),
    markRead: (id) => notificationsApi.markRead(id),
    toast,
    showToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}