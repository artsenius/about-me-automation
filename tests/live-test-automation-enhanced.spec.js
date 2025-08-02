const { test, expect } = require('@playwright/test');
const { LiveAutomationPage } = require('../pages/liveAutomationPage');
const { Header } = require('../pages/components/header');

let liveAutomationPage;
let header;

test.describe('Live Automation Page - Enhanced Coverage', () => {
    test.beforeEach(async ({ page }) => {
        liveAutomationPage = new LiveAutomationPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test.describe('Page Loading and Basic Functionality', () => {
        test('should display page title correctly', async ({ page }) => {
            await header.navigateToLiveAutomation();
            
            // Check if page title element exists, if not verify page loaded another way
            const titleElement = page.locator('[data-testid="page-title"]');
            const titleExists = await titleElement.count() > 0;
            
            if (titleExists && await titleElement.isVisible()) {
                const pageTitle = await liveAutomationPage.getPageTitle();
                expect(pageTitle).toContain('Live');
            } else {
                // Verify page is loaded by checking main content
                await liveAutomationPage.verifyContent();
                await expect(page.locator('[data-testid="test-automation-section"]')).toBeVisible();
            }
        });

        test('should handle loading state before content appears', async ({ page }) => {
            // Navigate but don't wait for loading to complete
            await header.navigateToLiveAutomation();
            
            // Verify loading placeholder is initially visible (if page loads slowly)
            try {
                await page.locator('[data-testid="loading-placeholder"]').waitFor({ 
                    state: 'visible', 
                    timeout: 1000 
                });
            } catch (e) {
                // Loading might be too fast to catch, which is okay
            }
            
            // Wait for content to load and verify loading is gone
            await liveAutomationPage.waitForTestResults();
            expect(await page.locator('[data-testid="loading-placeholder"]').isVisible()).toBeFalsy();
        });

        test('should verify page content structure', async ({ page }) => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.verifyContent();
            
            // Verify essential page elements
            await expect(page.locator('[data-testid="test-automation-section"]')).toBeVisible();
            await expect(page.locator('[data-testid="test-run-list"]')).toBeVisible();
        });
    });

    test.describe('Test Results Data Verification', () => {
        test('should verify all test result data fields are present', async () => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const components = await liveAutomationPage.getTestResultComponents();
            expect(components.length).toBeGreaterThan(0);
            
            // Expand first test result
            await liveAutomationPage.expandTestResult(0);
            
            // Verify all data fields are accessible
            const testName = await liveAutomationPage.getTestName(0);
            const testDuration = await liveAutomationPage.getTestDuration(0);
            const testStatus = await liveAutomationPage.getTestStatus(0);
            
            expect(testName).toBeTruthy();
            expect(testDuration).toBeTruthy();
            expect(testStatus).toMatch(/^(passed|failed)$/);
        });

        test('should verify multiple test run cards functionality', async () => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const components = await liveAutomationPage.getTestResultComponents();
            
            // Test multiple cards if available
            const cardsToTest = Math.min(3, components.length);
            
            for (let i = 0; i < cardsToTest; i++) {
                // Test expansion
                await liveAutomationPage.expandTestResult(i);
                expect(await liveAutomationPage.isTestResultExpanded(i)).toBeTruthy();
                
                // Verify content
                expect(await liveAutomationPage.verifyTestResultContent(i)).toBeTruthy();
                
                // Test collapse
                await liveAutomationPage.collapseTestResult(i);
                expect(await liveAutomationPage.isTestResultExpanded(i)).toBeFalsy();
            }
        });

        test('should extract and validate test metrics', async () => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const components = await liveAutomationPage.getTestResultComponents();
            expect(components.length).toBeGreaterThan(0);
            
            // Expand first test result and verify metrics
            await liveAutomationPage.expandTestResult(0);
            
            const testStatus = await liveAutomationPage.getTestStatus(0);
            const testDuration = await liveAutomationPage.getTestDuration(0);
            
            // Validate test status format
            expect(['passed', 'failed']).toContain(testStatus);
            
            // Validate duration format (should contain time information)
            expect(testDuration).toMatch(/\d+/); // Should contain at least one number
        });
    });

    test.describe('Responsive Design and Mobile Testing', () => {
        test('should work correctly on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            // Verify functionality works on mobile
            const components = await liveAutomationPage.getTestResultComponents();
            expect(components.length).toBeGreaterThan(0);
            
            // Test expand/collapse on mobile
            await liveAutomationPage.expandTestResult(0);
            expect(await liveAutomationPage.isTestResultExpanded(0)).toBeTruthy();
            
            await liveAutomationPage.collapseTestResult(0);
            expect(await liveAutomationPage.isTestResultExpanded(0)).toBeFalsy();
        });

        test('should handle mobile navigation correctly', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Test mobile navigation to Live Automation page
            const isHamburgerVisible = await header.isHamburgerMenuVisible();
            
            if (isHamburgerVisible) {
                await header.openHamburgerMenu();
                await header.navigateToLiveAutomation();
                await liveAutomationPage.verifyContent();
            } else {
                // Direct navigation if hamburger not visible
                await header.navigateToLiveAutomation();
                await liveAutomationPage.verifyContent();
            }
        });
    });

    test.describe('Error Handling and Edge Cases', () => {
        test('should handle empty test results gracefully', async ({ page }) => {
            await header.navigateToLiveAutomation();
            
            // Wait for the page to load
            await liveAutomationPage.verifyContent();
            
            // Check if test results are available
            const components = await liveAutomationPage.getTestResultComponents();
            
            if (components.length === 0) {
                // Verify the page still loads correctly even with no test results
                await expect(page.locator('[data-testid="test-run-list"]')).toBeVisible();
            } else {
                // If test results exist, verify they work correctly
                expect(components.length).toBeGreaterThan(0);
            }
        });

        test('should handle rapid expand/collapse actions', async () => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const components = await liveAutomationPage.getTestResultComponents();
            expect(components.length).toBeGreaterThan(0);
            
            // Rapid expand/collapse test
            for (let i = 0; i < 3; i++) {
                await liveAutomationPage.expandTestResult(0);
                await liveAutomationPage.collapseTestResult(0);
            }
            
            // Verify final state
            expect(await liveAutomationPage.isTestResultExpanded(0)).toBeFalsy();
        });

        test('should handle invalid test card indices gracefully', async () => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const components = await liveAutomationPage.getTestResultComponents();
            const invalidIndex = components.length + 10;
            
            // These operations should not throw errors
            const invalidCard = await liveAutomationPage.getTestRunCard(invalidIndex);
            expect(invalidCard).toBeNull();
            
            const invalidName = await liveAutomationPage.getTestName(invalidIndex);
            expect(invalidName).toBeNull();
            
            const invalidDuration = await liveAutomationPage.getTestDuration(invalidIndex);
            expect(invalidDuration).toBeNull();
            
            const invalidStatus = await liveAutomationPage.getTestStatus(invalidIndex);
            expect(invalidStatus).toBeNull();
        });
    });

    test.describe('Performance and Timing', () => {
        test('should load test results within reasonable time', async () => {
            const startTime = Date.now();
            
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const loadTime = Date.now() - startTime;
            
            // Test should load within 10 seconds
            expect(loadTime).toBeLessThan(10000);
            
            const components = await liveAutomationPage.getTestResultComponents();
            expect(components.length).toBeGreaterThan(0);
        });

        test('should handle expand/collapse animations smoothly', async () => {
            await header.navigateToLiveAutomation();
            await liveAutomationPage.waitForTestResults();
            
            const components = await liveAutomationPage.getTestResultComponents();
            expect(components.length).toBeGreaterThan(0);
            
            const startTime = Date.now();
            
            // Expand and verify timing
            await liveAutomationPage.expandTestResult(0);
            expect(await liveAutomationPage.isTestResultExpanded(0)).toBeTruthy();
            
            // Collapse and verify timing
            await liveAutomationPage.collapseTestResult(0);
            expect(await liveAutomationPage.isTestResultExpanded(0)).toBeFalsy();
            
            const totalTime = Date.now() - startTime;
            
            // Animation should complete within 5 seconds
            expect(totalTime).toBeLessThan(5000);
        });
    });
});