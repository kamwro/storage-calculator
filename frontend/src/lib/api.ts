import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

const api = axios.create({ baseURL });

// TODO(security): token is held in localStorage, which is readable by any JS on the page.
// Migrating to an httpOnly + Secure + SameSite=Strict cookie (set by the backend on login)
// would eliminate this XSS risk, but requires paired CSRF protection (e.g. double-submit
// cookie or synchronizer token) because browsers automatically attach cookies cross-origin.
let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

api.interceptors.request.use((config) => {
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      setToken(null);
      try {
        localStorage.removeItem('token');
      } catch {}
    }
    const normalized = new Error(error?.response?.data?.message || error.message || 'Request failed');
    (normalized as any).code = error?.response?.data?.code || 'HTTP_ERROR';
    (normalized as any).status = status;
    (normalized as any).raw = error;
    throw normalized;
  },
);

export default api;
