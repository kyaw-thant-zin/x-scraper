const { devices } = require('@playwright/test');

module.exports = {
  projects: [
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: false
      },
    },
    {
      name: 'Desktop Firefox Refresh',
      use: {
        ...devices['Desktop Firefox'],
        headless: false
      },
    },
    {
      name: 'Mobile iPhone',
      use: {
        ...devices['iPhone 6'],
        headless: false,
      },
    },
    {
      name: 'Mobile Android',
      use: {
        ...devices['Pixel 2'],
        headless: false,
      },
    },
    {
      name: 'Desktop Chrome',
      use: 'chromium',
      headless: false,
    },
  ],
}