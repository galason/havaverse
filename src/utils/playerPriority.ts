/**
 * Only one persistent bar is ever on screen, and it must be the one that is
 * actually making sound. Both bars derive their visibility from this single
 * rule so they can never stack or hide a playing source.
 */
export interface BarState {
  loaded: boolean;
  playing: boolean;
}

export function musicOwnsBar(music: BarState, podcast: BarState): boolean {
  if (!music.loaded) return false;
  if (!podcast.loaded) return true;
  // A loaded-but-paused episode yields to music that is genuinely playing.
  return music.playing && !podcast.playing;
}

export function podcastOwnsBar(music: BarState, podcast: BarState): boolean {
  return podcast.loaded && !musicOwnsBar(music, podcast);
}