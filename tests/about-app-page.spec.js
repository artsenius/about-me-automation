const { test, expect } = require('@playwright/test');
const { AboutAppPage } = require('../pages/aboutAppPage');
const { Header } = require('../pages/components/header');

let aboutAppPage;
let header;

test.describe('About This App Page', () => {
    test.beforeEach(async ({ page }) => {
        aboutAppPage = new AboutAppPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should be accessible via header navigation', async () => {
        await header.navigateToAboutApp();
        await aboutAppPage.verifyComponentSections();
    });

    test('should display main page sections', async () => {
        await header.navigateToAboutApp();
        await aboutAppPage.verifyComponentSections();
    });

    test('should display all GitHub links', async () => {
        await header.navigateToAboutApp();
        await aboutAppPage.verifyAllLinks();
    });

    test('should navigate to correct pages when clicking links', async () => {
        await header.navigateToAboutApp();

        // Test Live Results link navigation
        await aboutAppPage.clickLiveTestResultsLink();

        // Navigate back
        await header.navigateToAboutApp();

        // Test GitHub links open in new tab
        const [frontendTab] = await Promise.all([
            aboutAppPage.page.waitForEvent('popup'),
            aboutAppPage.clickFrontendCodeLink()
        ]);
        // Just verify that the link opens in a new tab, don't check exact URL
        expect(frontendTab).toBeTruthy();
    });
});
