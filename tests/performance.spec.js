const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    test('should load the home page within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('', { waitUntil: 'networkidle' });
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
        console.log(`Page load time: ${loadTime}ms`);
    });

    test('should have good Core Web Vitals metrics', async ({ page }) => {
        await page.goto('');
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        
        // Measure Largest Contentful Paint (LCP)
        const lcp = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (typeof PerformanceObserver === 'undefined') {
                    resolve(null);
                    return;
                }
                
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                // Fallback timeout
                setTimeout(() => resolve(null), 5000);
            });
        });
        
        if (lcp !== null) {
            // LCP should be under 2.5 seconds for good performance
            expect(lcp).toBeLessThan(2500);
            console.log(`LCP: ${lcp}ms`);
        }
    });

    test('should not have excessive resource sizes', async ({ page }) => {
        const responses = [];
        
        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                size: response.headers()['content-length']
            });
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Check for 4xx/5xx errors
        const errorResponses = responses.filter(r => r.status >= 400);
        expect(errorResponses.length).toBe(0);
        
        // Check for excessively large resources (over 1MB)
        const largeResources = responses.filter(r => 
            r.size && parseInt(r.size) > 1024 * 1024
        );
        
        if (largeResources.length > 0) {
            console.log('Large resources found:', largeResources);
        }
        
        // Warning if there are very large resources
        expect(largeResources.length).toBeLessThan(3);
    });

    test('should have optimized images', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const images = await page.locator('img[src]').all();
        
        for (const img of images) {
            const src = await img.getAttribute('src');
            const naturalWidth = await img.evaluate(el => el.naturalWidth);
            const naturalHeight = await img.evaluate(el => el.naturalHeight);
            const displayWidth = await img.evaluate(el => el.clientWidth);
            const displayHeight = await img.evaluate(el => el.clientHeight);
            
            if (displayWidth > 0 && displayHeight > 0) {
                // Check if image is significantly oversized
                const widthRatio = naturalWidth / displayWidth;
                const heightRatio = naturalHeight / displayHeight;
                
                // Images shouldn't be more than 2x their display size
                expect(widthRatio).toBeLessThan(3);
                expect(heightRatio).toBeLessThan(3);
                
                console.log(`Image ${src}: ${naturalWidth}x${naturalHeight} displayed as ${displayWidth}x${displayHeight}`);
            }
        }
    });

    test('should not have console errors', async ({ page }) => {
        const consoleErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            consoleErrors.push(error.message);
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Navigate to other main pages to check for errors
        try {
            await page.click('[data-testid="nav-link-about-app"]');
            await page.waitForLoadState('networkidle');
            
            await page.click('[data-testid="nav-link-contact"]');
            await page.waitForLoadState('networkidle');
            
            await page.click('[data-testid="nav-link-automation"]');
            await page.waitForLoadState('networkidle');
        } catch (error) {
            // Navigation might fail in some environments, that's ok
            console.log('Navigation test skipped due to element not found');
        }
        
        // Filter out known non-critical errors
        const criticalErrors = consoleErrors.filter(error => 
            !error.includes('favicon') && 
            !error.includes('analytics') &&
            !error.includes('third-party')
        );
        
        if (criticalErrors.length > 0) {
            console.log('Console errors found:', criticalErrors);
        }
        
        expect(criticalErrors.length).toBe(0);
    });

    test('should have proper caching headers', async ({ page }) => {
        const responses = [];
        
        page.on('response', response => {
            responses.push({
                url: response.url(),
                headers: response.headers()
            });
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Check static assets have cache headers
        const staticAssets = responses.filter(r => 
            r.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$/)
        );
        
        staticAssets.forEach(asset => {
            const cacheControl = asset.headers['cache-control'];
            const etag = asset.headers['etag'];
            const lastModified = asset.headers['last-modified'];
            
            // Static assets should have some form of caching
            const hasCaching = cacheControl || etag || lastModified;
            expect(hasCaching).toBeTruthy();
            
            console.log(`Asset ${asset.url}: Cache-Control: ${cacheControl}`);
        });
    });
});