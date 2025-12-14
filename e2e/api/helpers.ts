import { APIRequestContext, expect } from '@playwright/test';

export type Credentials = { username: string; password: string };

export async function register(request: APIRequestContext, creds: Credentials) {
  const res = await request.post('api/auth/register', { data: creds });
  return res;
}

export async function login(request: APIRequestContext, creds: Credentials) {
  const res = await request.post('api/auth/login', { data: creds });
  return res;
}

export function authHeader(token: string | undefined) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function randUser(): Credentials {
  const rnd = Math.random().toString(36).slice(2);
  return { username: `user_${rnd}@example.com`, password: 'test1234' };
}

export async function getMe(request: APIRequestContext, token: string) {
  const res = await request.get('api/auth/me', { headers: authHeader(token) });
  return res;
}

export async function tryAdminLogin(request: APIRequestContext): Promise<string | null> {
  const admin = { username: 'admin@example.com', password: 'admin1234' };
  const res = await login(request, admin);
  if (res.ok()) {
    const body = await res.json();
    return body.token as string;
  }
  return null;
}

export async function ensureItemType(request: APIRequestContext, adminToken: string | null) {
  // Try to list existing item types first
  const list = await request.get('api/item-types');
  expect(list.ok()).toBeTruthy();
  const payload = await list.json();
  const items = Array.isArray(payload) ? payload : payload.data;
  if (items?.length) return items[0];
  if (!adminToken) return null;
  // Create one via admin
  const res = await request.post('api/item-types', {
    data: { name: `Type ${Date.now()}`, unitWeightKg: 1, unitVolumeM3: 0.01 },
    headers: authHeader(adminToken),
  });
  if (!res.ok()) return null;
  return await res.json();
}
