/**
 * Device-local persistence used by service stand-ins until their server
 * endpoints exist. Views never call this directly — only services do, so the
 * swap to HTTP stays inside the service file.
 */

export function readJSON<T>(key: string, fallback: T, guard?: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (guard && !guard(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {

    /* storage full or blocked: state stays in memory for this session */}
}

export const isStringArray = (v: unknown): v is string[] =>
Array.isArray(v) && v.every((x) => typeof x === 'string');

/** "Chrome on Windows" — a human label for the current device, never a fingerprint. */
export function deviceLabel(): string {
  if (typeof navigator === 'undefined') return 'This device';
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ?
  'Edge' :
  /Firefox\//.test(ua) ?
  'Firefox' :
  /Chrome\//.test(ua) ?
  'Chrome' :
  /Safari\//.test(ua) ?
  'Safari' :
  'Browser';
  const os = /Windows/.test(ua) ?
  'Windows' :
  /iPhone|iPad/.test(ua) ?
  'iOS' :
  /Android/.test(ua) ?
  'Android' :
  /Mac OS X/.test(ua) ?
  'macOS' :
  /Linux/.test(ua) ?
  'Linux' :
  'this device';
  return `${browser} on ${os}`;
}