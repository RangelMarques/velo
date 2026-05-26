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
/** No CI, serve o bundle de preview localmente (mesmas env do Vercel Preview) em vez do URL do deploy. */
const serveLocalPreviewInCI = isCI && process.env.E2E_SERVE_LOCAL === 'true';
const baseURL = (
  serveLocalPreviewInCI
    ? 'http://127.0.0.1:4173'
    : (process.env.BASE_URL ?? 'http://localhost:5173')
).replace(/\/$/, '');
const isRemoteTarget = !serveLocalPreviewInCI && !/localhost|127\.0\.0\.1/.test(baseURL);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  // Tempo máximo para cada teste completo (3o segundo é o padrão)
  timeout: isCI ? 90_000 : 60_000,

  // Tempo máximo para assertions (toBeVisible(), toHaveText())
  expect: {
    timeout: isCI ? 15_000 : 5_000,
  },


  testDir: './playwright/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
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

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    actionTimeout: isCI ? 15_000 : 5_000,
    navigationTimeout: isCI ? 30_000 : 10_000,
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

  /* Local: dev server. CI: preview do build (env preview) — evita Vercel Protection / cold start. */
  ...(serveLocalPreviewInCI
    ? {
        webServer: {
          command: 'yarn preview --host 127.0.0.1 --port 4173',
          url: 'http://127.0.0.1:4173',
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }
    : !isCI && !isRemoteTarget
      ? {
          webServer: {
            command: 'yarn dev',
            url: 'http://localhost:5173',
            reuseExistingServer: true,
          },
        }
      : {}),
});
