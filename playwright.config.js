// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration for all available options.
 */
module.exports = defineConfig({
    testDir: './tests',
    // Global timeout for each test (reduced for faster feedback)
    timeout: 45000,
    expect: {
        // Timeout for individual expect assertions
        timeout: 15000
    },
    // Configure retries for CI/CD stability
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    
    // Place test artifacts in test-results/artifacts
    outputDir: 'test-results/artifacts',
    reporter: [
        ['list'],
        ['html', { outputFolder: 'test-results/html-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
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
        trace: 'retain-on-failure',
        
        // Add user agent to avoid bot detection
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        
        // Additional settings for stability
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9'
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
                }
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 15'],
                viewport: { width: 390, height: 844 },
            },
        },
        // Add a fast smoke test project
        {
            name: 'smoke',
            testMatch: '**/smoke.spec.js',
            use: { 
                ...devices['Desktop Chrome'],
                actionTimeout: 10000,
                navigationTimeout: 20000
            },
        }
    ],
});
