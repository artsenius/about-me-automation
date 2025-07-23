const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

/**
 * Smoke Tests - Fast basic functionality checks
 * These tests should run quickly to provide immediate feedback
 */
test.describe('Smoke Tests', () => {
    test('should load homepage successfully', async ({ page }) => {
        await page.goto('');
        await expect(page).toHaveTitle(/About Me.*Portfolio/);
        
        // Verify main navigation is present
        const header = new Header(page);
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });

    test('should have working navigation links', async ({ page }) => {
        await page.goto('');
        const header = new Header(page);
        
        // Quick check that all nav links are present and functional
        expect(await header.verifyAllLinksPresent()).toBeTruthy();
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('');
        
        const header = new Header(page);
        
        // On mobile, hamburger menu should be visible
        if (await header.isHamburgerMenuVisible()) {
            expect(await header.verifyMobileNavigation()).toBeTruthy();
        }
    });

    test('should load without JavaScript errors', async ({ page }) => {
        const jsErrors = [];
        page.on('pageerror', exception => {
            jsErrors.push(exception.message);
        });

        await page.goto('');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        
        // Check for JavaScript errors
        expect(jsErrors).toHaveLength(0);
    });

    test('should have acceptable page load performance', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });
});