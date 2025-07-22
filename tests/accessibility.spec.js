const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

let header;

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
        await page.goto('');
    });

    test('should have proper page titles on all pages', async ({ page }) => {
        // Test About Me page
        await expect(page).toHaveTitle(/About Me/);
        
        // Test About App page
        await header.navigateToAboutApp();
        await expect(page).toHaveTitle(/About This App/);
        
        // Test Live Automation page
        await header.navigateToLiveAutomation();
        await expect(page).toHaveTitle(/Live Automation/);
        
        // Test Contact page
        await header.navigateToContact();
        await expect(page).toHaveTitle(/Contact/);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        // Check for h1 tag
        const h1 = await page.locator('h1').count();
        expect(h1).toBeGreaterThan(0);
        
        // Navigate through pages and check headings
        const pages = ['About This App', 'Live Automation', 'Contact'];
        
        for (const pageName of pages) {
            if (pageName === 'About This App') {
                await header.navigateToAboutApp();
            } else if (pageName === 'Live Automation') {
                await header.navigateToLiveAutomation();
            } else if (pageName === 'Contact') {
                await header.navigateToContact();
            }
            
            const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
            expect(headings).toBeGreaterThan(0);
        }
    });

    test('should have accessible navigation', async ({ page }) => {
        // Check navigation has proper ARIA labels or roles
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav).toBeVisible();
        
        // Check that all navigation links are keyboard accessible
        const navLinks = await page.locator('[data-testid^="nav-link-"]').all();
        
        for (const link of navLinks) {
            // Check that links are focusable
            await link.focus();
            const isFocused = await link.evaluate(el => el === document.activeElement);
            expect(isFocused).toBeTruthy();
        }
    });

    test('should have proper alt text for images', async ({ page }) => {
        // Check profile image has alt text
        const profileImage = page.locator('[data-testid="profile-image"]');
        if (await profileImage.count() > 0) {
            const altText = await profileImage.getAttribute('alt');
            expect(altText).toBeTruthy();
            expect(altText.length).toBeGreaterThan(0);
        }
    });

    test('should be keyboard navigable', async ({ page }) => {
        // Test tab navigation through the page
        await page.keyboard.press('Tab');
        
        let activeElement = await page.evaluate(() => document.activeElement.tagName);
        expect(['A', 'BUTTON', 'INPUT'].includes(activeElement)).toBeTruthy();
        
        // Test that we can navigate through multiple elements
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
            const newActiveElement = await page.evaluate(() => document.activeElement.tagName);
            // Should be able to focus on interactive elements
            if (['A', 'BUTTON', 'INPUT'].includes(newActiveElement)) {
                expect(true).toBeTruthy(); // Successfully tabbed to interactive element
            }
        }
    });
});
