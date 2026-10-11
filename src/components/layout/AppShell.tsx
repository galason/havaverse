import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { PlayerBar, PlayerSpacer } from '../music/PlayerBar';
import { PodcastPlayerBar, PodcastSpacer } from '../podcast/PodcastPlayerBar';
import { useApp } from '../../contexts/AppContext';

export function AppShell() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const { toast } = useApp();

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="flex h-full min-h-screen w-full flex-col bg-ink-950">
      <TopBar onOpenMenu={() => setMenuOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="thin-scrollbar flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
          <PlayerSpacer />
          <PodcastSpacer />
        </main>
      </div>

      <AnimatePresence>
        {menuOpen &&
        <>
            <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 lg:hidden" />
          
            <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            
              <Sidebar onNavigate={() => setMenuOpen(false)} />
              <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-[-48px] top-3 rounded-full bg-ink-800 p-2.5 text-white transition-colors duration-150 ease-entrance hover:bg-ink-700">
              
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          </>
        }
      </AnimatePresence>

      <AnimatePresence>
        {toast &&
        <motion.p
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-ink-800 px-5 py-2.5 text-sm font-medium text-white shadow-2xl">
          
            {toast}
          </motion.p>
        }
      </AnimatePresence>

      <PlayerBar />
      <PodcastPlayerBar />
    </div>);

}