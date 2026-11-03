const { defineConfig } = require('@playwright/test');
const productionConfig = require('./playwright.config');

// Keep prototype verification separate from production game checks. The
// preview uses the same local server, timeouts, reporters, and browser settings,
// but only runs tests against /prototypes/reboot/ in Desktop Chrome.
module.exports = defineConfig({
  ...productionConfig,
  testMatch: '**/reboot-prototype.spec.js',
  testIgnore: [],
  projects: productionConfig.projects.filter(project => project.name === 'Desktop Chrome')
});
