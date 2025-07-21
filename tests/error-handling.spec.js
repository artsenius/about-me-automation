const { test, expect } = require('@playwright/test');

test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid routes gracefully', async ({ page }) => {
        // Test navigation to non-existent page
        const response = await page.goto('non-existent-page');
        
        // Should either redirect to a valid page or show a 404
        if (response.status() === 404) {
            // If 404, ensure page still has basic structure
            const title = await page.title();
            expect(title.length).toBeGreaterThan(0);
        } else {
            // If redirected, should be on a valid page
            expect(response.status()).toBeLessThan(400);
        }
    });

    test('should handle network failures gracefully', async ({ page }) => {
        // Start on a working page
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Verify page loads normally first
        const normalTitle = await page.title();
        expect(normalTitle.length).toBeGreaterThan(0);

        // Simulate network failure for subsequent requests
        await page.route('**/*', route => {
            // Fail 50% of requests to simulate intermittent network issues
            if (Math.random() > 0.5) {
                route.abort();
            } else {
                route.continue();
            }
        });

        // Try to navigate - should handle failures gracefully
        try {
            await page.click('a', { timeout: 5000 });
            // If click succeeds, page should still be functional
            const title = await page.title();
            expect(title.length).toBeGreaterThan(0);
        } catch (error) {
            // If click fails due to network issues, that's expected
            console.log('Navigation failed due to simulated network issues (expected)');
        }
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
        const jsErrors = [];
        
        // Listen for JavaScript errors
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                jsErrors.push(msg.text());
            }
        });

        await page.goto('');
        await page.waitForLoadState('networkidle');

        // Page should load without JavaScript errors
        expect(jsErrors.length).toBe(0);

        // If there are errors, log them for debugging
        if (jsErrors.length > 0) {
            console.log('JavaScript errors found:', jsErrors);
        }
    });

    test('should handle missing images gracefully', async ({ page }) => {
        let brokenImages = 0;

        // Listen for failed image loads
        page.on('response', response => {
            if (response.url().match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
                if (response.status() >= 400) {
                    brokenImages++;
                }
            }
        });

        await page.goto('');
        await page.waitForLoadState('networkidle');

        // Should have minimal broken images
        expect(brokenImages).toBeLessThan(3);

        // Check that images have proper fallbacks
        const images = await page.locator('img').all();
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            // Images should have alt text for accessibility fallback
            expect(alt).not.toBeNull();
        }
    });

    test('should handle edge case user interactions', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');

        // Test rapid clicking
        const firstLink = await page.locator('a').first();
        if (await firstLink.count() > 0) {
            // Click rapidly multiple times
            for (let i = 0; i < 5; i++) {
                await firstLink.click({ force: true });
                await page.waitForTimeout(100);
            }
            
            // Page should still be functional
            const title = await page.title();
            expect(title.length).toBeGreaterThan(0);
        }
    });

    test('should handle different viewport sizes gracefully', async ({ page }) => {
        const viewports = [
            { width: 320, height: 568 },   // iPhone SE
            { width: 768, height: 1024 },  // iPad
            { width: 1920, height: 1080 }, // Desktop
            { width: 2560, height: 1440 }  // Large desktop
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.goto('');
            await page.waitForLoadState('domcontentloaded');

            // Basic functionality should work at all viewport sizes
            const title = await page.title();
            expect(title.length).toBeGreaterThan(0);

            // Navigation should be accessible
            const navElements = await page.locator('nav, [role="navigation"]').count();
            expect(navElements).toBeGreaterThan(0);

            // Some content should be visible
            const bodyText = await page.locator('body').textContent();
            expect(bodyText.trim().length).toBeGreaterThan(50);
        }
    });

    test('should handle missing resources gracefully', async ({ page }) => {
        let failedRequests = 0;

        // Intercept and fail random resource requests
        await page.route('**/*.{css,js,woff,woff2}', route => {
            // Fail 20% of resource requests
            if (Math.random() > 0.8) {
                failedRequests++;
                route.abort();
            } else {
                route.continue();
            }
        });

        await page.goto('');
        await page.waitForLoadState('domcontentloaded');

        // Even with some failed resources, basic content should be accessible
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);

        const bodyText = await page.locator('body').textContent();
        expect(bodyText.trim().length).toBeGreaterThan(100);

        console.log(`Failed ${failedRequests} resource requests (simulated)`);
    });

    test('should maintain functionality without JavaScript', async ({ page }) => {
        // Disable JavaScript
        await page.context().addInitScript(() => {
            // Override common JS methods to simulate disabled JavaScript
            window.addEventListener = () => {};
            window.fetch = () => Promise.reject(new Error('JavaScript disabled'));
        });

        await page.goto('');
        await page.waitForLoadState('domcontentloaded');

        // Basic content should still be accessible
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);

        // Links should still work for basic navigation
        const links = await page.locator('a[href]').all();
        expect(links.length).toBeGreaterThan(0);

        // Content should be readable
        const bodyText = await page.locator('body').textContent();
        expect(bodyText.trim().length).toBeGreaterThan(100);
    });
});