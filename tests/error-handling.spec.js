const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

let header;

test.describe('Error Handling and Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
        await page.goto('');
        
        // Test navigation with network delay simulation
        await page.route('**/*', route => {
            // Add small delay to simulate slower network
            setTimeout(() => route.continue(), 100);
        });
        
        // Should still be able to navigate
        await header.navigateToAboutApp();
        await expect(page).toHaveURL(/arthursenko\.com/);
    });

    test('should handle invalid navigation attempts', async ({ page }) => {
        await page.goto('');
        
        // Try to navigate to non-existent page
        await page.goto('https://www.arthursenko.com/invalid-page', { waitUntil: 'domcontentloaded' });
        
        // Should handle 404 gracefully or redirect to valid page
        const url = page.url();
        const title = await page.title();
        
        // Either should show 404 page or redirect to home
        expect(url.includes('arthursenko.com')).toBeTruthy();
        expect(title).toBeTruthy();
    });

    test('should handle rapid clicking without breaking', async ({ page }) => {
        await page.goto('');
        
        // Rapidly click navigation items
        const navLink = page.locator('[data-testid="nav-link-about-app"]');
        
        if (await navLink.isVisible()) {
            // Click multiple times rapidly
            for (let i = 0; i < 5; i++) {
                await navLink.click({ force: true });
                await page.waitForTimeout(50); // Very short delay between clicks
            }
            
            // Should not break the page
            await expect(page).toHaveURL(/arthursenko\.com/);
            
            // Navigation should still be functional
            await header.navigateToContact();
            await expect(page).toHaveURL(/arthursenko\.com/);
        }
    });

    test('should handle form submission errors gracefully', async ({ page }) => {
        await page.goto('');
        await header.navigateToContact();
        
        // Look for any contact forms
        const forms = await page.locator('form').count();
        const inputs = await page.locator('input[type="email"], input[type="text"], textarea').count();
        
        if (inputs > 0) {
            const inputElements = await page.locator('input[type="email"], input[type="text"], textarea').all();
            
            // Try submitting form with invalid data
            for (const input of inputElements) {
                const inputType = await input.getAttribute('type');
                
                if (inputType === 'email') {
                    await input.fill('invalid-email');
                } else {
                    await input.fill('');
                }
            }
            
            // Look for submit button and try to submit
            const submitButton = page.locator('button[type="submit"], input[type="submit"]');
            if (await submitButton.count() > 0) {
                await submitButton.first().click();
                
                // Should show validation errors or handle gracefully
                // The page should not crash
                await expect(page).toHaveURL(/arthursenko\.com/);
            }
        }
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
        // Monitor for console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.goto('');
        
        // Navigate through all pages
        await header.navigateToAboutApp();
        await header.navigateToLiveAutomation();
        await header.navigateToContact();
        await header.navigateToAboutMe();
        
        // Should not have critical JavaScript errors
        const criticalErrors = consoleErrors.filter(error => 
            error.toLowerCase().includes('uncaught') || 
            error.toLowerCase().includes('unhandled')
        );
        
        expect(criticalErrors.length).toBe(0);
    });

    test('should handle copy functionality failures gracefully', async ({ page }) => {
        await page.goto('');
        await header.navigateToContact();
        
        // Test copy buttons
        const copyButtons = await page.locator('button').filter({ hasText: /copy/i }).count();
        
        if (copyButtons > 0) {
            const buttons = await page.locator('button').filter({ hasText: /copy/i }).all();
            
            for (const button of buttons) {
                // Click copy button
                await button.click();
                
                // Should handle copy operation gracefully even if clipboard is not available
                // Page should not crash
                await expect(page).toHaveURL(/arthursenko\.com/);
            }
        }
    });

    test('should handle external link failures', async ({ page }) => {
        await page.goto('');
        
        // Check external links (resume, company links, etc.)
        const externalLinks = await page.locator('a[href^="http"]:not([href*="arthursenko.com"])').count();
        
        if (externalLinks > 0) {
            const links = await page.locator('a[href^="http"]:not([href*="arthursenko.com"])').all();
            
            for (const link of links.slice(0, 3)) { // Test first 3 external links
                const href = await link.getAttribute('href');
                const target = await link.getAttribute('target');
                
                // External links should open in new tab/window
                if (href && href.startsWith('http')) {
                    expect(target).toBe('_blank');
                }
            }
        }
    });

    test('should handle missing resources gracefully', async ({ page }) => {
        // Block some resources to simulate loading failures
        await page.route('**/*.{png,jpg,jpeg,gif,svg}', route => {
            // Block some images randomly
            if (Math.random() > 0.7) {
                route.abort();
            } else {
                route.continue();
            }
        });
        
        await page.goto('');
        
        // Page should still be functional even with some missing images
        await expect(header.verifyHeaderVisible()).resolves.toBeTruthy();
        
        // Navigation should still work
        await header.navigateToAboutApp();
        await expect(page).toHaveURL(/arthursenko\.com/);
    });
});
