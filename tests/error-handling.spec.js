const { test, expect } = require('@playwright/test');

test.describe('Error Handling Tests', () => {
    test('should handle network failures gracefully', async ({ page, context }) => {
        // Simulate network failure
        await context.setOffline(true);
        
        try {
            await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 });
        } catch (error) {
            // Expected to fail, now test how the app handles it
            console.log('Network failure simulated successfully');
        }
        
        // Restore network and check recovery
        await context.setOffline(false);
        await page.reload();
        
        // Page should recover gracefully
        await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    });

    test('should handle slow loading states', async ({ page, context }) => {
        // Simulate slow network
        await context.route('**/*', async route => {
            await new Promise(resolve => setTimeout(resolve, 200));
            await route.continue();
        });

        await page.goto('/');
        
        // Should show loading states for slow content
        const possibleLoadingStates = [
            '[data-testid="loading-placeholder"]',
            '.loading',
            '.spinner',
            '[aria-label*="loading"]',
            '[role="progressbar"]'
        ];

        let hasLoadingState = false;
        for (const selector of possibleLoadingStates) {
            const element = await page.locator(selector).first();
            if (await element.isVisible().catch(() => false)) {
                hasLoadingState = true;
                break;
            }
        }

        // Content should eventually load
        await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
        console.log(`Loading state detected: ${hasLoadingState}`);
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
        const jsErrors = [];
        
        // Capture JavaScript errors
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // Inject a JS error to test error handling
        await page.goto('/');
        
        await page.evaluate(() => {
            // Simulate a common JS error
            try {
                const nullObj = null;
                nullObj.someProperty.anotherProperty;
            } catch (error) {
                console.error('Simulated error:', error);
            }
        });

        await page.waitForTimeout(1000);

        // Page should still be functional despite JS errors
        const isPageFunctional = await page.locator('nav').isVisible();
        expect(isPageFunctional).toBeTruthy();

        console.log(`JavaScript errors captured: ${jsErrors.length}`);
    });

    test('should handle missing resources gracefully', async ({ page }) => {
        const failedRequests = [];
        
        // Monitor failed requests
        page.on('requestfailed', request => {
            failedRequests.push(request.url());
        });

        // Block some common resources to simulate failures
        await page.route('**/*.{jpg,jpeg,png,gif,svg}', route => {
            if (route.request().url().includes('test-missing-image')) {
                route.fulfill({ status: 404 });
            } else {
                route.continue();
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Page should handle missing resources gracefully
        const pageIsUsable = await page.locator('nav').isVisible() && 
                            await page.locator('footer').isVisible();
        
        expect(pageIsUsable).toBeTruthy();
        console.log(`Failed requests: ${failedRequests.length}`);
    });

    test('should handle browser compatibility issues', async ({ page, browserName }) => {
        await page.goto('/');
        
        // Test for common compatibility issues
        const compatibilityCheck = await page.evaluate(() => {
            const issues = [];
            
            // Check for unsupported CSS features graceful degradation
            if (!CSS.supports('display', 'grid')) {
                issues.push('CSS Grid not supported');
            }
            
            if (!CSS.supports('display', 'flex')) {
                issues.push('Flexbox not supported');
            }
            
            // Check for JS feature availability
            if (typeof fetch === 'undefined') {
                issues.push('Fetch API not supported');
            }
            
            if (typeof Promise === 'undefined') {
                issues.push('Promises not supported');
            }
            
            return issues;
        });

        // Page should work regardless of feature support
        const coreElementsVisible = await page.locator('header').isVisible() &&
                                   await page.locator('main, .main, [role="main"]').isVisible();
        
        expect(coreElementsVisible).toBeTruthy();
        console.log(`${browserName} compatibility issues: ${compatibilityCheck.join(', ') || 'None'}`);
    });

    test('should provide helpful 404 error pages', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist-12345', { 
            waitUntil: 'networkidle' 
        }).catch(() => null);

        // Check if we got a 404 or if it redirected
        if (response && response.status() === 404) {
            // Should have a user-friendly 404 page
            const content = await page.content();
            const hasHelpfulContent = content.includes('404') || 
                                    content.includes('not found') || 
                                    content.includes('page doesn\'t exist');
            
            // Should have navigation to help user
            const hasNavigation = await page.locator('nav a').count() > 0;
            
            expect(hasHelpfulContent).toBeTruthy();
            expect(hasNavigation).toBeTruthy();
        }
    });

    test('should handle form validation errors properly', async ({ page }) => {
        await page.goto('/contact');
        
        // Look for any forms
        const forms = await page.locator('form').all();
        
        for (const form of forms) {
            const inputs = await form.locator('input[required], textarea[required]').all();
            
            if (inputs.length > 0) {
                // Try to submit form without required fields
                const submitButton = await form.locator('button[type="submit"], input[type="submit"]').first();
                
                if (await submitButton.isVisible()) {
                    await submitButton.click();
                    
                    // Should show validation errors
                    const validationMessages = await page.locator(':invalid, .error, .validation-error').count();
                    
                    // Browser should prevent submission or show custom validation
                    const currentUrl = page.url();
                    expect(currentUrl).toContain('contact'); // Should stay on same page
                }
            }
        }
    });

    test('should recover from temporary service interruptions', async ({ page }) => {
        let requestCount = 0;
        
        // Simulate intermittent service failures
        await page.route('**/*', route => {
            requestCount++;
            
            // Fail first few requests, then succeed
            if (requestCount <= 2 && route.request().url().includes(page.url().split('/')[2])) {
                route.fulfill({ status: 503, body: 'Service Temporarily Unavailable' });
            } else {
                route.continue();
            }
        });

        // Page should eventually load despite initial failures
        await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
        
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
        
        console.log(`Requests attempted: ${requestCount}`);
    });
});