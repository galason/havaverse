import React from 'react';
import { useMusic } from '../contexts/MusicContext';

/**
 * A video surface takes the audio. Entering the player or Shorts silences the
 * persistent music/podcast bars so two sources can never run at once — the
 * same arbiter the bars themselves use.
 */
export function useExclusiveVideo(active = true): void {
  const { pauseAll } = useMusic();
  React.useEffect(() => {
    if (active) pauseAll();
  }, [active, pauseAll]);
}