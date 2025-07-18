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
        actionTimeout: 30000,
        navigationTimeout: 30000,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Store traces in test-results
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                // Add specific Chrome flags for better stability
                launchOptions: {
                    args: [
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                    ]
                }
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 15'],
                viewport: { width: 390, height: 844 },
                // Increase timeouts for mobile testing
                actionTimeout: 45000,
                navigationTimeout: 45000,
                // Skip if WebKit is not properly installed
                launchOptions: {
                    timeout: 30000,
                }
            },
            // Skip Mobile Safari if running in environments where WebKit isn't supported
            testIgnore: process.env.SKIP_WEBKIT === 'true' ? '**/*' : undefined,
        },
        // Add accessibility-focused browser for specific accessibility tests
        {
            name: 'accessibility',
            testMatch: '**/accessibility.spec.js',
            use: {
                ...devices['Desktop Chrome'],
                // Reduce motion for accessibility testing
                forcedColors: 'none',
                reducedMotion: 'reduce',
            },
        },
    ],
    // Configure test retry and parallelization
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
});
