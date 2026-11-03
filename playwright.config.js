const { defineConfig, devices } = require('@playwright/test');

const fullBrowserMatrix = process.env.FULL_BROWSER_MATRIX === '1';
const desktopChrome = { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } };
const desktopFirefox = { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } };
const mobileSafari = { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } };
const mobileChrome = { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } };

// Default: run every regression on Desktop Chrome, with a small touch-critical
// compatibility suite on mobile. The full matrix is for deliberate sweeps.
if (!fullBrowserMatrix) {
  mobileSafari.testMatch = '**/mobile-smoke.spec.js';
  mobileChrome.testMatch = '**/mobile-smoke.spec.js';
}

module.exports = defineConfig({
  testDir: './tests',
  // The Phaser reboot test is for an isolated, non-production prototype. Keep
  // production CI focused on the playable classic-JS game until that experiment
  // is explicitly approved for a separate test workflow.
  testIgnore: ['**/reboot-prototype.spec.js'],
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  webServer: {
    command: 'npx http-server . -p 4173 -c-1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  },
  projects: fullBrowserMatrix ? [
    desktopChrome,
    desktopFirefox,
    mobileSafari,
    mobileChrome
  ] : [
    desktopChrome,
    mobileSafari,
    mobileChrome
  ]
});
