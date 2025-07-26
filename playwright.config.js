// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration for all available options.
 */
module.exports = defineConfig({
    testDir: './tests',
    // Global timeout for each test - increased to handle slow network
    timeout: 120000,
    expect: {
        // Timeout for individual expect assertions
        timeout: 15000
    },
    // Place test artifacts in test-results/artifacts
    outputDir: 'test-results/artifacts',
    reporter: [
        ['list'],
        ['html', { outputFolder: 'test-results/html-report' }],
        ['json', { outputFile: 'test-results/results.json' }]
    ],
    use: {
        // Base URL for relative navigation
        baseURL: 'https://www.arthursenko.com/',
        headless: true,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 15000,
        navigationTimeout: 30000,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Store traces in test-results
        trace: 'retain-on-failure'
    },
    // Configure retry settings
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 2,
    projects: [
        {
            name: 'chromium',
            use: { ...{ browserName: 'chromium' } },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 15'],
                viewport: { width: 390, height: 844 },
            },
        },
        // Performance tests - run separately with specific settings
        {
            name: 'performance',
            testMatch: '**/performance.spec.js',
            use: {
                ...{ browserName: 'chromium' },
                // Disable some features for more consistent performance testing
                video: 'off',
                screenshot: 'off',
            },
        },
        // Security tests - run with specific settings
        {
            name: 'security',
            testMatch: '**/security.spec.js',
            use: {
                ...{ browserName: 'chromium' },
                // Enable additional security-related features
                ignoreHTTPSErrors: false,
            },
        },
    ],
});
