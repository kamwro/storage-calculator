import { test, expect } from '@playwright/test';
import { authHeader, ensureItemType, login, randUser, register } from './helpers';

test.describe('Containers & Items API', () => {
  test('user can create a container, list own containers (paginated), and CRUD items (if item type available)', async ({
    request,
  }) => {
    // Register & login as a normal user
    const user = randUser();
    expect((await register(request, user)).ok()).toBeTruthy();
    const { token } = await (await login(request, user)).json();

    // Create container
    const createRes = await request.post('containers', {
      data: { name: `Cont ${Date.now()}`, maxWeightKg: 100, maxVolumeM3: 1.0 },
      headers: authHeader(token),
    });
    expect(createRes.ok()).toBeTruthy();
    const container = await createRes.json();
    expect(container).toHaveProperty('id');

    // List containers (paginated shape)
    const listRes = await request.get('containers', { headers: authHeader(token) });
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    if (Array.isArray(listBody)) {
      expect(listBody.find((c: any) => c.id === container.id)).toBeTruthy();
    } else {
      expect(Array.isArray(listBody.data)).toBeTruthy();
      expect(listBody.data.find((c: any) => c.id === container.id)).toBeTruthy();
    }

    // Summary endpoint
    const sumRes = await request.get(`containers/${container.id}/summary`, { headers: authHeader(token) });
    expect(sumRes.ok()).toBeTruthy();
    const summary = await sumRes.json();
    expect(summary.containerId).toBe(container.id);

    // Items CRUD if we can ensure an item type
    const adminToken = null; // We don't require admin here; helper falls back to existing item types
    const ensuredType = await ensureItemType(request, adminToken);
    if (!ensuredType) {
      test.skip(true, 'No item types available and no admin token to create one; skipping items CRUD part');
    }

    // Create item
    const createItemRes = await request.post(`containers/${container.id}/items`, {
      headers: authHeader(token),
      data: { itemTypeId: ensuredType.id, quantity: 2, note: 'e2e' },
    });
    expect(createItemRes.ok()).toBeTruthy();
    const item = await createItemRes.json();
    expect(item).toHaveProperty('id');

    // List items (paginated)
    const itemsList = await request.get(`containers/${container.id}/items`, { headers: authHeader(token) });
    expect(itemsList.ok()).toBeTruthy();
    const itemsBody = await itemsList.json();
    const itemsArr = Array.isArray(itemsBody) ? itemsBody : itemsBody.data;
    expect(itemsArr.find((it: any) => it.id === item.id)).toBeTruthy();

    // Update item quantity
    const upd = await request.patch(`items/${item.id}`, {
      headers: authHeader(token),
      data: { quantity: 3 },
    });
    expect(upd.ok()).toBeTruthy();
    const updBody = await upd.json();
    expect(updBody.quantity).toBe(3);

    // Delete item
    const del = await request.delete(`items/${item.id}`, { headers: authHeader(token) });
    expect(del.ok()).toBeTruthy();
  });
});
