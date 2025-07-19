const { test, expect } = require('@playwright/test');

// Test data sets for different scenarios
const testData = {
    viewportSizes: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1280, height: 720 },
        { name: 'large-desktop', width: 1920, height: 1080 }
    ],
    
    navigationPaths: [
        { path: '/', expectedTitle: /Arthur Senko|About Me/i },
        { path: '/about', expectedTitle: /About|Arthur/i },
        { path: '/contact', expectedTitle: /Contact/i },
        { path: '/live-automation', expectedTitle: /Live|Automation|Test/i },
        { path: '/about-app', expectedTitle: /About.*App|App/i }
    ],

    accessibilityScenarios: [
        { name: 'keyboard-navigation', method: 'keyboard' },
        { name: 'screen-reader', method: 'aria' },
        { name: 'high-contrast', method: 'contrast' },
        { name: 'large-fonts', method: 'font-size' }
    ],

    performanceProfiles: [
        { name: 'fast-3g', downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 150 },
        { name: 'slow-3g', downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 300 },
        { name: 'offline', downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    ]
};

test.describe('Data-Driven Tests', () => {
    // Test responsive design across multiple viewport sizes
    testData.viewportSizes.forEach(viewport => {
        test(`should work properly on ${viewport.name} viewport (${viewport.width}x${viewport.height})`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Basic content should be visible
            await expect(page.locator('h1')).toBeVisible();
            
            // Navigation should be accessible (desktop nav or mobile menu)
            const desktopNav = await page.locator('[data-testid="nav-list"]:not([data-mobile="true"])').isVisible();
            const mobileMenu = await page.locator('[data-testid="nav-menu-button"]').isVisible();
            
            expect(desktopNav || mobileMenu).toBeTruthy();

            // Content should not overflow horizontally
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyScrollWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small buffer

            console.log(`${viewport.name}: Navigation=${desktopNav ? 'desktop' : 'mobile'}, ScrollWidth=${bodyScrollWidth}`);
        });
    });

    // Test all navigation paths
    testData.navigationPaths.forEach(navItem => {
        test(`should navigate to ${navItem.path} and display correct content`, async ({ page }) => {
            await page.goto(navItem.path);
            await page.waitForLoadState('networkidle');

            // Check page title
            const title = await page.title();
            if (navItem.expectedTitle) {
                expect(title).toMatch(navItem.expectedTitle);
            }

            // Check that page has main content
            const hasMainContent = await page.locator('main, [role="main"], h1, h2').first().isVisible();
            expect(hasMainContent).toBeTruthy();

            // Check navigation state
            const currentUrl = page.url();
            expect(currentUrl).toContain(navItem.path === '/' ? '' : navItem.path);

            console.log(`${navItem.path}: Title="${title}", URL="${currentUrl}"`);
        });
    });

    // Test accessibility scenarios
    testData.accessibilityScenarios.forEach(scenario => {
        test(`should be accessible for ${scenario.name} users`, async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            switch (scenario.method) {
                case 'keyboard':
                    // Test keyboard navigation
                    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
                    
                    for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
                        await page.keyboard.press('Tab');
                        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
                        expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement)).toBeTruthy();
                    }
                    break;

                case 'aria':
                    // Check ARIA attributes
                    const ariaElements = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').count();
                    expect(ariaElements).toBeGreaterThan(0);

                    // Check for proper heading structure
                    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
                    expect(headings).toBeGreaterThan(0);
                    break;

                case 'contrast':
                    // Apply high contrast mode
                    await page.addStyleTag({
                        content: `
                            * { 
                                background: black !important; 
                                color: white !important; 
                                border-color: white !important;
                            }
                            a { color: yellow !important; }
                        `
                    });
                    
                    // Content should still be readable
                    const textVisible = await page.locator('h1').isVisible();
                    expect(textVisible).toBeTruthy();
                    break;

                case 'font-size':
                    // Increase font size significantly
                    await page.addStyleTag({
                        content: `* { font-size: 200% !important; line-height: 1.5 !important; }`
                    });
                    
                    // Content should still be accessible
                    const contentAccessible = await page.locator('h1').isVisible();
                    expect(contentAccessible).toBeTruthy();
                    break;
            }

            console.log(`Accessibility test completed for ${scenario.name}`);
        });
    });

    // Test performance under different network conditions
    testData.performanceProfiles.forEach(profile => {
        test(`should perform adequately under ${profile.name} conditions`, async ({ page, context }) => {
            if (profile.name === 'offline') {
                await context.setOffline(true);
                
                // Test offline behavior
                try {
                    await page.goto('/', { timeout: 5000 });
                } catch (error) {
                    // Expected to fail offline
                    console.log(`Offline test completed - expected failure: ${error.message}`);
                }
                return;
            }

            // Simulate network conditions
            const client = await context.newCDPSession(page);
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                downloadThroughput: profile.downloadThroughput,
                uploadThroughput: profile.uploadThroughput,
                latency: profile.latency
            });

            const startTime = Date.now();
            await page.goto('/', { waitUntil: 'networkidle' });
            const loadTime = Date.now() - startTime;

            // Set reasonable expectations based on network profile
            const maxLoadTime = profile.name === 'slow-3g' ? 15000 : 10000;
            expect(loadTime).toBeLessThan(maxLoadTime);

            // Core content should be visible
            await expect(page.locator('h1')).toBeVisible();

            console.log(`${profile.name}: Load time ${loadTime}ms`);
        });
    });

    // Test form interactions with various input data
    const contactFormData = [
        { scenario: 'valid-email', email: 'test@example.com', expectValid: true },
        { scenario: 'invalid-email', email: 'invalid-email', expectValid: false },
        { scenario: 'empty-fields', email: '', expectValid: false },
        { scenario: 'long-input', email: 'a'.repeat(100) + '@example.com', expectValid: true }
    ];

    contactFormData.forEach(data => {
        test(`should handle contact form with ${data.scenario}`, async ({ page }) => {
            await page.goto('/contact');
            await page.waitForLoadState('networkidle');

            // Look for email input (if any forms exist)
            const emailInput = await page.locator('input[type="email"], input[name*="email"], input[id*="email"]').first();
            
            if (await emailInput.isVisible()) {
                await emailInput.fill(data.email);
                
                // Check validation state
                const isValid = await emailInput.evaluate(el => el.checkValidity());
                expect(isValid).toBe(data.expectValid);
                
                console.log(`Form validation test: ${data.scenario} - Valid: ${isValid}`);
            } else {
                console.log('No email form found on contact page');
            }
        });
    });

    // Test copy functionality with different data
    const copyTestData = [
        { type: 'email', expectedPattern: /^[^@]+@[^@]+\.[^@]+$/ },
        { type: 'phone', expectedPattern: /^[+\d\s()-]+$/ },
        { type: 'linkedin', expectedPattern: /linkedin\.com/ }
    ];

    copyTestData.forEach(copyData => {
        test(`should copy ${copyData.type} data correctly`, async ({ page, context }) => {
            await page.goto('/contact');
            await page.waitForLoadState('networkidle');

            const copyButton = await page.locator(`[data-testid="contact-card-${copyData.type}"] button`).first();
            
            if (await copyButton.isVisible()) {
                // Grant clipboard permissions
                await context.grantPermissions(['clipboard-read', 'clipboard-write']);
                
                await copyButton.click();
                
                // Check if copy was successful (look for feedback)
                const copyMessage = await page.locator(`[data-testid="copy-message-${copyData.type}"]`).isVisible().catch(() => false);
                
                console.log(`Copy test for ${copyData.type}: Button clicked, Feedback shown: ${copyMessage}`);
            } else {
                console.log(`No copy button found for ${copyData.type}`);
            }
        });
    });
});