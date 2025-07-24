const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
    });

    test.skip('should have proper page titles for SEO', async ({ page }) => {
        const header = new Header(page);
        
        // Check About Me page title
        await expect(page).toHaveTitle(/About Me|Arthur Senko/);
        
        // Check About App page title
        await header.navigateToAboutApp();
        await expect(page).toHaveTitle(/About/);
        
        // Check Contact page title
        await header.navigateToContact();
        await expect(page).toHaveTitle(/Contact/);
        
        // Check Live Automation page title
        await header.navigateToLiveAutomation();
        await expect(page).toHaveTitle(/Live|Automation/);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        // Check for h1 element
        const h1Elements = await page.locator('h1').count();
        expect(h1Elements).toBeGreaterThanOrEqual(1);
        
        // Verify h1 has meaningful content
        const h1Text = await page.locator('h1').first().textContent();
        expect(h1Text?.length).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
        const images = await page.locator('img').all();
        
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');
            
            // Skip decorative images or icons, but ensure profile/content images have alt text
            if (!src?.includes('icon') && !src?.includes('decoration')) {
                expect(alt).toBeTruthy();
                expect(alt?.length).toBeGreaterThan(0);
            }
        }
    });

    test('should have proper link accessibility', async ({ page }) => {
        const links = await page.locator('a').all();
        
        for (const link of links) {
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            const ariaLabel = await link.getAttribute('aria-label');
            
            // External links should open in new tab and have proper attributes
            if (href?.startsWith('http') && !href.includes('arthursenko.com')) {
                const target = await link.getAttribute('target');
                const rel = await link.getAttribute('rel');
                expect(target).toBe('_blank');
                expect(rel).toContain('noopener');
            }
            
            // Links should have meaningful text or aria-label
            expect(text || ariaLabel).toBeTruthy();
        }
    });

    test('should have proper form accessibility (if forms exist)', async ({ page }) => {
        const forms = await page.locator('form').count();
        if (forms > 0) {
            const inputs = await page.locator('input, textarea, select').all();
            
            for (const input of inputs) {
                const id = await input.getAttribute('id');
                const ariaLabel = await input.getAttribute('aria-label');
                const placeholder = await input.getAttribute('placeholder');
                
                // Inputs should have labels, aria-labels, or meaningful placeholders
                if (id) {
                    const label = await page.locator(`label[for="${id}"]`).count();
                    expect(label > 0 || ariaLabel || placeholder).toBeTruthy();
                }
            }
        }
    });

    test('should have proper color contrast (basic check)', async ({ page }) => {
        // Check that text is not using very low contrast colors
        const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').all();
        
        let checkedElements = 0;
        for (const element of textElements.slice(0, 10)) { // Check first 10 elements
            const color = await element.evaluate(el => getComputedStyle(el).color);
            const backgroundColor = await element.evaluate(el => getComputedStyle(el).backgroundColor);
            
            // Basic check: ensure text is not transparent or same as background
            expect(color).not.toBe('rgba(0, 0, 0, 0)');
            expect(color).not.toBe(backgroundColor);
            checkedElements++;
        }
        
        expect(checkedElements).toBeGreaterThan(0);
    });
});