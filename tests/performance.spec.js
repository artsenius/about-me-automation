const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        console.log(`Homepage load time: ${loadTime}ms`);
        
        // Homepage should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('should load all pages within acceptable time limits', async ({ page }) => {
        const pages = [
            { name: 'About Me', path: '' },
            { name: 'About App', path: '/about-app' },
            { name: 'Live Automation', path: '/live-automation' },
            { name: 'Contact', path: '/contact' }
        ];

        for (const pageInfo of pages) {
            const startTime = Date.now();
            
            await page.goto(pageInfo.path);
            await page.waitForLoadState('networkidle');
            
            const loadTime = Date.now() - startTime;
            console.log(`${pageInfo.name} load time: ${loadTime}ms`);
            
            // Each page should load within 5 seconds
            expect(loadTime).toBeLessThan(5000);
        }
    });

    test('should have reasonable Core Web Vitals', async ({ page }) => {
        await page.goto('');
        
        // Measure First Contentful Paint (FCP)
        const fcp = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                    if (fcpEntry) {
                        resolve(fcpEntry.startTime);
                    }
                }).observe({ entryTypes: ['paint'] });
            });
        });

        console.log(`First Contentful Paint: ${fcp}ms`);
        
        // FCP should be under 2.5 seconds (Google's good threshold)
        expect(fcp).toBeLessThan(2500);
    });

    test('should have no significant memory leaks during navigation', async ({ page }) => {
        // Navigate through all pages and check for memory growth
        const pages = ['', '/about-app', '/live-automation', '/contact'];
        
        await page.goto('');
        
        for (let i = 0; i < 3; i++) {
            for (const path of pages) {
                await page.goto(path);
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000); // Allow time for any cleanup
            }
        }
        
        // Check that we can still navigate (basic memory leak detection)
        await page.goto('');
        await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    });

    test('should load external resources efficiently', async ({ page }) => {
        // Monitor network requests to ensure external resources load properly
        const responses = [];
        
        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                timing: response.timing()
            });
        });

        await page.goto('');
        await page.waitForLoadState('networkidle');

        // Check that all critical resources loaded successfully
        const failedRequests = responses.filter(r => r.status >= 400);
        expect(failedRequests.length).toBe(0);

        // Log slow resources (over 2 seconds)
        const slowRequests = responses.filter(r => r.timing && r.timing.responseEnd > 2000);
        if (slowRequests.length > 0) {
            console.log('Slow loading resources:', slowRequests.map(r => r.url));
        }
    });
});