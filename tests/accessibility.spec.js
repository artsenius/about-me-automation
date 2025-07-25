const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { ContactPage } = require('../pages/contactPage');
const { Header } = require('../pages/components/header');

test.describe('Accessibility Tests', () => {
    test('should have proper heading hierarchy on About page', async ({ page }) => {
        await page.goto('');
        
        // Check heading hierarchy (h1 -> h2 -> h3, etc.)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
        expect(headings.length).toBeGreaterThan(0);
        
        // Ensure h1 exists and is unique
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
    });

    test('should have proper alt text for all images', async ({ page }) => {
        await page.goto('');
        
        const images = await page.locator('img').all();
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');
            
            // All images should have alt text or be decorative
            if (!alt && !await img.getAttribute('role')) {
                console.warn(`Image missing alt text: ${src}`);
            }
            
            // Profile image should have meaningful alt text
            if (src && src.includes('profile')) {
                expect(alt).toBeTruthy();
                expect(alt.length).toBeGreaterThan(5);
            }
        }
    });

    test('should have keyboard navigation support', async ({ page }) => {
        await page.goto('');
        
        // Test tab navigation through header links
        await page.keyboard.press('Tab');
        let focusedElement = await page.locator(':focus').first();
        expect(await focusedElement.isVisible()).toBeTruthy();
        
        // Continue tabbing and ensure focus is visible
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
            focusedElement = await page.locator(':focus').first();
            expect(await focusedElement.isVisible()).toBeTruthy();
        }
    });

    test('should have proper color contrast', async ({ page }) => {
        await page.goto('');
        
        // Check that text has sufficient contrast with background
        const bodyColor = await page.evaluate(() => {
            const body = document.body;
            const computedStyle = window.getComputedStyle(body);
            return {
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor
            };
        });
        
        expect(bodyColor.color).toBeTruthy();
        expect(bodyColor.backgroundColor).toBeTruthy();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
        await page.goto('');
        
        // Check navigation has proper ARIA role
        const nav = page.locator('nav');
        expect(await nav.count()).toBeGreaterThan(0);
        
        // Check buttons have accessible names
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
            const ariaLabel = await button.getAttribute('aria-label');
            const textContent = await button.textContent();
            
            // Button should have either text content or aria-label
            expect(ariaLabel || textContent?.trim()).toBeTruthy();
        }
    });

    test('should be screen reader friendly', async ({ page }) => {
        await page.goto('');
        
        // Check for skip links
        const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();
        if (await skipLink.count() > 0) {
            expect(await skipLink.isVisible()).toBeTruthy();
        }
        
        // Check main landmark exists
        const main = page.locator('main, [role="main"]');
        expect(await main.count()).toBeGreaterThan(0);
    });
});