const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
    const pages = [
        { name: 'About Me', path: '' },
        { name: 'About This App', path: '/about-app' },
        { name: 'Live Automation', path: '/live-test-automation' },
        { name: 'Contact', path: '/contact' }
    ];

    pages.forEach(({ name, path }) => {
        test(`${name} page should meet WCAG accessibility standards`, async ({ page }) => {
            await page.goto(path);
            
            // Check for basic accessibility violations
            const violations = await page.evaluate(() => {
                const issues = [];
                
                // Check for images without alt text
                const images = document.querySelectorAll('img');
                images.forEach((img, index) => {
                    if (!img.alt && !img.getAttribute('aria-label')) {
                        issues.push(`Image ${index + 1} missing alt text`);
                    }
                });
                
                // Check for buttons without accessible names
                const buttons = document.querySelectorAll('button');
                buttons.forEach((btn, index) => {
                    if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
                        issues.push(`Button ${index + 1} missing accessible name`);
                    }
                });
                
                // Check for headings hierarchy
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                let prevLevel = 0;
                headings.forEach((heading, index) => {
                    const level = parseInt(heading.tagName.charAt(1));
                    if (level > prevLevel + 1) {
                        issues.push(`Heading hierarchy skip at heading ${index + 1}: h${prevLevel} to h${level}`);
                    }
                    prevLevel = level;
                });
                
                return issues;
            });
            
            expect(violations).toHaveLength(0);
        });

        test(`${name} page should be keyboard navigable`, async ({ page }) => {
            await page.goto(path);
            
            // Test tab navigation
            const focusableElements = await page.evaluate(() => {
                const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
                return document.querySelectorAll(selector).length;
            });
            
            expect(focusableElements).toBeGreaterThan(0);
            
            // Test that first element can be focused
            await page.keyboard.press('Tab');
            const firstFocused = await page.evaluate(() => document.activeElement.tagName);
            expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(firstFocused)).toBeTruthy();
        });

        test(`${name} page should have proper color contrast`, async ({ page }) => {
            await page.goto(path);
            
            // Check for sufficient color contrast (simplified check)
            const contrastIssues = await page.evaluate(() => {
                const issues = [];
                const elements = document.querySelectorAll('*');
                
                elements.forEach((el, index) => {
                    const styles = window.getComputedStyle(el);
                    const color = styles.color;
                    const backgroundColor = styles.backgroundColor;
                    
                    // Basic contrast check - ensure text has color and background
                    if (el.textContent.trim() && color === 'rgba(0, 0, 0, 0)') {
                        issues.push(`Element ${index + 1} has transparent text color`);
                    }
                });
                
                return issues;
            });
            
            expect(contrastIssues).toHaveLength(0);
        });
    });

    test('Navigation should support screen readers', async ({ page }) => {
        await page.goto('');
        
        // Check for landmark elements
        const landmarks = await page.evaluate(() => {
            const nav = document.querySelector('nav');
            const main = document.querySelector('main');
            const header = document.querySelector('header');
            const footer = document.querySelector('footer');
            
            return {
                hasNav: !!nav,
                hasMain: !!main,
                hasHeader: !!header,
                hasFooter: !!footer
            };
        });
        
        expect(landmarks.hasNav || landmarks.hasHeader).toBeTruthy();
        expect(landmarks.hasMain).toBeTruthy();
        expect(landmarks.hasFooter).toBeTruthy();
    });
});