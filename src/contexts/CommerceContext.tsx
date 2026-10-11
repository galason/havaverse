import React from 'react';
import { commerceApi } from '../services/commerceApi';
import { marketProducts } from '../data/commerce';
import { useApp } from './AppContext';
import { analytics } from '../services/analytics';
import type { CartLine, CommerceAction, MarketProduct } from '../types/commerce';
import type { CheckoutOptions } from '../types/orders';

/** Naira, no decimals — matches how prices are quoted everywhere else. */
export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/** The verb shown on the button, derived from the economic action. */
export const actionLabel: Record<CommerceAction, string> = {
  buy: 'Buy',
  collect: 'Collect',
  watch: 'Get access',
  ticket: 'Reserve',
  experience: 'Reserve',
  support: 'Support creator',
  unlock: 'Unlock',
  preorder: 'Pre-order'
};

interface CommerceValue {
  bag: CartLine[];
  bagCount: number;
  bagTotal: number;
  add: (product: MarketProduct) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearBag: () => void;
  checkingOut: boolean;
  checkout: (options: CheckoutOptions) => Promise<{orderId: string;} | {error: string;}>;
  lastOrderId: string | null;
  collection: string[];
  owns: (productId: string) => boolean;
  notifying: string[];
  isNotifying: (dropId: string) => boolean;
  toggleNotify: (dropId: string, name: string) => void;
  passIds: string[];
  hasPass: (passId: string) => boolean;
  acquirePass: (passId: string, name: string) => Promise<void>;
}

const CommerceContext = React.createContext<CommerceValue | null>(null);

export function CommerceProvider({ children }: {children: React.ReactNode;}) {
  const { showToast } = useApp();

  const [bag, setBag] = React.useState<CartLine[]>([]);
  const [collection, setCollection] = React.useState<string[]>([]);
  const [notifying, setNotifying] = React.useState<string[]>([]);
  const [passIds, setPassIds] = React.useState<string[]>([]);
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [lastOrderId, setLastOrderId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    commerceApi.listCollection().then((result) => {
      if (active && result.ok) setCollection(result.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const priceOf = (productId: string) =>
  marketProducts.find((p) => p.id === productId)?.price ?? 0;

  const bagCount = bag.reduce((sum, line) => sum + line.quantity, 0);
  const bagTotal = bag.reduce((sum, line) => sum + priceOf(line.productId) * line.quantity, 0);

  const add = (product: MarketProduct) => {
    setBag((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
        line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
    showToast(`${actionLabel[product.action]} · ${product.name} added to your bag`);
  };

  const remove = (productId: string) =>
  setBag((prev) => prev.filter((line) => line.productId !== productId));

  const setQuantity = (productId: string, quantity: number) =>
  setBag((prev) =>
  quantity <= 0 ?
  prev.filter((line) => line.productId !== productId) :
  prev.map((line) => line.productId === productId ? { ...line, quantity } : line)
  );

  const clearBag = () => setBag([]);

  /**
   * Places the order and returns its id, or an error message. Ownership is NOT
   * granted here — the collection only changes once HavaPay confirms payment.
   */
  const checkout = async (options: CheckoutOptions): Promise<{orderId: string;} | {error: string;}> => {
    setCheckingOut(true);
    analytics.emit('purchase_started', 'market', undefined, { lines: bag.length, total: bagTotal });
    const result = await commerceApi.placeOrder(bag, options);
    setCheckingOut(false);
    if (!result.ok) return { error: result.error };
    setBag([]);
    setLastOrderId(result.data.id);
    return { orderId: result.data.id };
  };

  const toggleNotify = (dropId: string, name: string) => {
    setNotifying((prev) => {
      const on = prev.includes(dropId);
      showToast(on ? `Reminder off — ${name}` : `We'll tell you when ${name} opens`);
      return on ? prev.filter((id) => id !== dropId) : [...prev, dropId];
    });
    commerceApi.notifyOnDrop();
  };

  const acquirePass = async (passId: string, name: string) => {
    const result = await commerceApi.acquirePass(passId);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setPassIds((prev) => prev.includes(passId) ? prev : [...prev, passId]);
    showToast(`${name} requested — awaiting HavaPay confirmation · ${result.data.reference}`);
  };

  const value: CommerceValue = {
    bag,
    bagCount,
    bagTotal,
    add,
    remove,
    setQuantity,
    clearBag,
    checkingOut,
    checkout,
    lastOrderId,
    collection,
    owns: (productId) => collection.includes(productId),
    notifying,
    isNotifying: (dropId) => notifying.includes(dropId),
    toggleNotify,
    passIds,
    hasPass: (passId) => passIds.includes(passId),
    acquirePass
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceValue {
  const context = React.useContext(CommerceContext);
  if (!context) throw new Error('useCommerce must be used inside CommerceProvider');
  return context;
}