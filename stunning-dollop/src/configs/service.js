const BASE_URL = '';

const authHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(method, endpoint, { body, headers = {}, auth = true } = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  let result;
  if (contentType.includes('application/json')) {
    result = await response.json();
  } else {
    const text = await response.text();
    result = { message: text || `Request failed (${response.status})` };
  }

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    localStorage.removeItem('admin_user');
  }

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}

const apiService = {
  get: (endpoint, headers = {}) => request('GET', endpoint, { headers }),
  post: (endpoint, data, headers = {}, { auth = true } = {}) =>
    request('POST', endpoint, { body: data, headers, auth }),
  patch: (endpoint, data, headers = {}) => request('PATCH', endpoint, { body: data, headers }),
  delete: (endpoint, headers = {}) => request('DELETE', endpoint, { headers }),
};

export default apiService;
