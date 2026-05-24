/**
 * UI E2E tests for /admin page access control.
 *
 * NOTE — user cleanup: randUser() accounts cannot be deleted via the API.
 * Run against in-memory SQLite (see /e2e skill or AGENTS.md) to avoid pollution.
 */
import { APIRequestContext, expect, test } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api';

type Creds = { username: string; password: string };

function randUser(): Creds {
  const rnd = Math.random().toString(36).slice(2, 8);
  return { username: `ui_${rnd}@example.com`, password: 'test1234' };
}

async function registerViaApi(request: APIRequestContext, creds: Creds) {
  return request.post(`${API_BASE_URL}/auth/register`, { data: creds });
}

async function loginViaUi(page: import('@playwright/test').Page, creds: Creds) {
  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(creds.username);
  await page.getByPlaceholder('Password').fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
}

// ---------------------------------------------------------------------------

test('unauthenticated visit to /admin redirects to /login', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});

test('non-admin user visiting /admin is redirected to /dashboard', async ({ page, request }) => {
  const creds = randUser();
  expect((await registerViaApi(request, creds)).ok()).toBeTruthy();

  await loginViaUi(page, creds);
  // Directly navigate to /admin after being on dashboard
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
});

test('non-admin dashboard does not show Admin Panel link', async ({ page, request }) => {
  const creds = randUser();
  expect((await registerViaApi(request, creds)).ok()).toBeTruthy();

  await loginViaUi(page, creds);
  await expect(page.getByRole('link', { name: /Admin Panel/ })).not.toBeVisible();
});

test('admin dashboard shows Admin Panel link that navigates to /admin', async ({ page, request }) => {
  // Requires seeded admin account; skip gracefully if not available
  const loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { username: 'admin@example.com', password: 'admin1234' },
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }

  await loginViaUi(page, { username: 'admin@example.com', password: 'admin1234' });
  const link = page.getByRole('link', { name: /Admin Panel/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 });
});

test('admin can reach /admin page and see Users heading', async ({ page, request }) => {
  const loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { username: 'admin@example.com', password: 'admin1234' },
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }

  await loginViaUi(page, { username: 'admin@example.com', password: 'admin1234' });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to Dashboard/ })).toBeVisible();
});

test('/admin back-to-dashboard link returns to /dashboard', async ({ page, request }) => {
  const loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { username: 'admin@example.com', password: 'admin1234' },
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }

  await loginViaUi(page, { username: 'admin@example.com', password: 'admin1234' });
  await page.goto('/admin');
  await page.getByRole('link', { name: /Back to Dashboard/ }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
});
