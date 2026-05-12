import { test, expect } from '@playwright/test';
import { authHeader, ensureItemType, login, randUser, register, tryAdminLogin } from './helpers';

test.describe('Containers & Items API', () => {
  test('user can create a container, list own containers (paginated), and CRUD items (if item type available)', async ({
    request,
  }) => {
    // Register & login as a normal user
    const user = randUser();
    expect((await register(request, user)).ok()).toBeTruthy();
    const { token } = await (await login(request, user)).json();

    // Create container
    const createRes = await request.post('api/containers', {
      data: { name: `Cont ${Date.now()}`, maxWeightKg: 100, maxVolumeM3: 1.0 },
      headers: authHeader(token),
    });
    expect(createRes.ok()).toBeTruthy();
    const container = await createRes.json();
    expect(container).toHaveProperty('id');

    // List containers (paginated shape)
    const listRes = await request.get('api/containers', { headers: authHeader(token) });
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    if (Array.isArray(listBody)) {
      expect(listBody.find((c: any) => c.id === container.id)).toBeTruthy();
    } else {
      expect(Array.isArray(listBody.data)).toBeTruthy();
      expect(listBody.data.find((c: any) => c.id === container.id)).toBeTruthy();
    }

    // Summary endpoint
    const sumRes = await request.get(`api/containers/${container.id}/summary`, { headers: authHeader(token) });
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
    const createItemRes = await request.post(`api/containers/${container.id}/items`, {
      headers: authHeader(token),
      data: { itemTypeId: ensuredType.id, quantity: 2, note: 'e2e' },
    });
    expect(createItemRes.ok()).toBeTruthy();
    const item = await createItemRes.json();
    expect(item).toHaveProperty('id');

    // List items (paginated)
    const itemsList = await request.get(`api/containers/${container.id}/items`, { headers: authHeader(token) });
    expect(itemsList.ok()).toBeTruthy();
    const itemsBody = await itemsList.json();
    const itemsArr = Array.isArray(itemsBody) ? itemsBody : itemsBody.data;
    expect(itemsArr.find((it: any) => it.id === item.id)).toBeTruthy();

    // Update item quantity
    const upd = await request.patch(`api/items/${item.id}`, {
      headers: authHeader(token),
      data: { quantity: 3 },
    });
    expect(upd.ok()).toBeTruthy();
    const updBody = await upd.json();
    expect(updBody.quantity).toBe(3);

    // Delete item
    const del = await request.delete(`api/items/${item.id}`, { headers: authHeader(token) });
    expect(del.ok()).toBeTruthy();

    // Cleanup: delete the container (cascades any remaining items)
    await request.delete(`api/containers/${container.id}`, { headers: authHeader(token) });
  });
});

test.describe('Container delete authorization', () => {
  test('user can delete their own container', async ({ request }) => {
    const user = randUser();
    expect((await register(request, user)).ok()).toBeTruthy();
    const { token } = await (await login(request, user)).json();

    const created = await (
      await request.post('api/containers', {
        data: { name: `ToDelete ${Date.now()}`, maxWeightKg: 10, maxVolumeM3: 0.1 },
        headers: authHeader(token),
      })
    ).json();

    const del = await request.delete(`api/containers/${created.id}`, { headers: authHeader(token) });
    expect(del.ok()).toBeTruthy();

    // Verify it no longer appears in the list
    const list = await request.get('api/containers', { headers: authHeader(token) });
    const body = await list.json();
    const items = Array.isArray(body) ? body : body.data;
    expect(items.find((c: any) => c.id === created.id)).toBeUndefined();
  });

  test("user cannot delete another user's container (403)", async ({ request }) => {
    const owner = randUser();
    const other = randUser();
    expect((await register(request, owner)).ok()).toBeTruthy();
    expect((await register(request, other)).ok()).toBeTruthy();
    const { token: ownerToken } = await (await login(request, owner)).json();
    const { token: otherToken } = await (await login(request, other)).json();

    const created = await (
      await request.post('api/containers', {
        data: { name: `OtherCont ${Date.now()}`, maxWeightKg: 10, maxVolumeM3: 0.1 },
        headers: authHeader(ownerToken),
      })
    ).json();

    const del = await request.delete(`api/containers/${created.id}`, { headers: authHeader(otherToken) });
    expect(del.status()).toBe(403);

    // Cleanup: owner deletes the container
    await request.delete(`api/containers/${created.id}`, { headers: authHeader(ownerToken) });
  });
});

test.describe('Container favorite state', () => {
  test('owner can mark and unmark isFavorite; list reflects the change', async ({ request }) => {
    const user = randUser();
    expect((await register(request, user)).ok()).toBeTruthy();
    const { token } = await (await login(request, user)).json();

    const createRes = await request.post('api/containers', {
      data: { name: `Fav-${Date.now()}`, maxWeightKg: 10, maxVolumeM3: 0.1 },
      headers: authHeader(token),
    });
    expect(createRes.ok()).toBeTruthy();
    const container = await createRes.json();
    expect(container.isFavorite).toBe(false);

    // Mark as favorite
    const patch1 = await request.patch(`api/containers/${container.id}`, {
      data: { isFavorite: true },
      headers: authHeader(token),
    });
    expect(patch1.ok()).toBeTruthy();
    expect((await patch1.json()).isFavorite).toBe(true);

    // List should reflect the change
    const listRes = await request.get('api/containers', { headers: authHeader(token) });
    const listBody = await listRes.json();
    const items = Array.isArray(listBody) ? listBody : listBody.data;
    const found = items.find((c: any) => c.id === container.id);
    expect(found).toBeDefined();
    expect(found.isFavorite).toBe(true);

    // Unmark favorite
    const patch2 = await request.patch(`api/containers/${container.id}`, {
      data: { isFavorite: false },
      headers: authHeader(token),
    });
    expect(patch2.ok()).toBeTruthy();
    expect((await patch2.json()).isFavorite).toBe(false);

    // Cleanup
    await request.delete(`api/containers/${container.id}`, { headers: authHeader(token) });
  });

  test("non-owner cannot toggle another user's container favorite (403)", async ({ request }) => {
    const owner = randUser();
    const other = randUser();
    expect((await register(request, owner)).ok()).toBeTruthy();
    expect((await register(request, other)).ok()).toBeTruthy();
    const { token: ownerToken } = await (await login(request, owner)).json();
    const { token: otherToken } = await (await login(request, other)).json();

    const created = await (
      await request.post('api/containers', {
        data: { name: `FavOwner-${Date.now()}`, maxWeightKg: 10, maxVolumeM3: 0.1 },
        headers: authHeader(ownerToken),
      })
    ).json();

    const patch = await request.patch(`api/containers/${created.id}`, {
      data: { isFavorite: true },
      headers: authHeader(otherToken),
    });
    expect(patch.status()).toBe(403);

    // Cleanup
    await request.delete(`api/containers/${created.id}`, { headers: authHeader(ownerToken) });
  });

  test('admin can toggle any container isFavorite', async ({ request }) => {
    const user = randUser();
    expect((await register(request, user)).ok()).toBeTruthy();
    const { token: userToken } = await (await login(request, user)).json();

    const adminToken = await tryAdminLogin(request);
    if (!adminToken) {
      test.skip(true, 'No admin credentials available; skipping admin favorite test');
      return;
    }

    const created = await (
      await request.post('api/containers', {
        data: { name: `FavAdmin-${Date.now()}`, maxWeightKg: 10, maxVolumeM3: 0.1 },
        headers: authHeader(userToken),
      })
    ).json();

    const patch = await request.patch(`api/containers/${created.id}`, {
      data: { isFavorite: true },
      headers: authHeader(adminToken),
    });
    expect(patch.ok()).toBeTruthy();
    expect((await patch.json()).isFavorite).toBe(true);

    // Cleanup
    await request.delete(`api/containers/${created.id}`, { headers: authHeader(userToken) });
  });
});
