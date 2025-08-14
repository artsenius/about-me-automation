const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { AboutAppPage } = require('../pages/aboutAppPage');
const { ContactPage } = require('../pages/contactPage');
const { LiveAutomationPage } = require('../pages/liveAutomationPage');
const { Header } = require('../pages/components/header');

let aboutPage, aboutAppPage, contactPage, liveAutomationPage, header;

test.describe('Page Structure Analysis', () => {
    test.beforeEach(async ({ page }) => {
        aboutPage = new AboutPage(page);
        aboutAppPage = new AboutAppPage(page);
        contactPage = new ContactPage(page);
        liveAutomationPage = new LiveAutomationPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should analyze About Me page structure and identify missing data-testids', async ({ page }) => {
        console.log('=== ANALYZING ABOUT ME PAGE STRUCTURE ===');
        
        // Check for elements that might be missing data-testid attributes
        const elementsToCheck = [
            { selector: 'main', description: 'Main content area' },
            { selector: 'section', description: 'Section elements' },
            { selector: 'article', description: 'Article elements' },
            { selector: 'div[class*="container"]', description: 'Container divs' },
            { selector: 'div[class*="card"]', description: 'Card components' },
            { selector: 'h1, h2, h3, h4, h5, h6', description: 'Heading elements' },
            { selector: 'img:not([data-testid])', description: 'Images without data-testid' },
            { selector: 'button:not([data-testid])', description: 'Buttons without data-testid' },
            { selector: 'a:not([data-testid]):not([href*="mailto"]):not([href*="tel"])', description: 'Links without data-testid' },
            { selector: 'ul, ol', description: 'List elements' },
            { selector: 'li', description: 'List item elements' },
            { selector: 'p', description: 'Paragraph elements' },
            { selector: 'span', description: 'Span elements' },
            { selector: '[role]', description: 'Elements with ARIA roles' },
            { selector: '[aria-label]', description: 'Elements with ARIA labels' }
        ];

        const structureAnalysis = {};

        for (const element of elementsToCheck) {
            const elements = await page.locator(element.selector).all();
            const count = elements.length;
            const withTestIds = await page.locator(`${element.selector}[data-testid]`).count();
            const withoutTestIds = count - withTestIds;

            structureAnalysis[element.description] = {
                total: count,
                withTestIds,
                withoutTestIds,
                coverage: count > 0 ? ((withTestIds / count) * 100).toFixed(1) : 0
            };

            console.log(`${element.description}: ${count} total, ${withTestIds} with data-testid, ${withoutTestIds} without (${structureAnalysis[element.description].coverage}% coverage)`);
        }

        // Check semantic structure
        const hasMain = await page.locator('main').count() > 0;
        const hasHeader = await page.locator('header').count() > 0;
        const hasFooter = await page.locator('footer').count() > 0;
        const hasNav = await page.locator('nav').count() > 0;

        console.log('\n=== SEMANTIC STRUCTURE ===');
        console.log(`Has main element: ${hasMain}`);
        console.log(`Has header element: ${hasHeader}`);
        console.log(`Has footer element: ${hasFooter}`);
        console.log(`Has nav element: ${hasNav}`);

        // Verify critical elements have data-testids
        expect(await page.locator('[data-testid="profile-section"]').count()).toBeGreaterThan(0);
        expect(await page.locator('[data-testid="profile-image"]').count()).toBeGreaterThan(0);
        expect(await page.locator('[data-testid="profile-name"]').count()).toBeGreaterThan(0);
    });

    test('should analyze About This App page structure', async ({ page }) => {
        await header.navigateToAboutApp();
        console.log('\n=== ANALYZING ABOUT THIS APP PAGE STRUCTURE ===');
        
        // Check for main content sections
        const sections = [
            '[data-testid="about-app-components"]',
            '[data-testid="about-app-architecture"]',
            '[data-testid="about-app-frontend"]',
            '[data-testid="about-app-backend"]',
            '[data-testid="about-app-automation-framework"]',
            '[data-testid="about-app-development-tools"]'
        ];

        for (const section of sections) {
            const isVisible = await page.locator(section).isVisible();
            console.log(`${section}: ${isVisible ? 'Present' : 'Missing'}`);
            if (isVisible) {
                const textContent = await page.locator(section).textContent();
                console.log(`  Content length: ${textContent?.length || 0} characters`);
            }
        }

        // Check for GitHub links
        const githubLinks = [
            '[data-testid="github-frontend-link"]',
            '[data-testid="github-backend-link"]',
            '[data-testid="about-app-automation-link"]',
            '[data-testid="live-automation-link"]'
        ];

        console.log('\n=== GITHUB LINKS ANALYSIS ===');
        for (const link of githubLinks) {
            const exists = await page.locator(link).count() > 0;
            console.log(`${link}: ${exists ? 'Present' : 'Missing'}`);
            if (exists) {
                const href = await page.locator(link).getAttribute('href');
                console.log(`  Link target: ${href}`);
            }
        }
    });

    test('should analyze Contact page structure', async ({ page }) => {
        await header.navigateToContact();
        console.log('\n=== ANALYZING CONTACT PAGE STRUCTURE ===');
        
        // Check contact cards
        const contactCards = [
            '[data-testid="contact-card-email"]',
            '[data-testid="contact-card-phone"]',
            '[data-testid="contact-card-linkedin"]'
        ];

        for (const card of contactCards) {
            const isVisible = await page.locator(card).isVisible();
            console.log(`${card}: ${isVisible ? 'Present' : 'Missing'}`);
            
            if (isVisible) {
                // Check for copy buttons and links within each card
                const copyButton = await page.locator(`${card} button`).count();
                const links = await page.locator(`${card} a`).count();
                console.log(`  Copy buttons: ${copyButton}`);
                console.log(`  Links: ${links}`);
            }
        }

        // Check for copy confirmation messages
        const copyMessages = [
            '[data-testid="copy-message-email"]',
            '[data-testid="copy-message-phone"]',
            '[data-testid="copy-message-linkedin"]'
        ];

        console.log('\n=== COPY MESSAGE ELEMENTS ===');
        for (const message of copyMessages) {
            // These might be hidden initially
            const exists = await page.locator(message).count() > 0;
            console.log(`${message}: ${exists ? 'Present' : 'Missing'}`);
        }
    });

    test('should analyze Live Automation page structure', async ({ page }) => {
        await header.navigateToLiveAutomation();
        console.log('\n=== ANALYZING LIVE AUTOMATION PAGE STRUCTURE ===');
        
        // Wait for content to load
        await page.waitForTimeout(3000);
        
        // Check main section
        const mainSection = await page.locator('[data-testid="test-automation-section"]').count() > 0;
        console.log(`Main test automation section: ${mainSection ? 'Present' : 'Missing'}`);

        // Check for test run list
        const testRunList = await page.locator('[data-testid="test-run-list"]').count() > 0;
        console.log(`Test run list: ${testRunList ? 'Present' : 'Missing'}`);

        // Check for individual test run cards
        const testRunCards = await page.locator('[data-testid^="test-run-card-"]').count();
        console.log(`Test run cards found: ${testRunCards}`);

        if (testRunCards > 0) {
            // Analyze first test run card structure
            const firstCard = page.locator('[data-testid^="test-run-card-"]').first();
            
            const elements = [
                '[data-testid="test-run-duration"]',
                '[data-testid="test-run-success-rate"]',
                '[data-testid="test-run-passed-tests"]',
                '[data-testid="test-run-failed-tests"]',
                '[data-testid="test-run-skipped-tests"]'
            ];

            console.log('\n=== TEST RUN CARD ELEMENTS ===');
            for (const element of elements) {
                const count = await page.locator(element).count();
                console.log(`${element}: ${count > 0 ? 'Present' : 'Missing'}`);
            }
        }

        // Check for loading placeholder
        const loadingPlaceholder = await page.locator('[data-testid="loading-placeholder"]').count() > 0;
        console.log(`Loading placeholder: ${loadingPlaceholder ? 'Present' : 'Missing'}`);
    });

    test('should analyze header and navigation structure', async ({ page }) => {
        console.log('\n=== ANALYZING HEADER AND NAVIGATION STRUCTURE ===');
        
        // Check header elements
        const headerElements = [
            '[data-testid="header-nav"]',
            '[data-testid="nav-container"]',
            '[data-testid="nav-list"]',
            '[data-testid^="nav-link-"]',
            '[data-testid="nav-menu-button"]'
        ];

        for (const element of headerElements) {
            const count = await page.locator(element).count();
            console.log(`${element}: ${count > 0 ? `Present (${count})` : 'Missing'}`);
        }

        // Check specific navigation links
        const navLinks = [
            '[data-testid="nav-link-about"]',
            '[data-testid="nav-link-about-app"]',
            '[data-testid="nav-link-automation"]',
            '[data-testid="nav-link-contact"]'
        ];

        console.log('\n=== NAVIGATION LINKS ===');
        for (const link of navLinks) {
            const exists = await page.locator(link).count() > 0;
            const text = exists ? await page.locator(link).textContent() : 'N/A';
            console.log(`${link}: ${exists ? 'Present' : 'Missing'} - "${text}"`);
        }
    });

    test('should analyze footer structure', async ({ page }) => {
        console.log('\n=== ANALYZING FOOTER STRUCTURE ===');
        
        const footerElements = [
            '[data-testid="footer"]',
            '[data-testid="footer-copyright"]'
        ];

        for (const element of footerElements) {
            const exists = await page.locator(element).count() > 0;
            console.log(`${element}: ${exists ? 'Present' : 'Missing'}`);
            
            if (exists) {
                const text = await page.locator(element).textContent();
                console.log(`  Content: "${text?.trim().substring(0, 100)}..."`);
            }
        }

        // Check if footer is present on all pages
        const pages = ['about', 'about-app', 'automation', 'contact'];
        console.log('\n=== FOOTER PRESENCE ACROSS PAGES ===');
        
        for (const pageName of pages) {
            switch (pageName) {
                case 'about':
                    // Already on about page
                    break;
                case 'about-app':
                    await header.navigateToAboutApp();
                    break;
                case 'automation':
                    await header.navigateToLiveAutomation();
                    break;
                case 'contact':
                    await header.navigateToContact();
                    break;
            }
            
            const footerVisible = await page.locator('[data-testid="footer"]').isVisible();
            console.log(`Footer on ${pageName} page: ${footerVisible ? 'Visible' : 'Hidden'}`);
        }
    });

    test('should suggest additional data-testid attributes for better testing', async ({ page }) => {
        console.log('\n=== SUGGESTIONS FOR ADDITIONAL DATA-TESTID ATTRIBUTES ===');
        
        // Elements that commonly benefit from data-testid but might not have them
        const suggestionChecks = [
            {
                selector: 'form',
                suggestion: 'Forms should have data-testid="contact-form" or similar'
            },
            {
                selector: 'input',
                suggestion: 'Input fields should have data-testid="input-{fieldname}"'
            },
            {
                selector: 'textarea',
                suggestion: 'Textareas should have data-testid="textarea-{purpose}"'
            },
            {
                selector: 'select',
                suggestion: 'Select dropdowns should have data-testid="select-{purpose}"'
            },
            {
                selector: '[class*="modal"]',
                suggestion: 'Modals should have data-testid="modal-{purpose}"'
            },
            {
                selector: '[class*="popup"]',
                suggestion: 'Popups should have data-testid="popup-{purpose}"'
            },
            {
                selector: '[class*="dropdown"]',
                suggestion: 'Dropdowns should have data-testid="dropdown-{purpose}"'
            },
            {
                selector: '[class*="tooltip"]',
                suggestion: 'Tooltips should have data-testid="tooltip-{purpose}"'
            },
            {
                selector: 'table',
                suggestion: 'Tables should have data-testid="table-{purpose}"'
            },
            {
                selector: 'thead, tbody, tfoot',
                suggestion: 'Table sections should have data-testid attributes'
            },
            {
                selector: '[class*="loading"]',
                suggestion: 'Loading indicators should have data-testid="loading-{context}"'
            },
            {
                selector: '[class*="error"]',
                suggestion: 'Error messages should have data-testid="error-{context}"'
            },
            {
                selector: '[class*="success"]',
                suggestion: 'Success messages should have data-testid="success-{context}"'
            }
        ];

        for (const check of suggestionChecks) {
            const elements = await page.locator(check.selector).count();
            const withTestId = await page.locator(`${check.selector}[data-testid]`).count();
            
            if (elements > 0) {
                console.log(`Found ${elements} ${check.selector} elements, ${withTestId} with data-testid`);
                if (withTestId < elements) {
                    console.log(`  SUGGESTION: ${check.suggestion}`);
                }
            }
        }

        console.log('\n=== RECOMMENDED NEW TEST SCENARIOS ===');
        console.log('1. Test keyboard navigation through all interactive elements');
        console.log('2. Test screen reader compatibility with proper ARIA labels');
        console.log('3. Test copy-to-clipboard functionality with different browsers');
        console.log('4. Test responsive behavior at different breakpoints');
        console.log('5. Test dark/light mode toggle if available');
        console.log('6. Test form validation and error handling');
        console.log('7. Test external link opening behavior');
        console.log('8. Test file download functionality');
        console.log('9. Test loading states and error recovery');
        console.log('10. Test performance metrics (Core Web Vitals)');
    });
});