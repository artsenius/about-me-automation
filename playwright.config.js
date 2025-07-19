// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration for all available options.
 */
module.exports = defineConfig({
    testDir: './tests',
    // Global timeout for each test
    timeout: 90000, // Increased timeout for rate limiting
    expect: {
        // Timeout for individual expect assertions
        timeout: 15000 // Increased for slower responses
    },
    // Place test artifacts in test-results/artifacts
    outputDir: 'test-results/artifacts',
    // Retry failed tests to handle rate limiting
    retries: process.env.CI ? 3 : 1,
    // Limit workers to reduce rate limiting issues
    workers: process.env.CI ? 1 : 2,
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
        actionTimeout: 30000, // Increased for rate limiting
        navigationTimeout: 60000, // Increased for rate limiting
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Store traces in test-results
        trace: 'retain-on-failure',
        // Add user agent to avoid bot detection
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Add extra HTTP headers
        extraHTTPHeaders: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { ...{ browserName: 'chromium' } },
        },
        {
            name: 'firefox',
            use: { 
                ...devices['Desktop Firefox'],
                // Reduced concurrent tests for Firefox
                viewport: { width: 1280, height: 720 }
            },
        },
        {
            name: 'chromium-tablet',
            use: {
                ...devices['iPad Pro'],
                viewport: { width: 1024, height: 768 },
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 15'],
                viewport: { width: 390, height: 844 },
            },
        },
    ],
    // Global setup for rate limiting handling
    globalSetup: require.resolve('./test-setup/global-setup.js'),
});
