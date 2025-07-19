const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    test('About page should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('Contact page should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000);
    });

    test('Page should have good Core Web Vitals', async ({ page }) => {
        await page.goto('/');
        
        // Measure Largest Contentful Paint (LCP)
        const lcp = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                setTimeout(() => resolve(0), 5000); // Fallback
            });
        });
        
        expect(lcp).toBeLessThan(2500); // Good LCP should be under 2.5s
    });

    test('Images should be optimized', async ({ page }) => {
        await page.goto('/');
        
        const images = await page.locator('img').all();
        
        for (const img of images) {
            const src = await img.getAttribute('src');
            if (src) {
                const response = await page.request.head(src);
                expect(response.status()).toBe(200);
                
                // Check if image has appropriate attributes
                const alt = await img.getAttribute('alt');
                expect(alt).toBeTruthy(); // All images should have alt text
                
                const loading = await img.getAttribute('loading');
                if (loading) {
                    expect(['lazy', 'eager']).toContain(loading);
                }
            }
        }
    });

    test('CSS and JS resources should load efficiently', async ({ page }) => {
        const resourceMetrics = [];
        
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('.css') || url.includes('.js')) {
                resourceMetrics.push({
                    url,
                    status: response.status(),
                    size: parseInt(response.headers()['content-length'] || '0')
                });
            }
        });
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // All CSS/JS resources should load successfully
        resourceMetrics.forEach(resource => {
            expect(resource.status).toBe(200);
        });
        
        // Total CSS should be under reasonable size
        const totalCSSSize = resourceMetrics
            .filter(r => r.url.includes('.css'))
            .reduce((sum, r) => sum + r.size, 0);
        expect(totalCSSSize).toBeLessThan(500 * 1024); // 500KB limit
    });
});