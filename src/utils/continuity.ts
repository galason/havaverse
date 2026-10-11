import type { ContinuityCheckStatus, LockedAssetType } from '../types/continuity';

/** Pipeline and rails show confidence qualitatively; detail views show %. */
export function confidenceLabel(confidence: number): 'High' | 'Medium' | 'Low' {
  if (confidence >= 0.92) return 'High';
  if (confidence >= 0.8) return 'Medium';
  return 'Low';
}

export const assetTypeLabel: Record<LockedAssetType, string> = {
  character: 'Characters',
  location: 'Locations',
  wardrobe: 'Wardrobe',
  grade: 'Grade',
  prop: 'Props',
  vehicle: 'Vehicles'
};

export const checkStatusLabel: Record<ContinuityCheckStatus | 'unchecked', string> = {
  verified: 'Verified',
  failed: 'Failures',
  partial: 'Not verified',
  running: 'Checking…',
  unchecked: 'Not checked'
};

export function since(iso?: string): string {
  if (!iso) return '—';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}