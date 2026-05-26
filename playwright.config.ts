import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const isCI = !!process.env.CI;
const baseURL = (process.env.BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const isLocalTarget = /localhost|127\.0\.0\.1/.test(baseURL);
const isRemoteTarget = !isLocalTarget;
/** CI: o workflow sobe `vite preview` antes do Playwright (BASE_URL=127.0.0.1:4173). */
const ciUsesExternalPreview = isCI && baseURL.includes('127.0.0.1:4173');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  timeout: isCI ? 60_000 : 60_000,

  expect: {
    timeout: isCI ? 10_000 : 5_000,
  },


  testDir: './playwright/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    // Optional, enables native HTML upload
    ['html', { outputDir: './playwright-report' }],
    // Mandatory reporter for JSON results
    ['json', { outputFile: './playwright-report/report.json' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,

    trace: isCI ? 'retain-on-failure' : 'on',

    actionTimeout: isCI ? 10_000 : 5_000,
    navigationTimeout: isCI ? 20_000 : 10_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  ...(!isCI && isLocalTarget
    ? {
        webServer: {
          command: 'yarn dev',
          url: 'http://localhost:5173',
          reuseExistingServer: true,
        },
      }
    : {}),
});
