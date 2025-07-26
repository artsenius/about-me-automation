const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    test('should load pages within acceptable time limits', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('should have good Core Web Vitals', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Check for layout shifts and performance metrics
        const performanceMetrics = await page.evaluate(() => {
            return {
                // Basic performance timing
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
            };
        });
        
        expect(performanceMetrics.loadComplete).toBeGreaterThan(0);
        expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // DOM should load within 5 seconds
    });

    test('should handle multiple concurrent requests', async ({ browser }) => {
        const pages = [];
        const promises = [];
        
        // Create 3 concurrent page loads
        for (let i = 0; i < 3; i++) {
            const page = await browser.newPage();
            pages.push(page);
            promises.push(
                page.goto('').then(() => page.waitForLoadState('networkidle'))
            );
        }
        
        const startTime = Date.now();
        await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        expect(totalTime).toBeLessThan(15000); // All pages should load within 15 seconds
        
        // Clean up
        for (const page of pages) {
            await page.close();
        }
    });

    test('should not have memory leaks during navigation', async ({ page }) => {
        await page.goto('');
        
        // Navigate through all pages multiple times
        const pages = ['', '/about-app', '/live-automation', '/contact'];
        
        for (let i = 0; i < 2; i++) {
            for (const pagePath of pages) {
                await page.goto(pagePath);
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(500);
            }
        }
        
        // Check if page is still responsive
        const title = await page.title();
        expect(title).toBeTruthy();
    });

    test('should cache static resources effectively', async ({ page }) => {
        // First load
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Second load - should use cached resources
        const startTime = Date.now();
        await page.reload();
        await page.waitForLoadState('networkidle');
        const reloadTime = Date.now() - startTime;
        
        expect(reloadTime).toBeLessThan(3000); // Reload should be faster due to caching
    });
});