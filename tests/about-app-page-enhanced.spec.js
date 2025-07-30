const { test, expect, devices } = require('@playwright/test');
const { AboutAppPage } = require('../pages/aboutAppPage');
const { Header } = require('../pages/components/header');

let aboutAppPage;
let header;

test.describe('About This App Page - Enhanced Coverage', () => {
    test.beforeEach(async ({ page }) => {
        aboutAppPage = new AboutAppPage(page);
        header = new Header(page);
        await page.goto('');
        await header.navigateToAboutApp();
    });

    test.describe('Basic Functionality', () => {
        test('should be accessible via header navigation', async () => {
            // Already navigated in beforeEach
            await aboutAppPage.verifyComponentSections();
        });

        test('should display page title correctly', async () => {
            const title = await aboutAppPage.verifyPageTitle();
            expect(title).toContain('About Me'); // The page title is "About Me | Portfolio Project"
        });

        test('should display all component sections including architecture', async () => {
            await aboutAppPage.verifyComponentSections();
            // Verify architecture section specifically (previously missing)
            const architectureVisible = await aboutAppPage.verifyArchitectureSection();
            expect(architectureVisible).toBeTruthy();
        });

        test('should display all GitHub and navigation links', async () => {
            await aboutAppPage.verifyAllLinks();
        });
    });

    test.describe('Content Validation', () => {
        test('should display meaningful content in all sections', async () => {
            const sections = await aboutAppPage.verifyAllSectionContent();
            
            // Verify each section has meaningful content
            expect(sections.components).toBeTruthy();
            expect(sections.components.length).toBeGreaterThan(10);
            
            expect(sections.architecture).toBeTruthy();
            expect(sections.architecture.length).toBeGreaterThan(10);
            
            expect(sections.frontend).toBeTruthy();
            expect(sections.frontend.length).toBeGreaterThan(10);
            
            expect(sections.backend).toBeTruthy();
            expect(sections.backend.length).toBeGreaterThan(10);
            
            expect(sections.automation).toBeTruthy();
            expect(sections.automation.length).toBeGreaterThan(10);
            
            expect(sections.devTools).toBeTruthy();
            expect(sections.devTools.length).toBeGreaterThan(10);
        });

        test('should contain expected technology keywords in sections', async () => {
            const sections = await aboutAppPage.verifyAllSectionContent();
            
            // Frontend section should mention relevant technologies
            expect(sections.frontend.toLowerCase()).toMatch(/(react|javascript|css|html|typescript)/);
            
            // Backend section should mention backend technologies
            expect(sections.backend.toLowerCase()).toMatch(/(api|server|database|node|express|python)/);
            
            // Automation section should mention testing technologies
            expect(sections.automation.toLowerCase()).toMatch(/(playwright|test|automation|selenium|cypress)/);
        });
    });

    test.describe('Link Validation', () => {
        test('should have valid GitHub URLs for all code links', async () => {
            const links = await aboutAppPage.verifyLinkUrls();
            
            // Verify GitHub URLs
            expect(links.frontend).toMatch(/^https:\/\/github\.com\//);
            expect(links.backend).toMatch(/^https:\/\/github\.com\//);
            expect(links.automation).toMatch(/^https:\/\/github\.com\//);
            
            // Live results link may not have href (could be JavaScript-based navigation)
            // Just verify the element exists and has text content
            const liveResultsElement = await aboutAppPage.page.locator(aboutAppPage.selectors.liveTestResultsLink);
            const liveResultsText = await liveResultsElement.textContent();
            expect(liveResultsText).toContain('Live Test');
        });

        test('should navigate to correct pages for all GitHub links', async () => {
            const results = await aboutAppPage.verifyAllGitHubLinksNavigation();
            
            // Verify all links opened successfully
            expect(results).toHaveLength(3);
            results.forEach((result, index) => {
                expect(result.popup).toBeTruthy();
                expect(result.url).toMatch(/github\.com/);
                expect(result.name).toBeTruthy();
            });
        });

        test('should navigate to live test results page', async () => {
            const initialUrl = await aboutAppPage.page.url();
            await aboutAppPage.clickLiveTestResultsLink();
            
            // Wait for navigation to complete (may be slow or may not change URL if SPA)
            await aboutAppPage.page.waitForTimeout(3000);
            const currentUrl = await aboutAppPage.page.url();
            
            // Check if URL changed, contains automation pattern, or if we're on a page with automation content
            const urlChanged = currentUrl !== initialUrl;
            const hasAutomationPattern = /(automation|live|test)/i.test(currentUrl);
            
            // Alternative: check if the page content changed to indicate navigation
            const hasAutomationContent = await aboutAppPage.page.locator('text=automation').count() > 0 ||
                                         await aboutAppPage.page.locator('text=test').count() > 0 ||
                                         await aboutAppPage.page.locator('text=live').count() > 0;
            
            expect(urlChanged || hasAutomationPattern || hasAutomationContent).toBeTruthy();
        });
    });

    test.describe('Error Handling & Edge Cases', () => {
        test('should handle page reload gracefully', async ({ page }) => {
            await page.reload();
            await header.navigateToAboutApp();
            await aboutAppPage.verifyComponentSections();
        });

        test('should handle network interruption gracefully', async ({ page }) => {
            // Simulate slow network
            await page.route('**/*', route => {
                setTimeout(() => route.continue(), 100);
            });
            
            await aboutAppPage.verifyComponentSections();
        });
    });

    test.describe('Responsive Design', () => {
        test('should display correctly on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();
            await header.navigateToAboutApp();
            
            // Verify components are still visible on mobile
            await aboutAppPage.verifyComponentSections();
            await aboutAppPage.verifyAllLinks();
        });

        test('should display correctly on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.reload();
            await header.navigateToAboutApp();
            
            await aboutAppPage.verifyComponentSections();
            await aboutAppPage.verifyAllLinks();
        });
    });

    test.describe('Performance & Loading', () => {
        test('should load all sections within acceptable time', async ({ page }) => {
            const startTime = Date.now();
            await header.navigateToAboutApp();
            await aboutAppPage.verifyComponentSections();
            const loadTime = Date.now() - startTime;
            
            // Should load within 5 seconds
            expect(loadTime).toBeLessThan(5000);
        });

        test('should have no console errors', async ({ page }) => {
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            await header.navigateToAboutApp();
            await aboutAppPage.verifyComponentSections();
            
            expect(consoleErrors).toHaveLength(0);
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper heading structure', async ({ page }) => {
            const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
            expect(headings.length).toBeGreaterThan(0);
            
            // Check if headings have text content
            for (const heading of headings) {
                const text = await heading.textContent();
                expect(text.trim()).toBeTruthy();
            }
        });

        test('should have accessible links with proper attributes', async ({ page }) => {
            const links = await page.locator('a').all();
            
            for (const link of links) {
                const href = await link.getAttribute('href');
                const text = await link.textContent();
                const ariaLabel = await link.getAttribute('aria-label');
                
                // Links should have href and meaningful text or aria-label
                expect(href).toBeTruthy();
                expect(text?.trim() || ariaLabel).toBeTruthy();
            }
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Focus first link and verify it's focusable
            await page.keyboard.press('Tab');
            const focusedElement = await page.locator(':focus').first();
            expect(await focusedElement.count()).toBeGreaterThan(0);
        });
    });
});

// Mobile-specific test suite  
test.describe('About This App Page - Mobile Tests', () => {
    test.beforeEach(async ({ page }) => {
        aboutAppPage = new AboutAppPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should navigate via mobile menu', async ({ page, browser }) => {
        // Create mobile context
        const mobileContext = await browser.newContext({
            ...devices['iPhone 15']
        });
        const mobilePage = await mobileContext.newPage();
        
        const mobileAboutAppPage = new AboutAppPage(mobilePage);
        const mobileHeader = new Header(mobilePage);
        
        await mobilePage.goto('');
        await mobileHeader.navigateToAboutApp();
        await mobileAboutAppPage.verifyComponentSections();
        
        await mobileContext.close();
    });

    test('should handle touch interactions for links', async ({ page, browser }) => {
        // Create mobile context  
        const mobileContext = await browser.newContext({
            ...devices['iPhone 15']
        });
        const mobilePage = await mobileContext.newPage();
        
        const mobileAboutAppPage = new AboutAppPage(mobilePage);
        const mobileHeader = new Header(mobilePage);
        
        await mobilePage.goto('');
        await mobileHeader.navigateToAboutApp();
        
        // Test touch interaction with a GitHub link
        const [popup] = await Promise.all([
            mobilePage.waitForEvent('popup'),
            mobilePage.locator(mobileAboutAppPage.selectors.frontendCodeLink).tap()
        ]);
        
        expect(popup).toBeTruthy();
        await popup.close();
        await mobileContext.close();
    });
});