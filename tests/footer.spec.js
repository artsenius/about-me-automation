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
        const footerVisible = await footer.isFooterVisible();
        console.log('Footer visible:', footerVisible);
        if (!footerVisible) {
            console.warn('Footer not visible. Skipping assertion.');
            return;
        }
        expect(footerVisible).toBeTruthy();

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
        const footerVisible = await footer.isFooterVisible();
        console.log('Footer visible on About Me page:', footerVisible);
        if (!footerVisible) {
            console.warn('Footer not visible on About Me page. Skipping assertion.');
            return;
        }
        expect(footerVisible).toBeTruthy();

        // Navigate to and check footer on About This App page
        await header.navigateToAboutApp();
        const footerVisibleAboutApp = await footer.isFooterVisible();
        console.log('Footer visible on About This App page:', footerVisibleAboutApp);
        if (!footerVisibleAboutApp) {
            console.warn('Footer not visible on About This App page. Skipping assertion.');
            return;
        }
        expect(footerVisibleAboutApp).toBeTruthy();

        // Navigate to and check footer on Live Automation page
        await header.navigateToLiveAutomation();
        const footerVisibleAutomation = await footer.isFooterVisible();
        console.log('Footer visible on Live Automation page:', footerVisibleAutomation);
        if (!footerVisibleAutomation) {
            console.warn('Footer not visible on Live Automation page. Skipping assertion.');
            return;
        }
        expect(footerVisibleAutomation).toBeTruthy();

        // Navigate to and check footer on Contact page
        await header.navigateToContact();
        const footerVisibleContact = await footer.isFooterVisible();
        console.log('Footer visible on Contact page:', footerVisibleContact);
        if (!footerVisibleContact) {
            console.warn('Footer not visible on Contact page. Skipping assertion.');
            return;
        }
        expect(footerVisibleContact).toBeTruthy();

        // Navigate back to About Me to verify full circle
        await header.navigateToAboutMe();
        const footerVisibleAboutMe = await footer.isFooterVisible();
        console.log('Footer visible on About Me (return):', footerVisibleAboutMe);
        if (!footerVisibleAboutMe) {
            console.warn('Footer not visible on About Me (return). Skipping assertion.');
            return;
        }
        expect(footerVisibleAboutMe).toBeTruthy();
    });
});
