const PRODUCTION_API = 'https://breww-ysqj.onrender.com';

/**
 * Resolve admin API origin at runtime (no trailing slash).
 * - localhost → '' (Vite dev proxy handles /api)
 * - vercel.app / production → Render backend
 * - override with VITE_API_BASE_URL if needed
 */
export function getApiBaseUrl() {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
  }

  return PRODUCTION_API;
}

export default getApiBaseUrl;
