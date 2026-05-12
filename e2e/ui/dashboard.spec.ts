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
  await expect(page.getByRole('heading', { name: 'Item Types', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Containers', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Container Detail', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Calculator', exact: true })).toBeVisible();
});

test('unauthenticated visit to /dashboard redirects to /login', async ({ page }) => {
  // Start from a blank context so no token is in localStorage
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/dashboard');
  // Client-side redirect fires after hydration; allow up to 10 s
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});

test('user can favorite and unfavorite a container; state persists after reload', async ({ page, request }) => {
  const creds = randUser();
  expect((await registerViaApi(request, creds)).ok()).toBeTruthy();

  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(creds.username);
  await page.getByPlaceholder('Password').fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  const containerName = `E2E-Fav-${Date.now()}`;
  const containersPanel = page.locator('.border').filter({
    has: page.getByRole('heading', { name: 'Containers', exact: true }),
  });

  // Create a container
  await containersPanel.getByPlaceholder('Container A').fill(containerName);
  await containersPanel.locator('input[type="number"]').first().fill('10');
  await containersPanel.locator('input[type="number"]').last().fill('0.1');
  await containersPanel.getByRole('button', { name: 'Create' }).click();
  await expect(containersPanel.getByText(containerName)).toBeVisible({ timeout: 5_000 });

  const row = containersPanel.getByRole('listitem').filter({ hasText: containerName });

  // Mark as favorite — no confirm dialog, direct click
  await row.getByRole('button', { name: 'Favorite', exact: true }).click();
  await expect(row.getByRole('button', { name: 'Unfavorite', exact: true })).toBeVisible({ timeout: 5_000 });

  // Reload and verify persistence
  await page.reload();
  await expect(containersPanel.getByText(containerName)).toBeVisible({ timeout: 5_000 });
  const reloadedRow = containersPanel.getByRole('listitem').filter({ hasText: containerName });
  await expect(reloadedRow.getByRole('button', { name: 'Unfavorite', exact: true })).toBeVisible({ timeout: 5_000 });

  // Unmark favorite
  await reloadedRow.getByRole('button', { name: 'Unfavorite', exact: true }).click();
  await expect(reloadedRow.getByRole('button', { name: 'Favorite', exact: true })).toBeVisible({ timeout: 5_000 });

  // Cleanup
  page.once('dialog', (dialog) => dialog.accept());
  await reloadedRow.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(containersPanel.getByText(containerName)).not.toBeVisible({ timeout: 5_000 });
});

test('user can create a container and delete it', async ({ page, request }) => {
  const creds = randUser();
  const reg = await registerViaApi(request, creds);
  expect(reg.ok()).toBeTruthy();

  // Log in
  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(creds.username);
  await page.getByPlaceholder('Password').fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  const containerName = `E2E-Delete-${Date.now()}`;

  // Scope to the Containers panel (FormField renders label without `for`, so getByLabel won't work)
  const containersPanel = page.locator('.border').filter({
    has: page.getByRole('heading', { name: 'Containers', exact: true }),
  });

  // Fill and submit the create container form
  await containersPanel.getByPlaceholder('Container A').fill(containerName);
  await containersPanel.locator('input[type="number"]').first().fill('50');
  await containersPanel.locator('input[type="number"]').last().fill('0.5');
  await containersPanel.getByRole('button', { name: 'Create' }).click();

  // Container should appear in the list
  await expect(containersPanel.getByText(containerName)).toBeVisible({ timeout: 5_000 });

  // Click Delete and confirm
  page.once('dialog', (dialog) => dialog.accept());
  await containersPanel
    .getByRole('listitem')
    .filter({ hasText: containerName })
    .getByRole('button', { name: 'Delete', exact: true })
    .click();

  // Container should disappear
  await expect(containersPanel.getByText(containerName)).not.toBeVisible({ timeout: 5_000 });
});
