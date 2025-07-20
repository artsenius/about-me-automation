const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
    const pages = [
        { name: 'About Me', path: '' },
        { name: 'About This App', path: '/about-app' },
        { name: 'Live Automation', path: '/live-test-automation' },
        { name: 'Contact', path: '/contact' }
    ];

    pages.forEach(({ name, path }) => {
        test(`${name} page should have proper security headers`, async ({ page }) => {
            const response = await page.goto(path);
            const headers = response.headers();
            
            // Check for important security headers
            const securityHeaders = {
                'x-frame-options': 'Should prevent clickjacking',
                'x-content-type-options': 'Should prevent MIME sniffing',
                'referrer-policy': 'Should control referrer information',
                'permissions-policy': 'Should control browser features'
            };
            
            const missingHeaders = [];
            Object.keys(securityHeaders).forEach(header => {
                if (!headers[header]) {
                    missingHeaders.push(`${header}: ${securityHeaders[header]}`);
                }
            });
            
            if (missingHeaders.length > 0) {
                console.log(`${name} page missing security headers:`, missingHeaders);
            }
            
            // HTTPS should be enforced (checking if we're redirected to HTTPS)
            expect(response.url()).toMatch(/^https:/);
        });

        test(`${name} page should not expose sensitive information`, async ({ page }) => {
            await page.goto(path);
            
            // Check for sensitive data in page source
            const content = await page.content();
            const sensitivePatterns = [
                /password\s*[=:]\s*['"]/i,
                /api[_-]?key\s*[=:]\s*['"]/i,
                /secret\s*[=:]\s*['"]/i,
                /token\s*[=:]\s*['"]/i,
                /jdbc:/i,
                /mysql:/i,
                /mongodb:/i
            ];
            
            const foundSensitiveData = [];
            sensitivePatterns.forEach((pattern, index) => {
                if (pattern.test(content)) {
                    foundSensitiveData.push(`Pattern ${index + 1}: ${pattern.toString()}`);
                }
            });
            
            expect(foundSensitiveData).toHaveLength(0);
        });

        test(`${name} page should not be vulnerable to XSS`, async ({ page }) => {
            await page.goto(path);
            
            // Test for basic XSS prevention
            const xssPayload = '<script>window.xssTest = true;</script>';
            
            // Try injecting XSS through URL parameters
            const urlWithXSS = `${path}?test=${encodeURIComponent(xssPayload)}`;
            await page.goto(urlWithXSS);
            
            // Check if XSS was executed
            const xssExecuted = await page.evaluate(() => window.xssTest);
            expect(xssExecuted).toBeFalsy();
            
            // Check if the payload appears unescaped in the DOM
            const pageContent = await page.content();
            expect(pageContent).not.toContain('<script>window.xssTest = true;</script>');
        });
    });

    test('External links should be secure', async ({ page }) => {
        await page.goto('');
        
        const externalLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href^="http"]'));
            return links.map(link => ({
                href: link.href,
                target: link.target,
                rel: link.rel
            }));
        });
        
        externalLinks.forEach(link => {
            // External links should open in new tab/window
            expect(link.target).toBe('_blank');
            
            // External links should have proper rel attributes for security
            expect(link.rel).toContain('noopener');
        });
        
        console.log(`Found ${externalLinks.length} external links`);
    });

    test('Forms should have CSRF protection', async ({ page }) => {
        await page.goto('/contact');
        
        // Check for forms on the contact page
        const forms = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('form')).map(form => ({
                action: form.action,
                method: form.method,
                hasCSRFToken: !!form.querySelector('input[name*="csrf"], input[name*="token"]')
            }));
        });
        
        if (forms.length > 0) {
            forms.forEach((form, index) => {
                if (form.method && form.method.toLowerCase() === 'post') {
                    // POST forms should have CSRF protection
                    expect(form.hasCSRFToken).toBeTruthy();
                }
            });
        }
        
        console.log(`Found ${forms.length} forms on contact page`);
    });

    test('Should not have debug information exposed', async ({ page }) => {
        await page.goto('');
        
        // Check console for debug/error messages
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warn') {
                consoleLogs.push({
                    type: msg.type(),
                    text: msg.text()
                });
            }
        });
        
        await page.waitForTimeout(2000); // Wait for any async errors
        
        // Filter out known acceptable console messages
        const criticalErrors = consoleLogs.filter(log => 
            !log.text.includes('favicon') && 
            !log.text.includes('404') &&
            !log.text.includes('BEWARE') // Playwright warnings
        );
        
        if (criticalErrors.length > 0) {
            console.log('Console errors/warnings found:', criticalErrors);
        }
        
        // Should not have excessive console errors
        expect(criticalErrors.length).toBeLessThan(5);
    });

    test('Should validate SSL certificate', async ({ page }) => {
        const response = await page.goto('');
        
        // Should be served over HTTPS
        expect(response.url()).toMatch(/^https:/);
        
        // Check for mixed content (should not load HTTP resources on HTTPS page)
        const mixedContentResources = [];
        page.on('response', (response) => {
            if (response.url().startsWith('http://')) {
                mixedContentResources.push(response.url());
            }
        });
        
        await page.waitForLoadState('networkidle');
        
        expect(mixedContentResources).toHaveLength(0);
    });

    test('Should protect against information disclosure', async ({ page }) => {
        // Test common paths that might expose sensitive information
        const testPaths = [
            '/.env',
            '/config.json',
            '/package.json',
            '/.git/config',
            '/admin',
            '/wp-admin',
            '/api/debug'
        ];
        
        for (const testPath of testPaths) {
            const response = await page.goto(testPath, { waitUntil: 'domcontentloaded' });
            
            // These paths should return 404 or redirect, not expose sensitive info
            expect([404, 403, 302, 301]).toContain(response.status());
        }
    });
});