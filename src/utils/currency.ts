/** "₦412,800" — naira display. Amounts are whole naira. */
export function naira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

/** "1 Oct" from an ISO date. */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}