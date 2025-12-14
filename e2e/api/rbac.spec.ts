import { test, expect } from '@playwright/test';
import { authHeader, login, randUser, register } from './helpers';

test.describe('RBAC & ownership', () => {
  test('user cannot access another user\'s container', async ({ request }) => {
    // User A creates a container
    const userA = randUser();
    expect((await register(request, userA)).ok()).toBeTruthy();
    const { token: tokenA } = await (await login(request, userA)).json();
    const contRes = await request.post('/containers', {
      headers: authHeader(tokenA),
      data: { name: 'Secret A', maxWeightKg: 50, maxVolumeM3: 0.5 },
    });
    expect(contRes.ok()).toBeTruthy();
    const container = await contRes.json();

    // User B tries to read it → 403
    const userB = randUser();
    expect((await register(request, userB)).ok()).toBeTruthy();
    const { token: tokenB } = await (await login(request, userB)).json();

    const getRes = await request.get(`/containers/${container.id}` , { headers: authHeader(tokenB) });
    expect(getRes.status()).toBe(403);
    const body = await getRes.json();
    expect(typeof body.message).toBe('string');
  });
});
