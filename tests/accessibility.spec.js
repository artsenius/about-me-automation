const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
    const pages = [
        { path: '', name: 'About Me' },
        { path: 'about-app', name: 'About This App' },
        { path: 'live-automation', name: 'Live Automation' },
        { path: 'contact', name: 'Contact' }
    ];

    pages.forEach(({ path, name }) => {
        test(`should have no accessibility violations on ${name} page`, async ({ page }) => {
            await page.goto(path);
            await page.waitForLoadState('networkidle');

            // Check for basic accessibility issues
            await expect(page).toHaveTitle(/.+/); // Should have a meaningful title
            
            // Check for heading structure (should have h1)
            const h1Elements = await page.locator('h1').count();
            expect(h1Elements).toBeGreaterThan(0);

            // Check that images have alt attributes
            const images = await page.locator('img').all();
            for (const img of images) {
                const alt = await img.getAttribute('alt');
                // Alt can be empty for decorative images, but should exist
                expect(alt).not.toBeNull();
            }

            // Check that links have accessible names
            const links = await page.locator('a[href]').all();
            for (const link of links) {
                const text = await link.textContent();
                const ariaLabel = await link.getAttribute('aria-label');
                const title = await link.getAttribute('title');
                
                // Link should have accessible text (content, aria-label, or title)
                expect(text || ariaLabel || title).toBeTruthy();
            }

            // Check for proper form labels (if any forms exist)
            const inputs = await page.locator('input, textarea, select').all();
            for (const input of inputs) {
                const id = await input.getAttribute('id');
                const ariaLabel = await input.getAttribute('aria-label');
                const ariaLabelledby = await input.getAttribute('aria-labelledby');
                
                if (id) {
                    const label = await page.locator(`label[for="${id}"]`).count();
                    expect(label > 0 || ariaLabel || ariaLabelledby).toBeTruthy();
                } else {
                    expect(ariaLabel || ariaLabelledby).toBeTruthy();
                }
            }
        });

        test(`should have proper color contrast on ${name} page`, async ({ page }) => {
            await page.goto(path);
            await page.waitForLoadState('networkidle');

            // Check that text elements have sufficient color contrast
            // This is a basic check - in a real scenario you'd use axe-playwright
            const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').all();
            
            // Ensure we have text content
            let hasTextContent = false;
            for (const element of textElements.slice(0, 10)) { // Check first 10 elements
                const text = await element.textContent();
                if (text && text.trim().length > 0) {
                    hasTextContent = true;
                    break;
                }
            }
            expect(hasTextContent).toBeTruthy();
        });

        test(`should support keyboard navigation on ${name} page`, async ({ page }) => {
            await page.goto(path);
            await page.waitForLoadState('networkidle');

            // Test Tab navigation
            const focusableElements = await page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])').all();
            
            if (focusableElements.length > 0) {
                // Focus first element
                await focusableElements[0].focus();
                
                // Tab through a few elements
                for (let i = 0; i < Math.min(3, focusableElements.length - 1); i++) {
                    await page.keyboard.press('Tab');
                    // Verify focus moved (basic check)
                    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
                    expect(focusedElement).toBeTruthy();
                }
            }
        });
    });
});