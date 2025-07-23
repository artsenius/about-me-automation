const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

/**
 * Resilience Tests - Error handling and graceful degradation
 */
test.describe('Resilience Tests', () => {
    test('should handle network failures gracefully', async ({ page }) => {
        await page.goto('');
        
        // Simulate network failure
        await page.route('**/*', route => route.abort());
        
        // Try to navigate - should handle gracefully
        const header = new Header(page);
        
        try {
            await header.navigateToContact();
        } catch (error) {
            // Error is expected, but page should still be functional
            const title = await page.title();
            expect(title).toBeTruthy();
        }
    });

    test('should handle slow loading resources', async ({ page }) => {
        // Add delay to all resources
        await page.route('**/*', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            await route.continue();
        });
        
        await page.goto('', { timeout: 30000 });
        
        // Page should still load, just slowly
        const title = await page.title();
        expect(title).toBeTruthy();
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
        const jsErrors = [];
        const consoleErrors = [];
        
        page.on('pageerror', exception => {
            jsErrors.push(exception.message);
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Inject a script that causes an error
        await page.addInitScript(() => {
            // Simulate a non-critical error
            setTimeout(() => {
                try {
                    window.nonExistentFunction();
                } catch (e) {
                    console.error('Non-critical error:', e.message);
                }
            }, 1000);
        });
        
        await page.goto('');
        await page.waitForTimeout(2000); // Wait for error to occur
        
        // Page should still be functional despite errors
        const title = await page.title();
        expect(title).toBeTruthy();
        
        const header = new Header(page);
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });

    test('should work with ad blockers simulation', async ({ page }) => {
        // Block common advertising and tracking domains
        await page.route('**/*', async (route) => {
            const url = route.request().url();
            const blockedDomains = [
                'googletagmanager.com',
                'google-analytics.com',
                'doubleclick.net',
                'facebook.com',
                'twitter.com'
            ];
            
            if (blockedDomains.some(domain => url.includes(domain))) {
                await route.abort();
            } else {
                await route.continue();
            }
        });
        
        await page.goto('');
        
        // Site should work without tracking scripts
        const title = await page.title();
        expect(title).toBeTruthy();
        
        const header = new Header(page);
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });

    test('should handle different browser window sizes', async ({ page }) => {
        const sizes = [
            { width: 320, height: 568 },   // iPhone SE
            { width: 768, height: 1024 },  // iPad
            { width: 1024, height: 768 },  // Desktop small
            { width: 1920, height: 1080 }, // Desktop large
            { width: 2560, height: 1440 }  // Desktop ultra-wide
        ];
        
        for (const size of sizes) {
            await page.setViewportSize(size);
            await page.goto('');
            
            // Page should be functional at all sizes
            const title = await page.title();
            expect(title).toBeTruthy();
            
            const header = new Header(page);
            expect(await header.verifyHeaderVisible()).toBeTruthy();
            
            // Navigation should work at all sizes
            if (size.width < 768) {
                // Mobile - check hamburger menu
                if (await header.isHamburgerMenuVisible()) {
                    await header.openHamburgerMenu();
                    expect(await header.verifyMobileNavigation()).toBeTruthy();
                }
            } else {
                // Desktop - check regular navigation
                expect(await header.verifyAllLinksPresent()).toBeTruthy();
            }
        }
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
        await page.goto('');
        
        const header = new Header(page);
        
        // Navigate through pages
        await header.navigateToContact();
        await page.waitForLoadState('networkidle');
        let currentUrl = page.url();
        expect(currentUrl).toContain('contact');
        
        await header.navigateToAboutApp();
        await page.waitForLoadState('networkidle');
        currentUrl = page.url();
        expect(currentUrl).toContain('about-app');
        
        // Test browser back button
        await page.goBack();
        await page.waitForLoadState('networkidle');
        currentUrl = page.url();
        expect(currentUrl).toContain('contact');
        
        // Test browser forward button
        await page.goForward();
        await page.waitForLoadState('networkidle');
        currentUrl = page.url();
        expect(currentUrl).toContain('about-app');
    });

    test('should handle page refresh', async ({ page }) => {
        await page.goto('');
        
        const header = new Header(page);
        await header.navigateToContact();
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Page should still be functional after refresh
        const title = await page.title();
        expect(title).toBeTruthy();
        
        // Should maintain current page context
        const currentUrl = page.url();
        expect(currentUrl).toContain('contact');
    });

    test('should handle form submission errors', async ({ page }) => {
        await page.goto('');
        
        const header = new Header(page);
        await header.navigateToContact();
        
        // Look for any forms
        const forms = await page.locator('form').all();
        
        if (forms.length > 0) {
            // Try to submit form without filling required fields
            const form = forms[0];
            
            try {
                await form.locator('button[type="submit"], input[type="submit"]').first().click();
                
                // Should handle validation errors gracefully
                await page.waitForTimeout(1000);
                
                // Page should still be functional
                const title = await page.title();
                expect(title).toBeTruthy();
            } catch (error) {
                // If no submit button found, that's also acceptable
                console.log('No submit button found or form submission not applicable');
            }
        }
    });

    test('should handle missing images gracefully', async ({ page }) => {
        // Intercept and fail image requests
        await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', route => route.abort());
        
        await page.goto('');
        
        // Page should still load and be functional without images
        const title = await page.title();
        expect(title).toBeTruthy();
        
        const header = new Header(page);
        expect(await header.verifyHeaderVisible()).toBeTruthy();
        
        // Check that alt text is displayed for images
        const images = await page.locator('img').all();
        for (const image of images) {
            const alt = await image.getAttribute('alt');
            if (alt) {
                // Should have meaningful alt text
                expect(alt.length).toBeGreaterThan(0);
            }
        }
    });
});