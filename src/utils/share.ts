/**
 * Copy a link and report what actually happened. A "copied" message is only
 * honest if the clipboard write succeeded, so failure is surfaced rather than
 * swallowed.
 */
export async function copyLink(path: string): Promise<boolean> {
  const url = path.startsWith('http') ?
  path :
  `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export async function copyAndReport(
path: string,
label: string,
toast: (message: string) => void)
: Promise<void> {
  const copied = await copyLink(path);
  toast(copied ? `${label} copied` : 'Your browser blocked the clipboard — copy the address bar');
}