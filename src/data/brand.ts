/**
 * Canonical HavaVerse brand asset.
 *
 * `master` is the supplied transparent (background-less) stacked lockup:
 * symbol on top, "HavaVerse" wordmark beneath, CREATE · WATCH · CONNECT · EARN
 * tagline under that. It is the ONLY logo source in the product — nothing
 * redraws, recolours or traces it. Every lockup is a *view* onto this one file.
 *
 * `regions` are the bounding boxes of each part of the artwork, expressed as
 * fractions of the master's width/height, with a small safety margin so the
 * ring, pillars and letterforms are never clipped. The logo component shows
 * those regions (scaled uniformly, never stretched) to compose the horizontal
 * header lockup from the same master.
 *
 * Light surfaces: the master's "Hava" letters are white, so the wordmark only
 * works on dark surfaces. No light-surface variant has been supplied, so on
 * light surfaces the component shows the full-colour symbol alone rather than
 * inventing a new treatment. Add `lightMaster` here when one exists.
 */
export interface BrandRegion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const BRAND = {
  name: 'HavaVerse',
  tagline: 'Create · Watch · Connect · Earn',
  master: "/adesco_background_removed_image_(1).png",

  regions: {
    symbol: { x1: 0.285, y1: 0.135, x2: 0.725, y2: 0.61 },
    wordmark: { x1: 0.195, y1: 0.615, x2: 0.85, y2: 0.755 },
    tagline: { x1: 0.265, y1: 0.765, x2: 0.755, y2: 0.83 },
    stacked: { x1: 0.195, y1: 0.135, x2: 0.85, y2: 0.83 }
  } satisfies Record<string, BrandRegion>
} as const;