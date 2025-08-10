// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration for all available options.
 */
module.exports = defineConfig({
    testDir: './tests',
    // Global timeout for each test
    timeout: 60000,
    expect: {
        // Timeout for individual expect assertions
        timeout: 10000
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
        actionTimeout: 0,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Store traces in test-results
        trace: 'retain-on-failure',
        // Grant clipboard permissions to avoid clipboard API errors (Chromium only)
        permissions: ['clipboard-read', 'clipboard-write']
    },
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                // Override permissions for Chromium specifically
                permissions: ['clipboard-read', 'clipboard-write']
            },
        },
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                viewport: { width: 393, height: 851 },
                // Mobile Chrome might not support all clipboard permissions
                permissions: []
            },
        },
        // Commented out problematic browsers for this environment
        // {
        //     name: 'firefox',
        //     use: { 
        //         ...devices['Desktop Firefox'],
        //         // Firefox doesn't support clipboard-read permission
        //         permissions: []
        //     },
        // },
    ],
});
