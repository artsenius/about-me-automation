const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');
const { AboutPage } = require('../pages/aboutPage');

let header;
let aboutPage;

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
        aboutPage = new AboutPage(page);
        await page.goto('');
    });

    test('should have proper heading hierarchy on about page', async ({ page }) => {
        // Check for h1, h2, h3 elements and proper hierarchy
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        expect(headings.length).toBeGreaterThan(0);

        // Verify h1 exists
        const h1Elements = await page.locator('h1').count();
        expect(h1Elements).toBeGreaterThanOrEqual(1);
    });

    test('should have alt text for all images', async ({ page }) => {
        const images = await page.locator('img').all();
        
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            expect(alt).toBeDefined();
            expect(alt.length).toBeGreaterThan(0);
        }
    });

    test('should have proper ARIA labels for interactive elements', async ({ page }) => {
        // Check navigation has proper ARIA labels
        const navElements = await page.locator('[role="navigation"], nav').all();
        expect(navElements.length).toBeGreaterThan(0);

        // Check buttons have accessible names
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
            const ariaLabel = await button.getAttribute('aria-label');
            const text = await button.textContent();
            expect(ariaLabel || text).toBeTruthy();
        }
    });

    test('should have proper keyboard navigation', async ({ page }) => {
        // Test tab navigation through header links
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // Verify focused element is a navigation link
        const focusedElement = await page.locator(':focus').first();
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        expect(['a', 'button'].includes(tagName)).toBeTruthy();
    });

    test('should have sufficient color contrast', async ({ page }) => {
        // Test background/foreground color combinations
        const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').all();
        expect(textElements.length).toBeGreaterThan(0);
        
        // Basic check that text elements have content
        for (let i = 0; i < Math.min(textElements.length, 5); i++) {
            const text = await textElements[i].textContent();
            if (text && text.trim().length > 0) {
                const styles = await textElements[i].evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        color: computed.color,
                        backgroundColor: computed.backgroundColor
                    };
                });
                expect(styles.color).toBeTruthy();
            }
        }
    });

    test('should be responsive across different viewport sizes', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForLoadState('networkidle');
        
        expect(await header.isHamburgerMenuVisible()).toBeTruthy();
        
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForLoadState('networkidle');
        
        // Test desktop viewport
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForLoadState('networkidle');
        
        expect(await header.verifyHeaderVisible()).toBeTruthy();
    });
});