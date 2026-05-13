/**
 * Admin panel API tests.
 *
 * User cleanup: tests that create users via randUser() now delete them via
 * DELETE /users/:id (admin-only) in afterAll hooks.  Tests that lack an admin
 * token still rely on in-memory SQLite isolation (see /e2e skill or AGENTS.md).
 */
import { test, expect } from '@playwright/test';
import { authHeader, deleteUser, login, randUser, register, tryAdminLogin } from './helpers';

test.describe('Admin panel — users list', () => {
  test('admin can list all users', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    const res = await request.get('api/users', { headers: authHeader(adminToken!) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const users: unknown[] = Array.isArray(body) ? body : body.data;
    expect(Array.isArray(users)).toBeTruthy();
    users.forEach((u: any) => {
      expect(u).toHaveProperty('id');
      expect(u).toHaveProperty('name');
      expect(u).toHaveProperty('role');
      expect(u).not.toHaveProperty('password');
    });
  });

  test('non-admin receives 403 on GET /users', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    const creds = randUser();
    expect((await register(request, creds)).ok()).toBeTruthy();
    const { token, user } = await (await login(request, creds)).json();

    const res = await request.get('api/users', { headers: authHeader(token) });
    expect(res.status()).toBe(403);

    if (adminToken) await deleteUser(request, adminToken, user.id);
  });

  test('unauthenticated request on GET /users returns 401', async ({ request }) => {
    const res = await request.get('api/users');
    expect(res.status()).toBe(401);
  });
});

test.describe('Admin panel — user containers', () => {
  test('admin can view containers for a specific user', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    const userCreds = randUser();
    expect((await register(request, userCreds)).ok()).toBeTruthy();
    const { token: userToken } = await (await login(request, userCreds)).json();
    const contRes = await request.post('api/containers', {
      headers: authHeader(userToken),
      data: { name: 'Inspect Box', maxWeightKg: 10, maxVolumeM3: 0.1 },
    });
    expect(contRes.ok()).toBeTruthy();

    const usersBody = await (await request.get('api/users', { headers: authHeader(adminToken!) })).json();
    const users: any[] = Array.isArray(usersBody) ? usersBody : usersBody.data;
    const target = users.find((u: any) => u.name === userCreds.username);
    expect(target).toBeTruthy();

    const containersRes = await request.get(`api/users/${target.id}/containers`, {
      headers: authHeader(adminToken!),
    });
    expect(containersRes.status()).toBe(200);
    const containers: any[] = await containersRes.json();
    expect(Array.isArray(containers)).toBeTruthy();
    expect(containers.some((c: any) => c.name === 'Inspect Box')).toBeTruthy();

    // Delete user (cascades containers)
    await deleteUser(request, adminToken!, target.id);
  });

  test('non-admin receives 403 on GET /users/:id/containers', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    const targetCreds = randUser();
    expect((await register(request, targetCreds)).ok()).toBeTruthy();
    const usersBody = await (await request.get('api/users', { headers: authHeader(adminToken!) })).json();
    const users: any[] = Array.isArray(usersBody) ? usersBody : usersBody.data;
    const target = users.find((u: any) => u.name === targetCreds.username);
    expect(target).toBeTruthy();

    const attackerCreds = randUser();
    expect((await register(request, attackerCreds)).ok()).toBeTruthy();
    const { token: attackerToken, user: attacker } = await (await login(request, attackerCreds)).json();

    const res = await request.get(`api/users/${target.id}/containers`, {
      headers: authHeader(attackerToken),
    });
    expect(res.status()).toBe(403);

    // Cleanup both users
    await deleteUser(request, adminToken!, target.id);
    await deleteUser(request, adminToken!, attacker.id);
  });
});

test.describe('Admin panel — delete user', () => {
  test('admin can delete a user and their containers', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    // Create a user with a container
    const creds = randUser();
    expect((await register(request, creds)).ok()).toBeTruthy();
    const { token: userToken } = await (await login(request, creds)).json();
    await request.post('api/containers', {
      headers: authHeader(userToken),
      data: { name: 'To Be Gone', maxWeightKg: 5, maxVolumeM3: 0.05 },
    });

    // Resolve user id
    const usersBody = await (await request.get('api/users', { headers: authHeader(adminToken!) })).json();
    const users: any[] = Array.isArray(usersBody) ? usersBody : usersBody.data;
    const target = users.find((u: any) => u.name === creds.username);
    expect(target).toBeTruthy();

    // Delete user
    const delRes = await deleteUser(request, adminToken!, target.id);
    expect(delRes.status()).toBe(204);

    // User no longer appears in the list
    const afterBody = await (await request.get('api/users', { headers: authHeader(adminToken!) })).json();
    const afterUsers: any[] = Array.isArray(afterBody) ? afterBody : afterBody.data;
    expect(afterUsers.find((u: any) => u.id === target.id)).toBeUndefined();

    // Their containers are also gone
    const containersRes = await request.get(`api/users/${target.id}/containers`, {
      headers: authHeader(adminToken!),
    });
    const containers: any[] = await containersRes.json();
    expect(containers).toHaveLength(0);
  });

  test('admin cannot delete themselves', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    const meRes = await request.get('api/auth/me', { headers: authHeader(adminToken!) });
    const me = await meRes.json();

    const res = await deleteUser(request, adminToken!, me.id);
    expect(res.status()).toBe(403);
  });

  test('non-admin cannot delete a user', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    // Create two regular users
    const targetCreds = randUser();
    expect((await register(request, targetCreds)).ok()).toBeTruthy();
    const attackerCreds = randUser();
    expect((await register(request, attackerCreds)).ok()).toBeTruthy();
    const { token: attackerToken, user: attacker } = await (await login(request, attackerCreds)).json();

    const usersBody = await (await request.get('api/users', { headers: authHeader(adminToken!) })).json();
    const users: any[] = Array.isArray(usersBody) ? usersBody : usersBody.data;
    const target = users.find((u: any) => u.name === targetCreds.username);
    expect(target).toBeTruthy();

    const res = await request.delete(`api/users/${target.id}`, { headers: authHeader(attackerToken) });
    expect(res.status()).toBe(403);

    // Cleanup
    await deleteUser(request, adminToken!, target.id);
    await deleteUser(request, adminToken!, attacker.id);
  });

  test('deleting a non-existent user returns 404', async ({ request }) => {
    const adminToken = await tryAdminLogin(request);
    if (!adminToken) test.skip();

    const res = await request.delete('api/users/00000000-0000-0000-0000-000000000000', {
      headers: authHeader(adminToken!),
    });
    expect(res.status()).toBe(404);
  });
});
