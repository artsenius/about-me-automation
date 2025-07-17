// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration for all available options.
 */
module.exports = defineConfig({
    testDir: './tests',
    // Global timeout for each test (increased for slower environments)
    timeout: 90000,
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
        actionTimeout: 30000, // Increased from 0
        navigationTimeout: 30000, // Added explicit navigation timeout
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Store traces in test-results
        trace: 'retain-on-failure'
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
                viewport: { width: 390, height: 844 },
                // Specific settings for webkit in containerized environments
                launchOptions: {
                    args: [
                        '--disable-web-security',
                        '--disable-features=TranslateUI',
                        '--disable-dev-shm-usage',
                        '--no-sandbox'
                    ]
                }
            },
            timeout: 120000, // Longer timeout for mobile tests
        },
    ],
    // Global settings for all projects
    globalTimeout: 600000, // 10 minutes for entire test suite
    workers: process.env.CI ? 1 : 2, // Reduce workers in CI environments
    retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
});
