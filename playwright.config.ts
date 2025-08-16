import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx http-server -p 4173 -c-1 .',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
