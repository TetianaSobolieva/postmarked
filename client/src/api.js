const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // порожнє тіло, нічого страшного
  }

  if (!res.ok) {
    throw new ApiError(data?.error || 'Сервер не відповів як слід', res.status, data);
  }
  return data;
}

export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  listLetters: () => request('/letters'),
  getLetter: (id) => request(`/letters/${id}`),
  createLetter: (letter) => request('/letters', { method: 'POST', body: letter }),
  deleteLetter: (id) => request(`/letters/${id}`, { method: 'DELETE' }),
};