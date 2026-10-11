import { httpAuthApi, type AuthApi } from './authApi';
import { mockAuthApi } from './mockAuthBackend';

/**
 * Single switch between the in-browser stand-in and a real identity service.
 *
 * When the HavaVerse identity service is deployed behind /api, flip this to
 * `false` (or drive it from an environment flag). No page or component needs
 * to change: they all talk to `authApi`, never to fetch directly.
 */
const USE_IN_BROWSER_BACKEND = true;

export const authApi: AuthApi = USE_IN_BROWSER_BACKEND ? mockAuthApi : httpAuthApi;

export type { AuthApi };
export { httpAuthApi, mockAuthApi };