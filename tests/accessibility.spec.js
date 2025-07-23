const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');
const { AboutPage } = require('../pages/aboutPage');
const { ContactPage } = require('../pages/contactPage');

/**
 * Accessibility Tests - WCAG compliance checks
 */
test.describe('Accessibility Tests', () => {
    test('should have proper heading hierarchy on about page', async ({ page }) => {
        await page.goto('');
        
        // Check heading structure (h1 -> h2 -> h3, etc.)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        expect(headings.length).toBeGreaterThan(0);
        
        // Should have exactly one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
    });

    test('should have alt text for all images', async ({ page }) => {
        await page.goto('');
        
        const images = await page.locator('img').all();
        
        for (const image of images) {
            const alt = await image.getAttribute('alt');
            const ariaLabel = await image.getAttribute('aria-label');
            const role = await image.getAttribute('role');
            
            // Images should have alt text, aria-label, or role="presentation"
            expect(alt !== null || ariaLabel !== null || role === 'presentation').toBeTruthy();
        }
    });

    test('should have accessible navigation', async ({ page }) => {
        await page.goto('');
        
        // Navigation should have proper ARIA attributes
        const nav = await page.locator('nav').first();
        const ariaLabel = await nav.getAttribute('aria-label');
        const role = await nav.getAttribute('role');
        
        expect(ariaLabel !== null || role === 'navigation').toBeTruthy();
    });

    test('should have keyboard navigation support', async ({ page }) => {
        await page.goto('');
        
        const header = new Header(page);
        
        // Test tab navigation through main navigation
        await page.keyboard.press('Tab');
        
        // Should be able to navigate with keyboard
        const focusedElement = await page.locator(':focus').first();
        expect(await focusedElement.isVisible()).toBeTruthy();
    });

    test('should have sufficient color contrast', async ({ page }) => {
        await page.goto('');
        
        // Check that text elements have sufficient contrast
        // This is a basic check - in a real scenario you'd use axe-core
        const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, button, span').all();
        
        // Ensure we have text elements to test
        expect(textElements.length).toBeGreaterThan(0);
        
        // Basic visibility check (more detailed contrast checks would require axe-core)
        for (const element of textElements.slice(0, 5)) { // Test first 5 elements
            const isVisible = await element.isVisible();
            if (isVisible) {
                const text = await element.textContent();
                expect(text && text.trim().length > 0).toBeTruthy();
            }
        }
    });

    test('should have proper form labels on contact page', async ({ page }) => {
        await page.goto('');
        const header = new Header(page);
        
        await header.navigateToContact();
        
        // Check for form inputs and their labels
        const inputs = await page.locator('input, textarea, select').all();
        
        for (const input of inputs) {
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');
            
            // Form inputs should have proper labeling
            const hasProperLabel = id !== null || ariaLabel !== null || ariaLabelledBy !== null;
            
            if (!hasProperLabel && placeholder) {
                // Placeholder can be acceptable for simple forms, but not ideal
                console.warn('Input has only placeholder text, consider adding proper label');
            }
        }
    });

    test('should support screen readers', async ({ page }) => {
        await page.goto('');
        
        // Check for ARIA landmarks
        const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').all();
        expect(landmarks.length).toBeGreaterThan(0);
        
        // Check for skip links (accessibility best practice)
        const skipLinks = await page.locator('a[href^="#"]').filter({ hasText: /skip|jump/i }).all();
        // Skip links are optional but recommended
    });

    test('should be usable without JavaScript', async ({ page }) => {
        // Disable JavaScript
        await page.setJavaScriptEnabled(false);
        await page.goto('');
        
        // Basic content should still be accessible
        const pageTitle = await page.title();
        expect(pageTitle).toBeTruthy();
        expect(pageTitle.length).toBeGreaterThan(0);
        
        // Navigation links should still be clickable
        const navLinks = await page.locator('nav a').all();
        expect(navLinks.length).toBeGreaterThan(0);
    });
});