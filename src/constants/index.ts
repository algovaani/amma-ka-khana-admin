const PRODUCTION_API_ORIGIN = 'https://amma-ka-khana-api.onrender.com';

const localApiBase = 'http://localhost:3000/api/v1';
const localSocket = 'http://localhost:3000';

/** Production builds always use Render. Dev uses localhost (or .env override). */
export const API_BASE_URL = import.meta.env.PROD
  ? `${PRODUCTION_API_ORIGIN}/api/v1`
  : (import.meta.env.VITE_API_BASE_URL ?? localApiBase);

export const SOCKET_URL = import.meta.env.PROD
  ? PRODUCTION_API_ORIGIN
  : (import.meta.env.VITE_SOCKET_URL ?? localSocket);

/** Google Maps — set in apps/admin-panel/.env as VITE_GOOGLE_MAPS_API_KEY */
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
