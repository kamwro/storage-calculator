import { test, expect, request as pwRequest } from '@playwright/test';
import { getMe, login, randUser, register } from './helpers';

test.describe('Auth API', () => {
  test('register → login → me', async ({ request }) => {
    const creds = randUser();
    const reg = await register(request, creds);
    expect(reg.ok()).toBeTruthy();
    const regBody = await reg.json();
    expect(regBody.token).toBeTruthy();

    const log = await login(request, creds);
    expect(log.ok()).toBeTruthy();
    const { token } = await log.json();
    expect(token).toBeTruthy();

    const meRes = await getMe(request, token);
    expect(meRes.ok()).toBeTruthy();
    const me = await meRes.json();
    expect(me.username).toContain(creds.username);
    expect(['admin', 'user']).toContain(me.role);
  });

  test('invalid login returns 401 with normalized error', async () => {
    const req = await pwRequest.newContext({ baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api' });
    const res = await req.post('/auth/login', { data: { username: 'nope@example.com', password: 'wrong' } });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('message');
    expect(typeof body.message).toBe('string');
  });
});
