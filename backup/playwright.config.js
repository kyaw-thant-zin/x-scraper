const { devices } = require('@playwright/test');

module.exports = {
  projects: [
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: true
      },
    },
    {
      name: 'Desktop Firefox Refresh',
      use: {
        ...devices['Desktop Firefox'],
        headless: true
      },
    },
  ],
}