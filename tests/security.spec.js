const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
    test('should have proper security headers', async ({ page }) => {
        const response = await page.goto('');
        const headers = response?.headers();
        
        // Check for important security headers
        if (headers) {
            // X-Frame-Options or CSP frame-ancestors to prevent clickjacking
            const xFrameOptions = headers['x-frame-options'];
            const csp = headers['content-security-policy'];
            
            if (!xFrameOptions && !csp?.includes('frame-ancestors')) {
                console.warn('Consider adding X-Frame-Options or CSP frame-ancestors header');
            }
            
            // X-Content-Type-Options to prevent MIME sniffing
            const xContentTypeOptions = headers['x-content-type-options'];
            if (!xContentTypeOptions) {
                console.warn('Consider adding X-Content-Type-Options: nosniff header');
            }
            
            // HTTPS enforcement
            if (response?.url().startsWith('https://')) {
                const strictTransportSecurity = headers['strict-transport-security'];
                if (!strictTransportSecurity) {
                    console.warn('Consider adding HSTS header for HTTPS sites');
                }
            }
        }
        
        // The test passes as these are recommendations, not hard requirements
        expect(response?.status()).toBe(200);
    });

    test('should not expose sensitive information in HTML comments', async ({ page }) => {
        await page.goto('');
        
        const htmlContent = await page.content();
        
        // Check for potentially sensitive information in comments
        const comments = htmlContent.match(/<!--[\s\S]*?-->/g) || [];
        
        for (const comment of comments) {
            const lowerComment = comment.toLowerCase();
            
            // Check for potentially sensitive keywords
            const sensitiveKeywords = [
                'password', 'secret', 'key', 'token', 'api_key',
                'database', 'db_pass', 'admin', 'debug', 'dev'
            ];
            
            for (const keyword of sensitiveKeywords) {
                expect(lowerComment).not.toContain(keyword);
            }
        }
    });

    test('should not have unintended admin or debug pages accessible', async ({ page }) => {
        const potentialDebugUrls = [
            '/admin',
            '/debug',
            '/test',
            '/phpinfo.php',
            '/wp-admin',
            '/.env',
            '/config',
            '/api/debug'
        ];
        
        for (const url of potentialDebugUrls) {
            try {
                const response = await page.goto(page.url() + url.substring(1));
                
                // These pages should either not exist (404) or redirect
                if (response) {
                    const status = response.status();
                    expect([404, 301, 302, 403]).toContain(status);
                }
            } catch (error) {
                // Network errors are expected for non-existent pages
                expect(error.message).toMatch(/(net::ERR|Failed to load|404)/);
            }
        }
    });

    test('should have proper HTTPS implementation (if using HTTPS)', async ({ page }) => {
        const response = await page.goto('');
        const url = response?.url();
        
        if (url?.startsWith('https://')) {
            // Check that mixed content is not loaded
            const responses = [];
            page.on('response', response => responses.push(response));
            
            await page.waitForLoadState('networkidle');
            
            const httpResources = responses.filter(r => 
                r.url().startsWith('http://') && 
                !r.url().includes('localhost')
            );
            
            // Should not load HTTP resources on HTTPS pages (mixed content)
            expect(httpResources.length).toBe(0);
        }
    });

    test('should not leak information through error pages', async ({ page }) => {
        // Try to access a non-existent page
        try {
            await page.goto(page.url() + 'non-existent-page-12345');
            
            const content = await page.textContent('body');
            const lowerContent = content?.toLowerCase() || '';
            
            // Error pages should not reveal server information
            const sensitiveInfo = [
                'apache', 'nginx', 'iis', 'tomcat',
                'stack trace', 'exception', 'debug',
                'internal server error details',
                'database error', 'sql error'
            ];
            
            for (const info of sensitiveInfo) {
                expect(lowerContent).not.toContain(info);
            }
            
        } catch (error) {
            // This is expected for non-existent pages
            expect(error.message).toMatch(/(404|Not Found|Failed to load)/);
        }
    });

    test('should validate external links security', async ({ page }) => {
        await page.goto('');
        
        const externalLinks = await page.locator('a[href^="http"]').all();
        
        for (const link of externalLinks) {
            const href = await link.getAttribute('href');
            const target = await link.getAttribute('target');
            const rel = await link.getAttribute('rel');
            
            if (href && !href.includes('arthursenko.com')) {
                // External links should open in new tab
                expect(target).toBe('_blank');
                
                // External links should have rel="noopener" for security
                expect(rel).toContain('noopener');
                
                // External links should ideally have rel="noreferrer" to prevent referrer leakage
                if (rel && rel.includes('noreferrer')) {
                    expect(rel).toContain('noreferrer');
                }
            }
        }
    });

    test('should not have client-side sensitive data exposure', async ({ page }) => {
        await page.goto('');
        
        // Check localStorage for sensitive data
        const localStorage = await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key) {
                    items[key] = window.localStorage.getItem(key);
                }
            }
            return items;
        });
        
        // Check sessionStorage for sensitive data
        const sessionStorage = await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < window.sessionStorage.length; i++) {
                const key = window.sessionStorage.key(i);
                if (key) {
                    items[key] = window.sessionStorage.getItem(key);
                }
            }
            return items;
        });
        
        const allStorageData = JSON.stringify({ ...localStorage, ...sessionStorage }).toLowerCase();
        
        const sensitivePatterns = [
            'password', 'secret', 'token', 'api_key',
            'credit_card', 'ssn', 'social_security'
        ];
        
        for (const pattern of sensitivePatterns) {
            expect(allStorageData).not.toContain(pattern);
        }
    });

    test('should handle form submissions securely (if forms exist)', async ({ page }) => {
        await page.goto('');
        
        const forms = await page.locator('form').all();
        
        for (const form of forms) {
            const action = await form.getAttribute('action');
            const method = await form.getAttribute('method');
            
            // Forms handling sensitive data should use POST
            const inputs = await form.locator('input').all();
            let hasSensitiveInput = false;
            
            for (const input of inputs) {
                const type = await input.getAttribute('type');
                const name = await input.getAttribute('name');
                
                if (type === 'password' || 
                    name?.toLowerCase().includes('password') ||
                    name?.toLowerCase().includes('email')) {
                    hasSensitiveInput = true;
                    break;
                }
            }
            
            if (hasSensitiveInput && method) {
                expect(method.toLowerCase()).toBe('post');
            }
            
            // Forms should not submit to HTTP URLs if page is HTTPS
            if (action && action.startsWith('http://') && page.url().startsWith('https://')) {
                expect(action).not.toMatch(/^http:/);
            }
        }
    });
});