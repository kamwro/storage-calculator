import { test, expect } from '@playwright/test';
import { authHeader, ensureItemType, login, randUser, register, tryAdminLogin } from './helpers';

test.describe('Calculator API', () => {
  test('evaluate succeeds for owner with feasible single item', async ({ request }) => {
    // Login as user and create a roomy container
    const user = randUser();
    await register(request, user);
    const { token } = await (await login(request, user)).json();
    const contRes = await request.post('containers', {
      headers: authHeader(token),
      data: { name: 'Calc Cont', maxWeightKg: 100, maxVolumeM3: 1.0 },
    });
    expect(contRes.ok()).toBeTruthy();
    const container = await contRes.json();

    // Ensure at least one item type exists
    const adminToken = await tryAdminLogin(request);
    const type = await ensureItemType(request, adminToken);
    test.skip(!type, 'No item type available');

    // Evaluate
    const evalRes = await request.post('calculator/evaluate', {
      headers: authHeader(token),
      data: {
        items: [{ itemTypeId: type.id, quantity: 1 }],
        containers: [container.id],
        strategy: 'best_fit',
      },
    });
    expect(evalRes.ok()).toBeTruthy();
    const body = await evalRes.json();
    expect(typeof body.feasible).toBe('boolean');
    expect(Array.isArray(body.byContainer)).toBeTruthy();
    expect(body.byContainer.find((b: any) => b.containerId === container.id)).toBeTruthy();
  });

  test("non-admin cannot evaluate with another user's container (403)", async ({ request }) => {
    // User A creates container
    const a = randUser();
    await register(request, a);
    const { token: tokenA } = await (await login(request, a)).json();
    const contRes = await request.post('containers', {
      headers: authHeader(tokenA),
      data: { name: 'A-only', maxWeightKg: 50, maxVolumeM3: 0.5 },
    });
    const container = await contRes.json();

    // Ensure an item type exists
    const adminToken = await tryAdminLogin(request);
    const type = await ensureItemType(request, adminToken);
    test.skip(!type, 'No item type available');

    // User B tries to evaluate with A's container
    const b = randUser();
    await register(request, b);
    const { token: tokenB } = await (await login(request, b)).json();
    const evalRes = await request.post('calculator/evaluate', {
      headers: authHeader(tokenB),
      data: {
        items: [{ itemTypeId: type.id, quantity: 1 }],
        containers: [container.id],
        strategy: 'first_fit',
      },
    });
    expect(evalRes.status()).toBe(403);
    const body = await evalRes.json();
    expect(typeof body.message).toBe('string');
  });
});
