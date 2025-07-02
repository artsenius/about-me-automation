const { defineConfig, devices } = require('@playwright/test');

/**
 * Enhanced Desktop-Only Playwright Configuration
 * Optimized for comprehensive desktop browser testing
 */
module.exports = defineConfig({
    testDir: './tests',
    
    // Enhanced timeout settings
    timeout: 60000,
    expect: {
        timeout: 15000
    },
    
    // Improved output configuration
    outputDir: 'test-results/desktop-artifacts',
    
    // Enhanced reporting
    reporter: [
        ['list'],
        ['html', { 
            outputFolder: 'test-results/desktop-html-report',
            open: 'never'  // Prevent auto-opening in headless environment
        }],
        ['json', { outputFile: 'test-results/desktop-results.json' }],
        ['junit', { outputFile: 'test-results/desktop-junit.xml' }]
        // ['allure-playwright', { outputFolder: 'test-results/allure-results' }] // Requires npm install allure-playwright
    ],
    
    // Global settings
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    
    use: {
        baseURL: 'https://www.arthursenko.com/',
        
        // Enhanced browser settings
        headless: true,
        actionTimeout: 15000,
        navigationTimeout: 30000,
        
        // Security and network settings
        ignoreHTTPSErrors: true,
        bypassCSP: true,
        
        // Enhanced debugging and reporting
        video: {
            mode: 'retain-on-failure',
            size: { width: 1920, height: 1080 }
        },
        screenshot: {
            mode: 'only-on-failure',
            fullPage: true
        },
        trace: {
            mode: 'retain-on-failure',
            screenshots: true,
            snapshots: true,
            sources: true
        },
        
        // Enhanced context options
        locale: 'en-US',
        timezoneId: 'America/New_York',
        colorScheme: 'light'
    },

    // Comprehensive desktop browser projects
    projects: [
        // Chromium Desktop (Latest)
        {
            name: 'chromium-desktop',
            use: { 
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                deviceScaleFactor: 1,
                permissions: ['clipboard-read', 'clipboard-write']
            },
        },
        
        // Chromium Desktop (Large Screen)
        {
            name: 'chromium-large',
            use: { 
                ...devices['Desktop Chrome'],
                viewport: { width: 2560, height: 1440 },
                deviceScaleFactor: 1,
                permissions: ['clipboard-read', 'clipboard-write']
            },
        },
        
        // Firefox Desktop
        {
            name: 'firefox-desktop',
            use: { 
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 }
            },
        },
        
        // WebKit Desktop (Safari)
        {
            name: 'webkit-desktop',
            use: { 
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 }
            },
        },
        
        // Edge Desktop
        {
            name: 'edge-desktop',
            use: { 
                ...devices['Desktop Edge'],
                viewport: { width: 1920, height: 1080 }
            },
        },
        
        // Accessibility Testing Project
        {
            name: 'accessibility',
            use: { 
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                // Enable screen reader simulation
                extraHTTPHeaders: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Accessibility/Test'
                }
            },
        },
        
        // Performance Testing Project
        {
            name: 'performance',
            use: { 
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                // Enable performance monitoring
                launchOptions: {
                    args: ['--enable-precise-memory-info', '--enable-logging']
                }
            },
        }
    ],

    // Global setup and teardown (optional)
    // globalSetup: require.resolve('./tests/global-setup.js'),
    // globalTeardown: require.resolve('./tests/global-teardown.js'),
    
    // Test configuration
    testMatch: ['**/*.spec.js', '**/*.test.js'],
    testIgnore: ['**/node_modules/**'],
    
    // Web server configuration for local testing
    webServer: process.env.NODE_ENV === 'development' ? {
        command: 'npm run serve',
        port: 3000,
        reuseExistingServer: !process.env.CI,
    } : undefined,
});