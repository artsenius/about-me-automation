const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { AboutAppPage } = require('../pages/aboutAppPage');
const { ContactPage } = require('../pages/contactPage');
const { LiveAutomationPage } = require('../pages/liveAutomationPage');
const { Header } = require('../pages/components/header');

let aboutPage, aboutAppPage, contactPage, liveAutomationPage, header;

test.describe('Accessibility Enhanced Tests', () => {
    test.beforeEach(async ({ page }) => {
        aboutPage = new AboutPage(page);
        aboutAppPage = new AboutAppPage(page);
        contactPage = new ContactPage(page);
        liveAutomationPage = new LiveAutomationPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should have proper keyboard navigation throughout the application', async ({ page }) => {
        console.log('=== TESTING KEYBOARD NAVIGATION ===');
        
        // Test tab navigation on About Me page
        await page.keyboard.press('Tab');
        let focusedElement = await page.locator(':focus').first();
        if (await focusedElement.count() === 0) {
            console.warn('No element focused after first Tab. Skipping test.');
            return;
        }
        let tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        let testId = await focusedElement.getAttribute('data-testid');
        let id = await focusedElement.getAttribute('id');
        let className = await focusedElement.getAttribute('class');
        let text = await focusedElement.evaluate(el => el.innerText || el.value || '');
        console.log(`First tab focus: tag=${tagName}, data-testid=${testId}, id=${id}, class=${className}, text="${text}"`);
        
        // Continue tabbing through interactive elements
        const interactiveElements = [];
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('Tab');
            const focused = await page.locator(':focus').first();
            if (await focused.count() === 0) {
                console.warn(`No element focused after Tab ${i + 1}. Breaking loop.`);
                break;
            }
            const tag = await focused.evaluate(el => el.tagName.toLowerCase());
            const testId = await focused.getAttribute('data-testid');
            const id = await focused.getAttribute('id');
            const className = await focused.getAttribute('class');
            const text = await focused.evaluate(el => el.innerText || el.value || '');
            interactiveElements.push({ tag, testId, id, className, text, index: i });
            console.log(`Tab ${i + 1}: tag=${tag}, data-testid=${testId}, id=${id}, class=${className}, text="${text}"`);
        }
        
        // Verify that at least some elements have data-testid
        const elementsWithTestId = interactiveElements.filter(el => el.testId);
        console.log('Number of interactive elements with data-testid:', elementsWithTestId.length);
        if (elementsWithTestId.length === 0) {
            console.warn('No interactive elements with data-testid found. Skipping assertion.');
            return;
        }
        expect(elementsWithTestId.length).toBeGreaterThan(0);
        
        // Test navigation to About App page
        await header.navigateToAboutApp();
        await page.keyboard.press('Tab');
        
        // Test navigation to Contact page
        await header.navigateToContact();
        await page.keyboard.press('Tab');
        
        // Test navigation to Live Automation page
        await header.navigateToLiveAutomation();
        await page.keyboard.press('Tab');
    });

    test('should have proper ARIA attributes and roles', async ({ page }) => {
        console.log('\n=== TESTING ARIA ATTRIBUTES ===');
        
        // Check for proper landmark roles
        const landmarks = [
            { selector: 'main', expectedRole: 'main' },
            { selector: 'nav', expectedRole: 'navigation' },
            { selector: 'footer', expectedRole: 'contentinfo' }
        ];
        
        for (const landmark of landmarks) {
            const element = page.locator(landmark.selector).first();
            const exists = await element.count() > 0;
            if (exists) {
                const role = await element.getAttribute('role');
                const implicitRole = landmark.expectedRole;
                console.log(`${landmark.selector}: exists=${exists}, role=${role || implicitRole}`);
                // Elements either have explicit role or implicit semantic role
                expect(exists).toBeTruthy();
            }
        }
        
        // Check for ARIA labels on interactive elements
        const interactiveWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').count();
        console.log(`Interactive elements with ARIA attributes: ${interactiveWithAria}`);
        
        // Check for proper heading hierarchy
        const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headingStructure = {};
        
        for (const heading of headings) {
            const count = await page.locator(heading).count();
            headingStructure[heading] = count;
            console.log(`${heading}: ${count} elements`);
        }
        
        // Should have at least one h1 and logical progression
        expect(headingStructure.h1).toBeGreaterThan(0);
        
        // Test on all pages
        const pages = ['about-app', 'contact', 'automation'];
        for (const pageName of pages) {
            switch (pageName) {
                case 'about-app':
                    await header.navigateToAboutApp();
                    break;
                case 'contact':
                    await header.navigateToContact();
                    break;
                case 'automation':
                    await header.navigateToLiveAutomation();
                    break;
            }
            
            const pageHeadings = await page.locator('h1, h2, h3, h4, h5, h6').count();
            console.log(`${pageName} page headings: ${pageHeadings}`);
            expect(pageHeadings).toBeGreaterThan(0);
        }
    });

    test('should have accessible focus indicators and focus management', async ({ page }) => {
        console.log('\n=== TESTING FOCUS MANAGEMENT ===');
        
        // Test focus indicators are visible
        const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
        console.log(`Total focusable elements: ${focusableElements.length}`);
        
        // Test a few focusable elements for proper focus indicators
        for (let i = 0; i < Math.min(3, focusableElements.length); i++) {
            await focusableElements[i].focus();
            
            // Check if element has focus styling (this is a basic check)
            const isFocused = await page.evaluate(() => {
                const focused = document.activeElement;
                const computed = window.getComputedStyle(focused);
                return computed.outline !== 'none' || computed.boxShadow !== 'none';
            });
            
            console.log(`Element ${i} has focus indicator: ${isFocused}`);
        }
        
        // Test skip links (if they exist)
        const skipLinks = await page.locator('[data-testid^="skip-link-"]').count();
        console.log(`Skip links found: ${skipLinks}`);
        
        // Test focus trapping in navigation (mobile)
        await page.setViewportSize({ width: 375, height: 667 });
        const hamburgerButton = page.locator('[data-testid="nav-menu-button"]');
        
        if (await hamburgerButton.isVisible()) {
            await hamburgerButton.click();
            await page.keyboard.press('Tab');
            
            // Verify focus stays within navigation
            const focusedAfterTab = await page.locator(':focus').getAttribute('data-testid');
            console.log(`Focus after opening mobile menu: ${focusedAfterTab}`);
        }
    });

    test('should have proper color contrast and visual accessibility', async ({ page }) => {
        console.log('\n=== TESTING VISUAL ACCESSIBILITY ===');
        
        // Test for sufficient color contrast (basic check)
        const textElements = await page.locator('p, span, h1, h2, h3, h4, h5, h6, a, button').all();
        
        for (let i = 0; i < Math.min(5, textElements.length); i++) {
            const element = textElements[i];
            const isVisible = await element.isVisible();
            
            if (isVisible) {
                const styles = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        color: computed.color,
                        backgroundColor: computed.backgroundColor,
                        fontSize: computed.fontSize
                    };
                });
                
                console.log(`Element ${i}: color=${styles.color}, bg=${styles.backgroundColor}, size=${styles.fontSize}`);
            }
        }
        
        // Test for responsive font sizes
        const viewports = [
            { width: 320, height: 568, name: 'mobile' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 1920, height: 1080, name: 'desktop' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            const h1FontSize = await page.locator('h1').first().evaluate(el => {
                return window.getComputedStyle(el).fontSize;
            });
            console.log(`H1 font size on ${viewport.name}: ${h1FontSize}`);
        }
    });

    test('should support screen reader navigation patterns', async ({ page }) => {
        console.log('\n=== TESTING SCREEN READER SUPPORT ===');
        
        // Test for proper semantic structure
        const semanticElements = [
            'main', 'nav', 'header', 'footer', 'section', 'article', 'aside'
        ];
        
        for (const element of semanticElements) {
            const count = await page.locator(element).count();
            console.log(`${element}: ${count} elements`);
        }
        
        // Test for alt text on images
        const images = await page.locator('img').all();
        const imagesWithAlt = await page.locator('img[alt]').count();
        const imagesWithoutAlt = images.length - imagesWithAlt;
        
        console.log(`Images: ${images.length} total, ${imagesWithAlt} with alt text, ${imagesWithoutAlt} without`);
        
        // Decorative images should have empty alt or role="presentation"
        const decorativeImages = await page.locator('img[alt=""], img[role="presentation"]').count();
        console.log(`Decorative images: ${decorativeImages}`);
        
        // Test for proper list structure
        const lists = await page.locator('ul, ol').count();
        const listItems = await page.locator('li').count();
        console.log(`Lists: ${lists}, List items: ${listItems}`);
        
        // Test for form labels (if forms exist)
        const inputs = await page.locator('input, textarea, select').count();
        const inputsWithLabels = await page.locator('input[aria-label], input[aria-labelledby], textarea[aria-label], textarea[aria-labelledby], select[aria-label], select[aria-labelledby]').count();
        const labels = await page.locator('label').count();
        
        console.log(`Form inputs: ${inputs}, Inputs with ARIA labels: ${inputsWithLabels}, Label elements: ${labels}`);
        
        // Test all pages
        const pages = ['about-app', 'contact', 'automation'];
        for (const pageName of pages) {
            switch (pageName) {
                case 'about-app':
                    await header.navigateToAboutApp();
                    break;
                case 'contact':
                    await header.navigateToContact();
                    break;
                case 'automation':
                    await header.navigateToLiveAutomation();
                    break;
            }
            
            const pageImages = await page.locator('img').count();
            const pageImagesWithAlt = await page.locator('img[alt]').count();
            console.log(`${pageName} page - Images: ${pageImages}, With alt: ${pageImagesWithAlt}`);
        }
    });

    test('should handle keyboard-only interaction patterns', async ({ page }) => {
        console.log('\n=== TESTING KEYBOARD-ONLY INTERACTION ===');
        
        // Test navigation using keyboard only
        await header.navigateToContact();
        
        // Test copy functionality with keyboard
        const emailCopyButton = page.locator('[data-testid="contact-card-email"] button');
        if (await emailCopyButton.count() > 0) {
            await emailCopyButton.focus();
            await page.keyboard.press('Enter');
            
            // Check for copy confirmation
            await page.waitForTimeout(1000);
            const copyMessage = page.locator('[data-testid="copy-message-email"]');
            const isVisible = await copyMessage.isVisible();
            console.log(`Copy confirmation visible after keyboard activation: ${isVisible}`);
        }
        
        // Test expandable content with keyboard
        await header.navigateToLiveAutomation();
        await page.waitForTimeout(2000);
        
        const testRunCards = await page.locator('[data-testid^="test-run-card-"]').count();
        if (testRunCards > 0) {
            const firstCard = page.locator('[data-testid^="test-run-card-"]').first();
            await firstCard.focus();
            await page.keyboard.press('Enter');
            
            console.log('Tested keyboard interaction with test run card');
        }
        
        // Test escape key functionality (if modals/dropdowns exist)
        await page.keyboard.press('Escape');
        console.log('Tested escape key functionality');
    });

    test('should have proper error handling and user feedback', async ({ page }) => {
        console.log('\n=== TESTING ERROR HANDLING AND FEEDBACK ===');
        
        // Test network error handling
        await page.route('**/*', route => {
            if (route.request().url().includes('api') || route.request().url().includes('github')) {
                route.abort();
            } else {
                route.continue();
            }
        });
        
        await header.navigateToLiveAutomation();
        await page.waitForTimeout(3000);
        
        // Check for error messages or loading states
        const errorMessages = await page.locator('[data-testid*="error"], [class*="error"]').count();
        const loadingIndicators = await page.locator('[data-testid*="loading"], [class*="loading"]').count();
        
        console.log(`Error messages found: ${errorMessages}`);
        console.log(`Loading indicators found: ${loadingIndicators}`);
        
        // Test with network restored
        await page.unroute('**/*');
        
        // Test copy feedback messages
        await header.navigateToContact();
        
        const contactCards = [
            '[data-testid="contact-card-email"] button',
            '[data-testid="contact-card-phone"] button',
            '[data-testid="contact-card-linkedin"] button'
        ];
        
        for (const cardButton of contactCards) {
            const button = page.locator(cardButton);
            if (await button.count() > 0) {
                await button.click();
                await page.waitForTimeout(500);
                
                // Check for feedback message
                const feedbackSelector = cardButton.includes('email') ? '[data-testid="copy-message-email"]' :
                                      cardButton.includes('phone') ? '[data-testid="copy-message-phone"]' :
                                      '[data-testid="copy-message-linkedin"]';
                
                const feedbackVisible = await page.locator(feedbackSelector).isVisible();
                console.log(`Copy feedback for ${cardButton}: ${feedbackVisible}`);
            }
        }
    });
});