import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests for the CMS studio.
 *
 * These cover the things only a browser can: drag-and-drop, the inspector
 * updating the canvas as you type, publishing and then viewing the result.
 * Those are also where the bugs were - a block rendering at zero height, a
 * drag handle hidden under a drawer, a select that never refetched.
 *
 * They need a running storefront with Odoo behind it, so they are NOT part of
 * `yarn test`. Run them against a dev server or a deployed instance:
 *
 *   yarn test:e2e
 *   BASE_URL=https://alokai-dev.labs.erpgap.com yarn test:e2e
 */
export default defineConfig({
  testDir: './test/e2e',
  // The studio writes to shared content, so tests must not race each other.
  workers: 1,
  fullyParallel: false,
  // A cold Nuxt dev route can take a while to compile on first hit.
  timeout: 120_000,
  expect: { timeout: 20_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
