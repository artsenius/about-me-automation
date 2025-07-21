const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    const pages = [
        { path: '', name: 'About Me' },
        { path: 'about-app', name: 'About This App' },
        { path: 'live-automation', name: 'Live Automation' },
        { path: 'contact', name: 'Contact' }
    ];

    pages.forEach(({ path, name }) => {
        test(`should load ${name} page within acceptable time`, async ({ page }) => {
            const startTime = Date.now();
            
            // Navigate to page and wait for network idle
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            
            const loadTime = Date.now() - startTime;
            
            // Page should load within 5 seconds (reasonable for live site)
            expect(loadTime).toBeLessThan(5000);
            console.log(`${name} page loaded in ${loadTime}ms`);
        });

        test(`should have reasonable resource counts on ${name} page`, async ({ page }) => {
            const resourceCounts = {
                images: 0,
                stylesheets: 0,
                scripts: 0,
                fonts: 0
            };

            // Listen to response events to count resources
            page.on('response', response => {
                const url = response.url();
                const contentType = response.headers()['content-type'] || '';
                
                if (contentType.includes('image/')) {
                    resourceCounts.images++;
                } else if (contentType.includes('text/css') || url.includes('.css')) {
                    resourceCounts.stylesheets++;
                } else if (contentType.includes('javascript') || url.includes('.js')) {
                    resourceCounts.scripts++;
                } else if (contentType.includes('font/') || url.match(/\.(woff|woff2|ttf|eot)$/)) {
                    resourceCounts.fonts++;
                }
            });

            await page.goto(path);
            await page.waitForLoadState('networkidle');

            // Reasonable limits for a portfolio site
            expect(resourceCounts.images).toBeLessThan(20);
            expect(resourceCounts.stylesheets).toBeLessThan(10);
            expect(resourceCounts.scripts).toBeLessThan(20);
            expect(resourceCounts.fonts).toBeLessThan(10);

            console.log(`${name} page resources:`, resourceCounts);
        });

        test(`should have reasonable page size on ${name} page`, async ({ page }) => {
            let totalSize = 0;
            const resourceSizes = [];

            page.on('response', async response => {
                try {
                    const buffer = await response.body();
                    const size = buffer.length;
                    totalSize += size;
                    resourceSizes.push({
                        url: response.url(),
                        size: size,
                        type: response.headers()['content-type'] || 'unknown'
                    });
                } catch (error) {
                    // Some responses might not have accessible bodies
                }
            });

            await page.goto(path);
            await page.waitForLoadState('networkidle');

            // Total page size should be reasonable (less than 5MB for a portfolio site)
            expect(totalSize).toBeLessThan(5 * 1024 * 1024);
            console.log(`${name} page total size: ${(totalSize / 1024).toFixed(2)} KB`);
        });

        test(`should render content above the fold quickly on ${name} page`, async ({ page }) => {
            await page.goto(path);
            
            // Wait for DOM content loaded (faster than networkidle)
            await page.waitForLoadState('domcontentloaded');
            
            // Check that main content is visible (basic check)
            const bodyContent = await page.locator('body').textContent();
            expect(bodyContent.length).toBeGreaterThan(100); // Should have meaningful content
            
            // Check for main navigation
            const navExists = await page.locator('nav, [role="navigation"]').count();
            expect(navExists).toBeGreaterThan(0);
        });
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
        // Simulate slow 3G network
        await page.route('**/*', async route => {
            // Add delay to simulate slow network
            await new Promise(resolve => setTimeout(resolve, 100));
            route.continue();
        });

        const startTime = Date.now();
        await page.goto('');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;

        // Should still load within reasonable time even on slow network
        expect(loadTime).toBeLessThan(10000); // 10 seconds max

        // Basic functionality should still work
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });
});