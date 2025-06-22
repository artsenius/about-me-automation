const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

let header;

test.describe('Header Navigation', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
        // Navigate to the base URL without any path
        await page.goto('');
        // Wait for the page to be fully loaded
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle');
    });

    test('should verify header navigation elements', async ({ page }, testInfo) => {
        const isMobile = testInfo.project.name === 'Mobile Safari';

        if (isMobile) {
            // Wait for the mobile layout to be ready
            await page.waitForLoadState('domcontentloaded');

            // Menu button should be visible on mobile
            expect(await header.isHamburgerMenuVisible()).toBeTruthy();
            // Navigation should work correctly
            expect(await header.verifyMobileNavigation()).toBeTruthy();
        } else {
            expect(await header.verifyHeaderVisible()).toBeTruthy();
            expect(await header.verifyAllLinksPresent()).toBeTruthy();
            // Initial page should show About Me as active
            expect(await header.verifyActiveLink('About Me')).toBeTruthy();
        }
    });

    test('should navigate through all pages', async ({ page }, testInfo) => {
        const isMobile = testInfo.project.name === 'Mobile Safari';

        if (isMobile) {
            // Wait for the mobile layout to be ready
            await page.waitForLoadState('domcontentloaded');
        }

        // Test About This App navigation
        await header.navigateToAboutApp();
        expect(await header.verifyActiveLink('About This App')).toBeTruthy();

        // Test Live Automation navigation
        await header.navigateToLiveAutomation();
        expect(await header.verifyActiveLink('Live Automation')).toBeTruthy();

        // Test Contact navigation
        await header.navigateToContact();
        expect(await header.verifyActiveLink('Contact')).toBeTruthy();

        // Test About Me navigation
        await header.navigateToAboutMe();
        expect(await header.verifyActiveLink('About Me')).toBeTruthy();
    });
});
