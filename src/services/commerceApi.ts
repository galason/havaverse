import { delay } from '../utils/validation';
import {
  commerceUniverses,
  creatorStores,
  drops,
  havaPasses,
  marketProducts } from
'../data/commerce';
import { ordersApi } from './ordersApi';
import { charge } from './havapayLedger';
import type { CheckoutOptions, OrderRecord } from '../types/orders';
import type {
  CommerceUniverse,
  CreatorStore,
  Drop,
  HavaPass,
  MarketProduct } from
'../types/commerce';

/* -------------------------------------------------------------------------- *
 * HavaVerse Market — data service boundary
 * -------------------------------------------------------------------------- *
 * Components never import commerce seed data directly. They call this service,
 * which today resolves from an in-memory store and tomorrow resolves from
 * /api/market/*. Every mutator is async and returns a result, so replacing the
 * implementation requires no change in the UI.
 *
 * Checkout deliberately stops at "order placed". Settlement, the creator
 * revenue allocation and the immutable ledger entry belong to HavaPay on the
 * server — the client only ever sees the resulting order.
 *
 *   GET    /api/market/universes                 listUniverses
 *   GET    /api/market/universes/:id             getUniverse
 *   GET    /api/market/products                  listProducts
 *   GET    /api/market/products/:id              getProduct
 *   GET    /api/market/drops                     listDrops
 *   POST   /api/market/drops/:id/notify          notifyOnDrop
 *   GET    /api/market/passes                    listPasses
 *   GET    /api/market/stores                    listStores
 *   GET    /api/market/stores/:id                getStore
 *   GET    /api/market/collection                listCollection
 *   POST   /api/market/orders                    placeOrder
 * -------------------------------------------------------------------------- */

export type ServiceResult<T> = {ok: true;data: T;} | {ok: false;error: string;};

const ok = <T,>(data: T): ServiceResult<T> => ({ ok: true, data });

export interface OrderLine {
  productId: string;
  quantity: number;
}

export const commerceApi = {
  async listUniverses(): Promise<ServiceResult<CommerceUniverse[]>> {
    await delay(200);
    return ok(commerceUniverses);
  },

  async getUniverse(id: string): Promise<ServiceResult<CommerceUniverse | null>> {
    await delay(160);
    return ok(commerceUniverses.find((u) => u.id === id) ?? null);
  },

  async listProducts(universeId?: string): Promise<ServiceResult<MarketProduct[]>> {
    await delay(240);
    return ok(
      universeId ? marketProducts.filter((p) => p.universeId === universeId) : marketProducts
    );
  },

  async getProduct(id: string): Promise<ServiceResult<MarketProduct | null>> {
    await delay(160);
    return ok(marketProducts.find((p) => p.id === id) ?? null);
  },

  async listDrops(): Promise<ServiceResult<Drop[]>> {
    await delay(200);
    return ok(drops);
  },

  async notifyOnDrop(): Promise<ServiceResult<null>> {
    await delay(300);
    return ok(null);
  },

  async listPasses(universeId?: string): Promise<ServiceResult<HavaPass[]>> {
    await delay(180);
    return ok(universeId ? havaPasses.filter((p) => p.universeId === universeId) : havaPasses);
  },

  async listStores(): Promise<ServiceResult<CreatorStore[]>> {
    await delay(200);
    return ok(creatorStores);
  },

  async getStore(id: string): Promise<ServiceResult<CreatorStore | null>> {
    await delay(160);
    return ok(creatorStores.find((s) => s.id === id) ?? null);
  },

  async listCollection(): Promise<ServiceResult<string[]>> {
    await delay(220);
    return ok(ordersApi.ownedProducts());
  },

  /**
   * POST /api/market/passes/:id/acquire
   * A pass is a purchase like any other — it settles through HavaPay and can
   * fail, so it must never be granted optimistically on the client.
   */
  async acquirePass(passId: string): Promise<ServiceResult<{reference: string;}>> {
    await delay(640);
    const pass = havaPasses.find((p) => p.id === passId);
    if (!pass) return { ok: false, error: 'That pass is no longer available.' };
    const paid = charge({
      kind: 'purchase',
      amount: pass.price,
      label: `HavaPass · ${pass.name}`,
      detail: 'Market',
      prefix: 'HV-PASS',
      to: '/market'
    });
    return paid.ok ? ok({ reference: paid.reference }) : paid;
  },

  /** Delegates to the orders service — the one owner of order records. */
  async placeOrder(lines: OrderLine[], options: CheckoutOptions): Promise<ServiceResult<OrderRecord>> {
    return ordersApi.placeOrder(lines, options);
  }
};