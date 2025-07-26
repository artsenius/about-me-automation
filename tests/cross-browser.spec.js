const { test, expect, devices } = require('@playwright/test');
const { Header } = require('../pages/components/header');
const { AboutPage } = require('../pages/aboutPage');

let header;
let aboutPage;

test.describe('Cross-Browser Compatibility', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
        aboutPage = new AboutPage(page);
        await page.goto('');
    });

    test('should display correctly on desktop browsers', async ({ page }, testInfo) => {
        // This test will run on all configured browsers
        expect(await header.verifyHeaderVisible()).toBeTruthy();
        expect(await aboutPage.isProfileImageVisible()).toBeTruthy();
        
        // Check if navigation works consistently
        await header.navigateToContact();
        const url = await page.url();
        expect(url).toContain('contact');
    });

    test('should handle mobile viewports correctly', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForLoadState('networkidle');
        
        // Mobile-specific checks
        expect(await header.isHamburgerMenuVisible()).toBeTruthy();
        
        // Test mobile navigation
        await header.verifyMobileNavigation();
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForLoadState('networkidle');
        
        // Test touch tap on mobile menu
        if (await header.isHamburgerMenuVisible()) {
            await page.locator('[data-testid="nav-menu-button"]').tap();
            await page.waitForTimeout(500);
        }
    });

    test('should work with different screen resolutions', async ({ page }) => {
        const resolutions = [
            { width: 1920, height: 1080 }, // Full HD
            { width: 1366, height: 768 },  // Common laptop
            { width: 1440, height: 900 },  // MacBook
            { width: 2560, height: 1440 }  // 2K
        ];
        
        for (const resolution of resolutions) {
            await page.setViewportSize(resolution);
            await page.waitForLoadState('networkidle');
            
            expect(await header.verifyHeaderVisible()).toBeTruthy();
            expect(await aboutPage.isProfileImageVisible()).toBeTruthy();
        }
    });

    test('should handle right-to-left languages gracefully', async ({ page }) => {
        // Test RTL layout (even though the site is in English)
        await page.addStyleTag({
            content: 'body { direction: rtl; }'
        });
        
        await page.waitForTimeout(1000);
        
        // Verify layout doesn't break
        expect(await header.verifyHeaderVisible()).toBeTruthy();
        expect(await aboutPage.isProfileImageVisible()).toBeTruthy();
    });

    test('should work with disabled JavaScript features', async ({ page }) => {
        // Test with reduced JavaScript functionality
        await page.addInitScript(() => {
            // Disable some modern JS features to simulate older browsers
            window.IntersectionObserver = undefined;
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Basic functionality should still work
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });
});