const { test, expect } = require('@playwright/test');
const { LiveAutomationPage } = require('../pages/liveAutomationPage');
const { Header } = require('../pages/components/header');

let liveAutomationPage;
let header;

test.describe('Live Automation Page', () => {
    test.beforeEach(async ({ page }) => {
        liveAutomationPage = new LiveAutomationPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should be accessible via header navigation', async () => {
        await header.navigateToLiveAutomation();
        await liveAutomationPage.verifyContent();
    });

    test('should display test result components', async () => {
        await header.navigateToLiveAutomation();
        await liveAutomationPage.waitForTestResults();

        const components = await liveAutomationPage.getTestResultComponents();
        expect(components.length).toBeGreaterThan(0);
    });

    test('should handle test result expansion and collapse', async () => {
        await header.navigateToLiveAutomation();
        await liveAutomationPage.waitForTestResults();

        // Get the first test result
        const components = await liveAutomationPage.getTestResultComponents();
        expect(components.length).toBeGreaterThan(0);

        // Expand first test result and verify content
        await liveAutomationPage.expandTestResult(0);
        expect(await liveAutomationPage.isTestResultExpanded(0)).toBeTruthy();
        expect(await liveAutomationPage.verifyTestResultContent(0)).toBeTruthy();

        // Collapse test result and verify
        await liveAutomationPage.collapseTestResult(0);
        expect(await liveAutomationPage.isTestResultExpanded(0)).toBeFalsy();
    });

    test('should display test result details correctly', async () => {
        await header.navigateToLiveAutomation();
        await liveAutomationPage.waitForTestResults();

        const components = await liveAutomationPage.getTestResultComponents();
        expect(components.length).toBeGreaterThan(0);

        // Expand the first test result and verify content
        await liveAutomationPage.expandTestResult(0);
        expect(await liveAutomationPage.verifyTestResultContent(0)).toBeTruthy();
    });
});
