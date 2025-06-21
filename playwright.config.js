// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration for all available options.
 */
module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    reporter: [
        ['list'],
        ['json', { outputFile: 'test-results/playwright-report.json' }]
    ],
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 0,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        baseURL: 'https://artsenius.github.io/about',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...{ browserName: 'chromium' } },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 15'],
            },
        },
    ],
});
