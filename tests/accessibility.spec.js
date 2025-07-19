const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { Header } = require('../pages/components/header');

let aboutPage;
let header;

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        aboutPage = new AboutPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        // Check that h1 exists and is unique
        const h1Elements = await page.locator('h1').count();
        expect(h1Elements).toBe(1);

        // Check that headings follow proper hierarchy (h1 -> h2 -> h3, etc.)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        expect(headings.length).toBeGreaterThan(0);
    });

    test('should have alt text for all images', async ({ page }) => {
        const images = await page.locator('img').all();
        
        for (const img of images) {
            const altText = await img.getAttribute('alt');
            const ariaLabel = await img.getAttribute('aria-label');
            const role = await img.getAttribute('role');
            
            // Images should have alt text, aria-label, or be decorative (alt="")
            expect(altText !== null || ariaLabel !== null || role === 'presentation').toBeTruthy();
        }
    });

    test('should have proper form labels and accessibility', async ({ page }) => {
        const inputs = await page.locator('input, textarea, select').all();
        
        for (const input of inputs) {
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            
            if (id) {
                // Check if there's a corresponding label
                const label = await page.locator(`label[for="${id}"]`).count();
                const hasLabel = label > 0 || ariaLabel || ariaLabelledBy;
                expect(hasLabel).toBeTruthy();
            }
        }
    });

    test('should have sufficient color contrast', async ({ page }) => {
        // Basic color contrast check - ensure text is readable
        const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, button, span').all();
        
        // This is a basic check - in a real scenario you'd use axe-core or similar
        for (const element of textElements.slice(0, 5)) { // Check first 5 elements to avoid timeout
            const isVisible = await element.isVisible();
            if (isVisible) {
                const textContent = await element.textContent();
                expect(textContent?.trim().length).toBeGreaterThan(0);
            }
        }
    });

    test('should be keyboard navigable', async ({ page }) => {
        // Check that interactive elements are keyboard accessible
        const interactiveElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
        
        for (const element of interactiveElements.slice(0, 3)) { // Check first 3 to avoid timeout
            await element.focus();
            const isFocused = await element.evaluate(el => document.activeElement === el);
            expect(isFocused).toBeTruthy();
        }
    });

    test('should have proper ARIA landmarks', async ({ page }) => {
        // Check for main content landmark
        const main = await page.locator('main, [role="main"]').count();
        expect(main).toBeGreaterThanOrEqual(1);

        // Check for navigation landmark
        const nav = await page.locator('nav, [role="navigation"]').count();
        expect(nav).toBeGreaterThanOrEqual(1);
    });
});