const BASE = `${import.meta.env.REACT_APP_BACKEND_URL}/api`;

export function clientId() {
  let id = localStorage.getItem('hooklink_client_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('hooklink_client_id', id);
  }
  return id;
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your input and try again.');
  }
  return data;
}

export function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
