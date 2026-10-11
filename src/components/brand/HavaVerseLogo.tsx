import React from 'react';
import { BRAND, type BrandRegion } from '../../data/brand';

type LogoVariant = 'full' | 'compact' | 'icon' | 'stacked';
type LogoSize = 'header' | 'md' | 'lg' | 'hero';

interface HavaVerseLogoProps {
  /** full = symbol + wordmark + tagline · compact = symbol + wordmark · icon = symbol · stacked = master as supplied */
  variant?: LogoVariant;
  size?: LogoSize;
  /**
   * Header only: how the lockup collapses on narrow screens.
   * 'narrow' → symbol alone below 360px (signed-in header, four controls on the right)
   * 'sm'     → symbol alone below 640px (signed-out header, two wide buttons on the right)
   */
  collapse?: 'none' | 'narrow' | 'sm';
  /** Render the accessible name. Leave false when a wrapping link carries aria-label. */
  labelled?: boolean;
  className?: string;
}

/** Symbol height per size. Wordmark and tagline scale from their own classes below. */
const SYMBOL_CLASS: Record<LogoSize, string> = {
  header: 'h-9 min-[414px]:h-10 sm:h-11 lg:h-12',
  md: 'h-11',
  lg: 'h-12',
  hero: 'h-16'
};

const WORDMARK_CLASS: Record<LogoSize, string> = {
  header: 'h-[11px] min-[375px]:h-3 min-[414px]:h-4 sm:h-5 lg:h-6',
  md: 'h-5',
  lg: 'h-6',
  hero: 'h-8'
};

const STACKED_CLASS: Record<LogoSize, string> = {
  header: 'h-12',
  md: 'h-20',
  lg: 'h-28',
  hero: 'h-36'
};

/* ------------------------------------------------------------------ aspect */

let masterAspect = 1.5; // width / height; replaced once the master has loaded
const listeners = new Set<(a: number) => void>();
let loading = false;

function loadAspect() {
  if (loading || typeof window === 'undefined') return;
  loading = true;
  const img = new Image();
  img.onload = () => {
    if (img.naturalWidth && img.naturalHeight) {
      masterAspect = img.naturalWidth / img.naturalHeight;
      listeners.forEach((fn) => fn(masterAspect));
    }
  };
  img.src = BRAND.master;
}

function useMasterAspect(): number {
  const [aspect, setAspect] = React.useState(masterAspect);
  React.useEffect(() => {
    listeners.add(setAspect);
    loadAspect();
    return () => {
      listeners.delete(setAspect);
    };
  }, []);
  return aspect;
}

/* ------------------------------------------------------------------ region */

interface RegionProps {
  region: BrandRegion;
  aspect: number;
  className?: string;
  /** Size by width instead of height (tagline matches the wordmark's width). */
  fillWidth?: boolean;
}

/**
 * Shows one region of the master, scaled uniformly. The element's aspect ratio
 * equals the region's true aspect, so the artwork is never stretched.
 */
function Region({ region, aspect, className = '', fillWidth = false }: RegionProps) {
  const dw = region.x2 - region.x1;
  const dh = region.y2 - region.y1;
  const style: React.CSSProperties = {
    backgroundImage: `url("${BRAND.master}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${100 / dw}% ${100 / dh}%`,
    backgroundPosition: `${region.x1 / (1 - dw) * 100}% ${region.y1 / (1 - dh) * 100}%`,
    aspectRatio: `${dw * aspect} / ${dh}`,
    ...(fillWidth ? { width: '100%' } : { width: 'auto' })
  };
  return <span aria-hidden="true" className={`block shrink-0 ${className}`} style={style} />;
}

/* ------------------------------------------------------------------- logo */

export function HavaVerseLogo({
  variant = 'full',
  size = 'md',
  collapse = 'none',
  labelled = false,
  className = ''
}: HavaVerseLogoProps) {
  const aspect = useMasterAspect();
  const { symbol, wordmark, tagline, stacked } = BRAND.regions;
  const name = labelled ? <span className="sr-only">{BRAND.name}</span> : null;

  if (variant === 'stacked') {
    return (
      <span className={`inline-flex ${className}`}>
        {name}
        {/* Dark surfaces: the master exactly as supplied. */}
        <Region region={stacked} aspect={aspect} className={`hv-brand-dark-only ${STACKED_CLASS[size]}`} />
        {/* Light surfaces: the full-colour symbol, since the master's wordmark is white. */}
        <Region region={symbol} aspect={aspect} className={`hv-brand-light-only ${SYMBOL_CLASS[size]}`} />
      </span>);

  }

  if (variant === 'icon') {
    return (
      <span className={`inline-flex ${className}`}>
        {name}
        <Region region={symbol} aspect={aspect} className={SYMBOL_CLASS[size]} />
      </span>);

  }

  const hideText =
  collapse === 'narrow' ? 'hidden min-[360px]:flex' : collapse === 'sm' ? 'hidden sm:flex' : 'flex';
  // The tagline only appears where its letters stay readable; otherwise it is hidden, not shrunk.
  const taglineClass =
  variant === 'full' ? size === 'header' ? 'hidden lg:block' : 'block' : 'hidden';

  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`}>
      {name}
      <Region region={symbol} aspect={aspect} className={SYMBOL_CLASS[size]} />
      <span className={`hv-brand-dark-only ${hideText} flex-col justify-center gap-[3px]`}>
        <Region region={wordmark} aspect={aspect} className={WORDMARK_CLASS[size]} />
        <span className={taglineClass}>
          <Region region={tagline} aspect={aspect} fillWidth />
        </span>
      </span>
    </span>);

}