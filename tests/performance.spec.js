const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

/**
 * Performance Tests - Monitor website speed and resource usage
 */
test.describe('Performance Tests', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        // Track navigation timing
        await page.goto('', { waitUntil: 'networkidle' });
        
        const loadTime = Date.now() - startTime;
        
        // Homepage should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
        
        // Log performance metrics
        const performanceMetrics = await page.evaluate(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
            };
        });
        
        console.log('Performance Metrics:', performanceMetrics);
        
        // First Contentful Paint should be under 2 seconds
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000);
    });

    test('should not have excessive resource usage', async ({ page }) => {
        await page.goto('');
        
        // Check for resource loading
        const resources = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            return {
                totalResources: resources.length,
                imageCount: resources.filter(r => r.initiatorType === 'img').length,
                scriptCount: resources.filter(r => r.initiatorType === 'script').length,
                cssCount: resources.filter(r => r.initiatorType === 'link').length,
                totalSize: resources.reduce((acc, r) => acc + (r.transferSize || 0), 0)
            };
        });
        
        console.log('Resource Usage:', resources);
        
        // Reasonable limits for a personal website
        expect(resources.totalResources).toBeLessThan(50);
        expect(resources.totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB total
    });

    test('should have optimized images', async ({ page }) => {
        await page.goto('');
        
        const images = await page.locator('img').all();
        
        for (const image of images) {
            const src = await image.getAttribute('src');
            if (src && !src.startsWith('data:')) {
                // Check image loading
                const isLoaded = await image.evaluate(img => img.complete && img.naturalHeight !== 0);
                expect(isLoaded).toBeTruthy();
                
                // Check image size (basic check)
                const naturalWidth = await image.evaluate(img => img.naturalWidth);
                const naturalHeight = await image.evaluate(img => img.naturalHeight);
                
                // Images shouldn't be excessively large
                expect(naturalWidth).toBeLessThan(2000);
                expect(naturalHeight).toBeLessThan(2000);
            }
        }
    });

    test('should handle concurrent users simulation', async ({ browser }) => {
        const contexts = [];
        const pages = [];
        
        try {
            // Simulate 3 concurrent users
            for (let i = 0; i < 3; i++) {
                const context = await browser.newContext();
                const page = await context.newPage();
                contexts.push(context);
                pages.push(page);
            }
            
            // All users navigate simultaneously
            const navigationPromises = pages.map(page => page.goto(''));
            await Promise.all(navigationPromises);
            
            // Verify all pages loaded successfully
            for (const page of pages) {
                const title = await page.title();
                expect(title).toBeTruthy();
            }
            
        } finally {
            // Cleanup
            for (const context of contexts) {
                await context.close();
            }
        }
    });

    test('should maintain performance on mobile', async ({ page }) => {
        // Simulate slow 3G connection
        await page.route('**/*', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
            await route.continue();
        });
        
        // Set mobile viewport and user agent
        await page.setViewportSize({ width: 375, height: 667 });
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15');
        
        const startTime = Date.now();
        await page.goto('');
        const loadTime = Date.now() - startTime;
        
        // Should still load reasonably fast on mobile
        expect(loadTime).toBeLessThan(5000);
        
        // Test mobile navigation performance
        const header = new Header(page);
        if (await header.isHamburgerMenuVisible()) {
            const menuStartTime = Date.now();
            await header.openHamburgerMenu();
            const menuTime = Date.now() - menuStartTime;
            
            // Menu should open quickly
            expect(menuTime).toBeLessThan(1000);
        }
    });

    test('should cache resources effectively', async ({ page }) => {
        // First visit
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const firstVisitResources = await page.evaluate(() => {
            return performance.getEntriesByType('resource').length;
        });
        
        // Second visit (should use cache)
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const secondVisitResources = await page.evaluate(() => {
            return performance.getEntriesByType('resource').filter(r => r.transferSize > 0).length;
        });
        
        // Fewer resources should be transferred on second visit
        expect(secondVisitResources).toBeLessThanOrEqual(firstVisitResources);
    });

    test('should handle memory usage efficiently', async ({ page }) => {
        await page.goto('');
        
        // Navigate through different pages to test memory usage
        const header = new Header(page);
        
        // Navigate through all pages
        await header.navigateToAboutApp();
        await page.waitForLoadState('networkidle');
        
        await header.navigateToLiveAutomation();
        await page.waitForLoadState('networkidle');
        
        await header.navigateToContact();
        await page.waitForLoadState('networkidle');
        
        await header.navigateToAboutMe();
        await page.waitForLoadState('networkidle');
        
        // Check if page is still responsive
        const title = await page.title();
        expect(title).toBeTruthy();
        
        // Check for memory leaks (basic check)
        const memoryInfo = await page.evaluate(() => {
            if ('memory' in performance) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        });
        
        if (memoryInfo) {
            console.log('Memory Usage:', memoryInfo);
            // Memory usage should be reasonable
            expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB
        }
    });
});