/**
 * Admin API origin (no trailing slash).
 * - Local dev: empty string → Vite proxies /api to localhost:3000
 * - Production: Render backend (override with VITE_API_BASE_URL in Vercel if needed)
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? '' : 'https://breww-ysqj.onrender.com')
).replace(/\/$/, '');

export default API_BASE_URL;
