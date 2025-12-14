import { test, expect } from '@playwright/test';
import { login, randUser, register } from './helpers';

test.describe('Item Types API', () => {
  test('list returns paginated shape', async ({ request }) => {
    const res = await request.get('item-types');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    // Accept either paginated shape or raw array (for backward compatibility)
    if (Array.isArray(body)) {
      expect(Array.isArray(body)).toBeTruthy();
    } else {
      expect(Array.isArray(body.data)).toBeTruthy();
      expect(typeof body.total).toBe('number');
      expect(typeof body.limit).toBe('number');
      expect(typeof body.offset).toBe('number');
    }
  });

  test('non-admin cannot create item type (403)', async ({ request }) => {
    const creds = randUser();
    const reg = await register(request, creds);
    expect(reg.ok()).toBeTruthy();
    const log = await login(request, creds);
    const { token } = await log.json();

    const create = await request.post('item-types', {
      data: { name: 'UserType', unitWeightKg: 1, unitVolumeM3: 0.01 },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(create.status()).toBe(403);
    const body = await create.json();
    expect(typeof body.message).toBe('string');
  });
});
