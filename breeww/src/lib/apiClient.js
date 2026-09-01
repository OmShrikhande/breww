const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000/player/api';
    }
    // On Vercel / Production: Use relative /player/api (handled seamlessly by Vercel edge rewrites with zero CORS preflight delay)
    return '/player/api';
  }
  return 'http://localhost:3000/player/api';
};

const BASE_URL = getBaseUrl();

const getToken = () => localStorage.getItem('player_token');

export const apiClient = async (path, { method = 'GET', body, auth = true, headers = {} } = {}) => {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

export const apiBaseUrl = BASE_URL;
