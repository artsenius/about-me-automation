const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    test('should load home page within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        });
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
        
        // Check that main content is visible
        await expect(page.locator('[data-testid="profile-section"]')).toBeVisible();
    });

    test('should have optimized images', async ({ page }) => {
        await page.goto('');
        
        const images = await page.locator('img').all();
        
        for (const img of images) {
            const src = await img.getAttribute('src');
            if (src) {
                // Check that images are not excessively large
                const response = await page.request.get(src);
                const buffer = await response.body();
                const sizeInKB = buffer.length / 1024;
                
                // Profile images should be under 500KB
                if (src.includes('profile') || src.includes('photo')) {
                    expect(sizeInKB).toBeLessThan(500);
                }
                
                // Other images should be under 1MB
                expect(sizeInKB).toBeLessThan(1000);
            }
        }
    });

    test('should have minimal unused CSS and JS', async ({ page }) => {
        await page.goto('');
        
        // Start coverage tracking
        await Promise.all([
            page.coverage.startCSSCoverage(),
            page.coverage.startJSCoverage()
        ]);
        
        // Navigate through key pages to get coverage
        await page.click('[data-testid="nav-link-contact"]');
        await page.waitForLoadState('networkidle');
        
        await page.click('[data-testid="nav-link-about-app"]');
        await page.waitForLoadState('networkidle');
        
        await page.click('[data-testid="nav-link-about"]');
        await page.waitForLoadState('networkidle');
        
        // Stop coverage and analyze
        const [cssCoverage, jsCoverage] = await Promise.all([
            page.coverage.stopCSSCoverage(),
            page.coverage.stopJSCoverage()
        ]);
        
        // Calculate coverage percentages
        let totalCSSBytes = 0;
        let usedCSSBytes = 0;
        
        for (const entry of cssCoverage) {
            totalCSSBytes += entry.text.length;
            for (const range of entry.ranges) {
                usedCSSBytes += range.end - range.start - 1;
            }
        }
        
        const cssUsagePercentage = totalCSSBytes > 0 ? (usedCSSBytes / totalCSSBytes) * 100 : 100;
        
        // CSS usage should be reasonable (at least 30%)
        expect(cssUsagePercentage).toBeGreaterThan(30);
    });

    test('should have fast Core Web Vitals', async ({ page }) => {
        await page.goto('');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        
        // Measure key performance metrics
        const metrics = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const metrics = {};
                    
                    entries.forEach((entry) => {
                        if (entry.entryType === 'largest-contentful-paint') {
                            metrics.lcp = entry.startTime;
                        }
                        if (entry.entryType === 'first-input') {
                            metrics.fid = entry.processingStart - entry.startTime;
                        }
                    });
                    
                    // Get CLS from layout shift entries
                    const layoutShifts = performance.getEntriesByType('layout-shift');
                    let cls = 0;
                    layoutShifts.forEach((shift) => {
                        if (!shift.hadRecentInput) {
                            cls += shift.value;
                        }
                    });
                    metrics.cls = cls;
                    
                    resolve(metrics);
                }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                
                // Fallback timeout
                setTimeout(() => resolve({}), 3000);
            });
        });
        
        // LCP should be under 2.5 seconds
        if (metrics.lcp) {
            expect(metrics.lcp).toBeLessThan(2500);
        }
        
        // CLS should be under 0.1
        if (metrics.cls !== undefined) {
            expect(metrics.cls).toBeLessThan(0.1);
        }
    });

    test('should handle multiple concurrent users', async ({ browser }) => {
        const contexts = [];
        const pages = [];
        
        // Simulate 5 concurrent users
        for (let i = 0; i < 5; i++) {
            const context = await browser.newContext();
            const page = await context.newPage();
            contexts.push(context);
            pages.push(page);
        }
        
        // All users navigate to the site simultaneously
        const navigationPromises = pages.map(page => 
            page.goto('', { waitUntil: 'networkidle' })
        );
        
        const startTime = Date.now();
        await Promise.all(navigationPromises);
        const totalTime = Date.now() - startTime;
        
        // Should handle concurrent load within reasonable time
        expect(totalTime).toBeLessThan(10000);
        
        // Verify all pages loaded correctly
        for (const page of pages) {
            await expect(page.locator('[data-testid="profile-section"]')).toBeVisible();
        }
        
        // Cleanup
        for (const context of contexts) {
            await context.close();
        }
    });
});