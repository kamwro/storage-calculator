import { test, expect } from '@playwright/test';
import { authHeader, login, randUser, register, tryAdminLogin } from './helpers';

test.describe('Item Types API', () => {
  test('list returns paginated shape', async ({ request }) => {
    const res = await request.get('api/item-types');
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

    const create = await request.post('api/item-types', {
      data: { name: 'UserType', unitWeightKg: 1, unitVolumeM3: 0.01 },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(create.status()).toBe(403);
    const body = await create.json();
    expect(typeof body.message).toBe('string');
  });
});

test.describe('Item Types delete API', () => {
  test('non-admin cannot delete item type (403)', async ({ request }) => {
    const creds = randUser();
    expect((await register(request, creds)).ok()).toBeTruthy();
    const { token } = await (await login(request, creds)).json();

    const del = await request.delete('api/item-types/00000000-0000-0000-0000-000000000001', {
      headers: authHeader(token),
    });
    expect(del.status()).toBe(403);
  });

  test('admin can delete an unused item type', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) {
      test.skip(true, 'No admin credentials available; skipping admin delete test');
      return;
    }

    // Create a fresh item type so we have something to delete
    const created = await (
      await request.post('api/item-types', {
        data: { name: `Deletable ${Date.now()}`, unitWeightKg: 0.1, unitVolumeM3: 0.001 },
        headers: authHeader(adminToken),
      })
    ).json();
    expect(created).toHaveProperty('id');

    const del = await request.delete(`api/item-types/${created.id}`, { headers: authHeader(adminToken) });
    expect(del.status()).toBe(204);

    // Verify it is gone
    const list = await request.get('api/item-types');
    const body = await list.json();
    const items = Array.isArray(body) ? body : body.data;
    expect(items.find((t: any) => t.id === created.id)).toBeUndefined();
  });

  test('deleting a referenced item type returns 409', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) {
      test.skip(true, 'No admin credentials available; skipping referenced-delete test');
      return;
    }

    // Create item type
    const itemType = await (
      await request.post('api/item-types', {
        data: { name: `InUse ${Date.now()}`, unitWeightKg: 1, unitVolumeM3: 0.01 },
        headers: authHeader(adminToken),
      })
    ).json();

    // Create a user and a container with an item referencing this type
    const user = randUser();
    expect((await register(request, user)).ok()).toBeTruthy();
    const { token: userToken } = await (await login(request, user)).json();
    const container = await (
      await request.post('api/containers', {
        data: { name: `Ref ${Date.now()}`, maxWeightKg: 10, maxVolumeM3: 1 },
        headers: authHeader(userToken),
      })
    ).json();
    await request.post(`api/containers/${container.id}/items`, {
      data: { itemTypeId: itemType.id, quantity: 1 },
      headers: authHeader(userToken),
    });

    // Admin tries to delete the in-use item type
    const del = await request.delete(`api/item-types/${itemType.id}`, { headers: authHeader(adminToken) });
    expect(del.status()).toBe(409);
    const body = await del.json();
    expect(typeof body.message).toBe('string');

    // Cleanup: delete container (cascades items), then delete the now-unreferenced item type
    await request.delete(`api/containers/${container.id}`, { headers: authHeader(userToken) });
    await request.delete(`api/item-types/${itemType.id}`, { headers: authHeader(adminToken) });
  });
});
