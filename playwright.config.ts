import { defineConfig } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const UI_BASE_URL = process.env.UI_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: 0,
  reporter: [['list']],
  projects: [
    {
      name: 'api',
      use: {
        baseURL: API_BASE_URL,
      },
      testDir: 'e2e/api',
      testMatch: /.*\.spec\.ts$/,
    },
    {
      name: 'ui',
      use: {
        baseURL: UI_BASE_URL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      testDir: 'e2e/ui',
      testMatch: /.*\.spec\.ts$/,
    },
  ],
});
