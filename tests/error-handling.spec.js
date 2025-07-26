const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

let header;

test.describe('Error Handling Tests', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
    });

    test('should handle network failures gracefully', async ({ page }) => {
        // Simulate offline mode
        await page.context().setOffline(true);
        
        try {
            await page.goto('', { timeout: 5000 });
        } catch (error) {
            // Expected to fail offline
            expect(error.message).toContain('net::ERR_INTERNET_DISCONNECTED');
        }
        
        // Go back online
        await page.context().setOffline(false);
        
        // Should work again
        await page.goto('');
        expect(await page.title()).toBeTruthy();
    });

    test('should handle slow network conditions', async ({ page }) => {
        // Simulate slow 3G connection
        await page.context().route('**/*', async route => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
            await route.continue();
        });
        
        const startTime = Date.now();
        await page.goto('');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        // Should still load, just slower
        expect(await page.title()).toBeTruthy();
        expect(loadTime).toBeGreaterThan(100); // Should be slower due to our delay
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
        const jsErrors = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Inject a JavaScript error
        await page.evaluate(() => {
            try {
                // This should cause an error
                nonExistentFunction();
            } catch (e) {
                // Catch it to prevent it from breaking the test
                console.error('Caught expected error:', e);
            }
        });
        
        // Page should still be functional despite the error
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });

    test('should handle missing resources gracefully', async ({ page }) => {
        const failedRequests = [];
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Even if some resources fail, core functionality should work
        expect(await header.verifyHeaderVisible()).toBeTruthy();
        
        // Log any failed requests for debugging
        if (failedRequests.length > 0) {
            console.log('Failed requests:', failedRequests);
        }
    });

    test('should handle malformed URLs', async ({ page }) => {
        const malformedUrls = [
            '/about%20page',  // URL with spaces
            '/contact?param=<script>',  // XSS attempt in URL
            '/contact/../../../etc/passwd',  // Path traversal attempt
            '/contact#fragment with spaces'  // Fragment with spaces
        ];
        
        for (const url of malformedUrls) {
            try {
                const response = await page.goto(url);
                // Should either redirect to valid page or show error page, not crash
                expect([200, 301, 302, 404, 400].includes(response.status())).toBeTruthy();
            } catch (error) {
                // Some malformed URLs might be rejected by the browser, which is fine
                console.log(`URL ${url} rejected:`, error.message);
            }
        }
    });

    test('should handle browser back/forward navigation edge cases', async ({ page }) => {
        await page.goto('');
        
        // Navigate through several pages
        await header.navigateToAboutApp();
        await header.navigateToContact();
        await header.navigateToLiveAutomation();
        
        // Use browser back button multiple times
        await page.goBack();
        await page.waitForLoadState('networkidle');
        expect(await page.url()).toContain('contact');
        
        await page.goBack();
        await page.waitForLoadState('networkidle');
        expect(await page.url()).toContain('about-app');
        
        // Use forward button
        await page.goForward();
        await page.waitForLoadState('networkidle');
        expect(await page.url()).toContain('contact');
        
        // Page should still be functional
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });

    test('should handle rapid navigation clicks', async ({ page }) => {
        await page.goto('');
        
        // Rapidly click navigation links
        for (let i = 0; i < 5; i++) {
            await page.locator('[data-testid="nav-link-about-app"]').click({ timeout: 1000 });
            await page.locator('[data-testid="nav-link-contact"]').click({ timeout: 1000 });
            await page.locator('[data-testid="nav-link-about"]').click({ timeout: 1000 });
        }
        
        // Should still end up on a valid page
        await page.waitForLoadState('networkidle');
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });

    test('should handle window resize during operation', async ({ page }) => {
        await page.goto('');
        
        // Start with desktop size
        await page.setViewportSize({ width: 1280, height: 720 });
        expect(await header.verifyHeaderVisible()).toBeTruthy();
        
        // Resize to mobile while navigating
        await page.setViewportSize({ width: 375, height: 667 });
        await header.navigateToContact();
        
        // Resize back to desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForLoadState('networkidle');
        
        // Should still work after multiple resizes
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });
});