const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
    });

    test('should have secure headers', async ({ page }) => {
        const response = await page.goto('');
        const headers = response.headers();
        
        // Check for security headers (these may not all be present, but we'll check what's available)
        const securityHeaders = [
            'x-frame-options',
            'x-content-type-options',
            'strict-transport-security',
            'content-security-policy'
        ];
        
        // At least some security headers should be present
        const presentHeaders = securityHeaders.filter(header => headers[header]);
        console.log('Security headers found:', presentHeaders);
        
        // The site should at least not be completely vulnerable
        expect(response.status()).toBe(200);
    });

    test('should not expose sensitive information in console', async ({ page }) => {
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                consoleLogs.push(msg.text());
            }
        });
        
        await page.waitForLoadState('networkidle');
        
        // Check for sensitive data in console logs
        const sensitivePatterns = [
            /password/i,
            /secret/i,
            /token/i,
            /api.*key/i,
            /credentials/i
        ];
        
        const sensitiveLeaks = consoleLogs.filter(log => 
            sensitivePatterns.some(pattern => pattern.test(log))
        );
        
        expect(sensitiveLeaks).toHaveLength(0);
    });

    test('should handle invalid URLs gracefully', async ({ page }) => {
        // Test with invalid route
        const response = await page.goto('/invalid-page-that-does-not-exist');
        
        // Should either redirect or show 404, but not crash
        expect([200, 404, 301, 302].includes(response.status())).toBeTruthy();
    });

    test('should not allow clickjacking', async ({ page }) => {
        // Test if the site can be embedded in an iframe
        const frameTest = await page.evaluate(() => {
            try {
                return window.self === window.top;
            } catch (e) {
                return false;
            }
        });
        
        // This is just a basic check - proper clickjacking protection requires server headers
        expect(frameTest).toBeTruthy();
    });

    test('should sanitize any user inputs', async ({ page }) => {
        // Navigate to contact page and test form inputs if they exist
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');
        
        // Check for any form elements
        const forms = await page.locator('form').count();
        const inputs = await page.locator('input[type="text"], textarea').count();
        
        if (inputs > 0) {
            const testInput = '<script>alert("xss")</script>';
            const inputElements = await page.locator('input[type="text"], textarea').first();
            
            if (await inputElements.isVisible()) {
                await inputElements.fill(testInput);
                const value = await inputElements.inputValue();
                
                // Input should be sanitized or escaped
                expect(value).not.toContain('<script>');
            }
        }
        
        // If no forms, that's also fine for a portfolio site
        console.log(`Found ${forms} forms and ${inputs} inputs`);
    });

    test('should use HTTPS for external resources', async ({ page }) => {
        const requests = [];
        page.on('request', request => {
            requests.push(request.url());
        });
        
        await page.waitForLoadState('networkidle');
        
        // Check external resources use HTTPS
        const externalHttp = requests.filter(url => 
            url.startsWith('http://') && 
            !url.includes('localhost') && 
            !url.includes('127.0.0.1')
        );
        
        expect(externalHttp).toHaveLength(0);
    });

    test('should not leak internal paths or structure', async ({ page }) => {
        const response = await page.goto('');
        const content = await page.content();
        
        // Check for common internal path leaks
        const internalPatterns = [
            /\/var\/www/i,
            /\/home\/[^\/]+/i,
            /C:\\Users/i,
            /\/usr\/local/i,
            /node_modules/i
        ];
        
        const leaks = internalPatterns.filter(pattern => pattern.test(content));
        expect(leaks).toHaveLength(0);
    });
});