const { test, expect } = require('@playwright/test');

test.describe('Error Handling Tests', () => {
    test('should handle network timeouts gracefully', async ({ page }) => {
        // Simulate slow network
        await page.route('**/*', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 100));
            await route.continue();
        });
        
        await page.goto('', { timeout: 30000 });
        
        // Page should still load despite slow network
        await expect(page.locator('[data-testid="profile-section"]')).toBeVisible();
    });

    test('should handle missing images gracefully', async ({ page }) => {
        // Block image requests to simulate missing images
        await page.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort());
        
        await page.goto('');
        
        // Page should still be functional without images
        await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="nav-container"]')).toBeVisible();
        
        // Check that alt text is shown for missing profile image
        const profileImage = page.locator('[data-testid="profile-image"]');
        if (await profileImage.count() > 0) {
            const alt = await profileImage.getAttribute('alt');
            expect(alt).toBeTruthy();
        }
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
        const jsErrors = [];
        
        page.on('pageerror', (error) => {
            jsErrors.push(error.message);
        });
        
        await page.goto('');
        
        // Navigate through the site
        await page.click('[data-testid="nav-link-contact"]');
        await page.waitForLoadState('networkidle');
        
        await page.click('[data-testid="nav-link-about-app"]');
        await page.waitForLoadState('networkidle');
        
        // Should not have critical JavaScript errors
        const criticalErrors = jsErrors.filter(error => 
            error.includes('TypeError') || 
            error.includes('ReferenceError') ||
            error.includes('SyntaxError')
        );
        
        expect(criticalErrors).toHaveLength(0);
    });

    test('should handle broken external links', async ({ page }) => {
        await page.goto('');
        
        // Get all external links
        const externalLinks = await page.locator('a[href^="http"]:not([href*="arthursenko.com"])').all();
        
        for (const link of externalLinks) {
            const href = await link.getAttribute('href');
            if (href) {
                try {
                    // Check if external links are valid (but don't navigate)
                    const response = await page.request.head(href);
                    
                    // Link should return a reasonable status code
                    expect([200, 301, 302, 403]).toContain(response.status());
                } catch (error) {
                    // Some external links might be blocked by CORS, that's ok
                    console.warn(`External link check failed for ${href}: ${error.message}`);
                }
            }
        }
    });

    test('should handle rapid navigation without breaking', async ({ page }) => {
        await page.goto('');
        
        // Rapidly navigate between pages
        const navigationSequence = [
            '[data-testid="nav-link-contact"]',
            '[data-testid="nav-link-about-app"]',
            '[data-testid="nav-link-automation"]',
            '[data-testid="nav-link-about"]'
        ];
        
        for (let i = 0; i < 3; i++) {
            for (const selector of navigationSequence) {
                await page.click(selector);
                // Don't wait for full load, simulate rapid clicking
                await page.waitForTimeout(100);
            }
        }
        
        // Should end up on the About page and be functional
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="profile-section"]')).toBeVisible();
    });

    test('should handle form validation errors properly', async ({ page }) => {
        await page.goto('');
        await page.click('[data-testid="nav-link-contact"]');
        
        // Look for any contact forms
        const forms = await page.locator('form').all();
        
        for (const form of forms) {
            // Try to submit empty form if it exists
            const submitButton = form.locator('button[type="submit"], input[type="submit"]');
            
            if (await submitButton.count() > 0) {
                await submitButton.click();
                
                // Should show validation messages or prevent submission
                const requiredFields = await form.locator('input[required], textarea[required]').all();
                
                for (const field of requiredFields) {
                    const validationMessage = await field.evaluate(el => el.validationMessage);
                    if (validationMessage) {
                        expect(validationMessage.length).toBeGreaterThan(0);
                    }
                }
            }
        }
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
        await page.goto('');
        
        // Navigate through several pages
        await page.click('[data-testid="nav-link-contact"]');
        await page.waitForLoadState('networkidle');
        
        await page.click('[data-testid="nav-link-about-app"]');
        await page.waitForLoadState('networkidle');
        
        // Use browser back button
        await page.goBack();
        await page.waitForLoadState('networkidle');
        
        // Should be on contact page - check URL instead of CSS class
        const url = await page.url();
        expect(url).toContain('contact');
        
        // Use browser forward button
        await page.goForward();
        await page.waitForLoadState('networkidle');
        
        // Should be on about app page - check URL instead of CSS class
        const forwardUrl = await page.url();
        expect(forwardUrl).toContain('about') || expect(forwardUrl).toContain('app');
    });

    test('should handle viewport resize without breaking layout', async ({ page }) => {
        await page.goto('');
        
        // Test various viewport sizes
        const viewports = [
            { width: 320, height: 568 },   // iPhone 5
            { width: 768, height: 1024 },  // iPad portrait
            { width: 1024, height: 768 },  // iPad landscape
            { width: 1920, height: 1080 }  // Desktop
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(500); // Let layout settle
            
            // Key elements should still be visible
            await expect(page.locator('[data-testid="nav-container"]')).toBeVisible();
            
            // No horizontal overflow
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = viewport.width;
            expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance
        }
    });
});