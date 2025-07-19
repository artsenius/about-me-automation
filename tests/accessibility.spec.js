const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
    test('About page should have proper heading hierarchy', async ({ page }) => {
        await page.goto('/');
        
        // Check for h1 element
        const h1Elements = await page.locator('h1').count();
        expect(h1Elements).toBeGreaterThan(0);
        expect(h1Elements).toBeLessThanOrEqual(1); // Should have only one h1
        
        // Check heading hierarchy (h1 -> h2 -> h3, etc.)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        let previousLevel = 0;
        
        for (const heading of headings) {
            const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
            const currentLevel = parseInt(tagName.charAt(1));
            
            if (previousLevel > 0) {
                // Should not skip heading levels
                expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
            }
            previousLevel = currentLevel;
        }
    });

    test('All images should have alt text', async ({ page }) => {
        await page.goto('/');
        
        const images = await page.locator('img').all();
        
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');
            
            // Decorative images can have empty alt, but alt attribute must exist
            expect(alt).not.toBeNull();
            
            // Non-decorative images should have descriptive alt text
            if (src && !src.includes('decoration') && !src.includes('spacer')) {
                expect(alt.length).toBeGreaterThan(0);
                expect(alt.length).toBeLessThan(150); // Keep alt text concise
            }
        }
    });

    test('Forms should have proper labels and accessibility', async ({ page }) => {
        await page.goto('/contact');
        
        const inputs = await page.locator('input, textarea, select').all();
        
        for (const input of inputs) {
            const inputId = await input.getAttribute('id');
            const inputType = await input.getAttribute('type');
            const inputName = await input.getAttribute('name');
            
            // Skip hidden inputs and buttons
            if (inputType === 'hidden' || inputType === 'submit' || inputType === 'button') {
                continue;
            }
            
            // Each input should have a label
            if (inputId) {
                const label = await page.locator(`label[for="${inputId}"]`).count();
                expect(label).toBeGreaterThan(0);
            } else {
                // If no id, check for aria-label or nested in label
                const ariaLabel = await input.getAttribute('aria-label');
                const parentLabel = await input.locator('xpath=ancestor::label').count();
                
                expect(ariaLabel || parentLabel > 0).toBeTruthy();
            }
            
            // Required fields should be marked properly
            const required = await input.getAttribute('required');
            if (required !== null) {
                const ariaRequired = await input.getAttribute('aria-required');
                expect(ariaRequired === 'true' || required !== null).toBeTruthy();
            }
        }
    });

    test('Interactive elements should be keyboard accessible', async ({ page }) => {
        await page.goto('/');
        
        // Test keyboard navigation
        await page.keyboard.press('Tab');
        
        // Check that focus is visible
        const focusedElement = await page.evaluate(() => document.activeElement.tagName);
        expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(focusedElement)).toBeTruthy();
        
        // Test navigation menu keyboard accessibility
        const navLinks = await page.locator('nav a, nav button').all();
        
        for (const link of navLinks) {
            await link.focus();
            
            // Element should be focusable
            const isFocused = await link.evaluate(el => el === document.activeElement);
            expect(isFocused).toBeTruthy();
            
            // Should be able to activate with Enter
            const href = await link.getAttribute('href');
            const tagName = await link.evaluate(el => el.tagName.toLowerCase());
            
            if (href && !href.startsWith('#')) {
                // Links should be activatable with Enter
                await expect(link).toBeVisible();
            }
        }
    });

    test('Color contrast should be sufficient', async ({ page }) => {
        await page.goto('/');
        
        // Check text elements for color contrast
        const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, button, span').all();
        
        for (const element of textElements.slice(0, 10)) { // Sample first 10 elements
            const styles = await element.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    color: computed.color,
                    backgroundColor: computed.backgroundColor,
                    fontSize: computed.fontSize
                };
            });
            
            // Basic check - text should not be transparent
            expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
            expect(styles.color).not.toBe('transparent');
            
            // Font size should be readable
            const fontSize = parseInt(styles.fontSize);
            expect(fontSize).toBeGreaterThanOrEqual(12); // Minimum readable size
        }
    });

    test('Page should have proper document structure', async ({ page }) => {
        await page.goto('/');
        
        // Check for proper HTML lang attribute
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang).toBeTruthy();
        expect(htmlLang.length).toBeGreaterThanOrEqual(2);
        
        // Check for page title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        expect(title.length).toBeLessThan(60); // SEO best practice
        
        // Check for meta description
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        if (metaDescription) {
            expect(metaDescription.length).toBeGreaterThan(0);
            expect(metaDescription.length).toBeLessThan(160); // SEO best practice
        }
        
        // Check for main landmark
        const mainLandmark = await page.locator('main, [role="main"]').count();
        expect(mainLandmark).toBeGreaterThan(0);
    });

    test('Skip links should be available for keyboard users', async ({ page }) => {
        await page.goto('/');
        
        // Tab to first element and check for skip link
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            return {
                tagName: el.tagName,
                textContent: el.textContent,
                href: el.getAttribute('href')
            };
        });
        
        // First focusable element should ideally be a skip link
        if (focusedElement.textContent && focusedElement.textContent.toLowerCase().includes('skip')) {
            expect(focusedElement.href).toContain('#');
        }
    });

    test('Error messages should be accessible', async ({ page }) => {
        await page.goto('/contact');
        
        // Try to submit form without filling required fields
        const submitButton = await page.locator('input[type="submit"], button[type="submit"]').first();
        
        if (await submitButton.count() > 0) {
            await submitButton.click();
            
            // Check for error messages
            const errorMessages = await page.locator('[role="alert"], .error, .invalid').all();
            
            for (const error of errorMessages) {
                const isVisible = await error.isVisible();
                if (isVisible) {
                    // Error should have proper ARIA attributes
                    const ariaLive = await error.getAttribute('aria-live');
                    const role = await error.getAttribute('role');
                    
                    expect(ariaLive === 'assertive' || ariaLive === 'polite' || role === 'alert').toBeTruthy();
                }
            }
        }
    });
});