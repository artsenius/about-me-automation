const { test, expect } = require('@playwright/test');
const { Footer } = require('../pages/components/footer');
const { Header } = require('../pages/components/header');

let footer;
let header;

test.describe('Footer', () => {
    test.beforeEach(async ({ page }) => {
        footer = new Footer(page);
        header = new Header(page);
        // Navigate to the base URL from config
        await page.goto('');
    });

    test('should display footer with copyright text', async () => {
        // Verify footer is visible
        expect(await footer.isFooterVisible()).toBeTruthy();

        // Verify copyright text is present
        expect(await footer.verifyCopyrightPresent()).toBeTruthy();

        // Verify copyright text content
        const copyrightText = await footer.getCopyrightText();
        // Should contain copyright symbol
        expect(copyrightText).toContain('©');
        // Should contain the year
        expect(copyrightText).toContain('2025');
        // Should contain author name
        expect(copyrightText.toLowerCase()).toContain('arthur senko');
        // Should contain rights reserved text
        expect(copyrightText.toLowerCase()).toContain('all rights reserved');
    });

    test('should display footer consistently across all pages', async () => {
        test.setTimeout(45000); // Increase timeout to 45 seconds for this test
        // Check footer on About Me page (already there from beforeEach)
        expect(await footer.isFooterVisible()).toBeTruthy();

        // Navigate to and check footer on About This App page
        await header.navigateToAboutApp();
        expect(await footer.isFooterVisible()).toBeTruthy();

        // Navigate to and check footer on Live Automation page
        await header.navigateToLiveAutomation();
        expect(await footer.isFooterVisible()).toBeTruthy();

        // Navigate to and check footer on Contact page
        await header.navigateToContact();
        expect(await footer.isFooterVisible()).toBeTruthy();

        // Navigate back to About Me to verify full circle
        await header.navigateToAboutMe();
        expect(await footer.isFooterVisible()).toBeTruthy();
    });
});
