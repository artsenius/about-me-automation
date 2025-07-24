const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

test.describe('Performance Tests', () => {
    test('should load main page within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Page should load within 5 seconds
    });

    test('should have reasonable page size and resource count', async ({ page }) => {
        const responses = [];
        page.on('response', response => responses.push(response));
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Check that we're not loading too many resources
        expect(responses.length).toBeLessThan(50); // Reasonable resource count
        
        // Check for proper caching headers on static resources
        const staticResources = responses.filter(r => 
            r.url().match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$/));
        
        for (const resource of staticResources) {
            const cacheControl = resource.headers()['cache-control'];
            // Static resources should have some caching
            if (cacheControl) {
                expect(cacheControl).toMatch(/(max-age|public|private)/);
            }
        }
    });

    test.skip('should not have JavaScript errors', async ({ page }) => {
        const header = new Header(page);
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Navigate through different pages to check for JS errors
        await header.navigateToAboutApp();
        
        await header.navigateToContact();
        
        await header.navigateToLiveAutomation();
        
        // Filter out non-critical console errors (like network errors for external resources)
        const criticalErrors = consoleErrors.filter(error => 
            !error.includes('net::') && 
            !error.includes('favicon') &&
            !error.includes('404')
        );
        
        expect(criticalErrors).toHaveLength(0);
    });

    test('should have proper meta tags for SEO', async ({ page }) => {
        await page.goto('');
        
        // Check for essential meta tags
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        expect(description).toBeTruthy();
        expect(description?.length).toBeGreaterThan(50);
        
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toContain('width=device-width');
        
        // Check for Open Graph tags
        const ogTitle = await page.locator('meta[property="og:title"]').count();
        const ogDescription = await page.locator('meta[property="og:description"]').count();
        
        // These are optional but good for social sharing
        if (ogTitle > 0) {
            const ogTitleContent = await page.locator('meta[property="og:title"]').getAttribute('content');
            expect(ogTitleContent?.length).toBeGreaterThan(0);
        }
    });

    test('should load critical resources successfully', async ({ page }) => {
        const failedRequests = [];
        page.on('requestfailed', request => failedRequests.push(request.url()));
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Filter out non-critical failed requests (like analytics, ads, etc.)
        const criticalFailedRequests = failedRequests.filter(url => 
            !url.includes('google-analytics') &&
            !url.includes('googletagmanager') &&
            !url.includes('facebook') &&
            !url.includes('twitter') &&
            !url.includes('linkedin') &&
            !url.includes('ads')
        );
        
        expect(criticalFailedRequests).toHaveLength(0);
    });

    test('should be responsive and work on different viewport sizes', async ({ page }) => {
        const viewports = [
            { width: 1920, height: 1080 }, // Desktop
            { width: 1024, height: 768 },  // Tablet
            { width: 375, height: 667 }    // Mobile
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Check that main content is visible
            const mainContent = await page.locator('main, .main, #main, body > div').first();
            await expect(mainContent).toBeVisible();
            
            // Check that navigation is accessible (might be hamburger menu on mobile)
            const nav = await page.locator('nav, .nav, header nav, .navigation').first();
            if (await nav.count() > 0) {
                await expect(nav).toBeVisible();
            }
        }
    });

    test('should handle slow network conditions gracefully', async ({ page, context }) => {
        // Simulate slow 3G network
        await context.route('**/*', route => {
            setTimeout(() => route.continue(), 100); // Add 100ms delay to all requests
        });
        
        const startTime = Date.now();
        await page.goto('');
        await page.waitForLoadState('domcontentloaded');
        
        const loadTime = Date.now() - startTime;
        
        // Even with slow network, basic content should load within reasonable time
        expect(loadTime).toBeLessThan(10000); // 10 seconds max for slow network
        
        // Check that loading states are handled properly (no broken layout)
        const bodyContent = await page.textContent('body');
        expect(bodyContent?.length).toBeGreaterThan(100);
    });
});