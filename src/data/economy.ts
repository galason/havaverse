export interface Transaction {
  id: string;
  label: string;
  detail: string;
  amount: string;
  direction: 'in' | 'out';
  date: string;
  status: 'settled' | 'pending' | 'failed';
}

/**
 * Opening wallet balance, in naira. HavaPay owns the authoritative figure
 * server-side; this is the single seed the prototype reads so Wallet and the
 * dashboard can never display two different balances.
 */
export const openingBalance = 486_300;

export const transactions: Transaction[] = [
{
  id: 'tx1',
  label: 'Tip to Adaeze Films',
  detail: 'The Last Train · watch party',
  amount: '₦2,000',
  direction: 'out',
  date: '20 Sep',
  status: 'settled'
},
{
  id: 'tx2',
  label: 'Premium Plus subscription',
  detail: 'Monthly · renews 4 Oct',
  amount: '₦4,900',
  direction: 'out',
  date: '4 Sep',
  status: 'settled'
},
{
  id: 'tx3',
  label: 'Ticket — Afrobeats Night',
  detail: 'HavaMarket · 10 May 2026',
  amount: '₦18,000',
  direction: 'out',
  date: '2 Sep',
  status: 'pending'
},
{
  id: 'tx4',
  label: 'Creator payout',
  detail: 'August earnings · The Last Train',
  amount: '₦412,800',
  direction: 'in',
  date: '1 Sep',
  status: 'settled'
},
{
  id: 'tx5',
  label: 'Wallet top-up',
  detail: 'Card ending 4417',
  amount: '₦25,000',
  direction: 'in',
  date: '28 Aug',
  status: 'settled'
},
{
  id: 'tx6',
  label: 'PPV — Lagos 2042 premiere',
  detail: 'Early access screening',
  amount: '₦3,500',
  direction: 'out',
  date: '24 Aug',
  status: 'failed'
}];


export interface RevenueStream {
  id: string;
  label: string;
  amount: string;
  share: number;
  trend: string;
}

export const revenueStreams: RevenueStream[] = [
{ id: 'r1', label: 'Subscription share', amount: '₦186,400', share: 45, trend: '+12%' },
{ id: 'r2', label: 'Memberships', amount: '₦112,000', share: 27, trend: '+31%' },
{ id: 'r3', label: 'Tips', amount: '₦61,200', share: 15, trend: '+8%' },
{ id: 'r4', label: 'HavaMarket', amount: '₦33,900', share: 8, trend: '+44%' },
{ id: 'r5', label: 'Advertising', amount: '₦19,300', share: 5, trend: '−3%' }];