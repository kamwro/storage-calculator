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

// ---------------------------------------------------------------------------

test('login page loads with title and form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Storage Calculator' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('registered user can log in and reach the dashboard', async ({ page, request }) => {
  const creds = randUser();

  // Register via API — works even with SQLite in-memory (no pre-seeded data needed)
  const reg = await registerViaApi(request, creds);
  expect(reg.ok()).toBeTruthy();

  // Log in through the browser UI
  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(creds.username);
  await page.getByPlaceholder('Password').fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();

  // Should land on dashboard showing all four main panels
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Item Types' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Containers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Container Detail' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Calculator' })).toBeVisible();
});

test('unauthenticated visit to /dashboard redirects to /login', async ({ page }) => {
  // Start from a blank context so no token is in localStorage
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/dashboard');
  // Client-side redirect fires after hydration; allow up to 10 s
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});
