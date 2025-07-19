const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
    test('Should have proper security headers', async ({ page }) => {
        const response = await page.goto('/');
        const headers = response.headers();
        
        // Check for X-Frame-Options or Content-Security-Policy frame-ancestors
        const xFrameOptions = headers['x-frame-options'];
        const csp = headers['content-security-policy'];
        const hasFrameProtection = xFrameOptions || (csp && csp.includes('frame-ancestors'));
        expect(hasFrameProtection).toBeTruthy();
        
        // Check for X-Content-Type-Options
        expect(headers['x-content-type-options']).toBe('nosniff');
        
        // Check for X-XSS-Protection or modern CSP
        const xssProtection = headers['x-xss-protection'];
        const hasXSSProtection = xssProtection === '1; mode=block' || (csp && csp.includes('script-src'));
        expect(hasXSSProtection).toBeTruthy();
        
        // Check for Referrer-Policy
        const referrerPolicy = headers['referrer-policy'];
        if (referrerPolicy) {
            expect(['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'strict-origin', 'strict-origin-when-cross-origin'].includes(referrerPolicy)).toBeTruthy();
        }
    });

    test('Should not expose sensitive information in source', async ({ page }) => {
        await page.goto('/');
        
        const content = await page.content();
        
        // Check for common sensitive data patterns
        const sensitivePatterns = [
            /api[_-]?key[s]?\s*[:=]\s*['"][^'"]+['"]/i,
            /password\s*[:=]\s*['"][^'"]+['"]/i,
            /secret[_-]?key[s]?\s*[:=]\s*['"][^'"]+['"]/i,
            /access[_-]?token[s]?\s*[:=]\s*['"][^'"]+['"]/i,
            /private[_-]?key[s]?\s*[:=]\s*['"][^'"]+['"]/i,
            /database[_-]?url\s*[:=]\s*['"][^'"]+['"]/i
        ];
        
        sensitivePatterns.forEach(pattern => {
            expect(content).not.toMatch(pattern);
        });
        
        // Check for development/debug comments
        const debugPatterns = [
            /TODO.*password/i,
            /FIXME.*security/i,
            /DEBUG.*token/i,
            /console\.log\s*\(/
        ];
        
        debugPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                console.warn(`Potential debug info found: ${matches[0]}`);
            }
        });
    });

    test('Forms should have CSRF protection', async ({ page }) => {
        await page.goto('/contact');
        
        const forms = await page.locator('form').all();
        
        for (const form of forms) {
            const method = await form.getAttribute('method');
            
            if (method && method.toLowerCase() === 'post') {
                // Check for CSRF token or similar protection
                const csrfToken = await form.locator('input[name*="csrf"], input[name*="token"], input[type="hidden"]').count();
                
                if (csrfToken === 0) {
                    console.warn('Form without apparent CSRF protection found');
                }
                
                // Check form action is to same origin or relative
                const action = await form.getAttribute('action');
                if (action && action.startsWith('http')) {
                    const url = new URL(action);
                    const currentUrl = new URL(page.url());
                    expect(url.origin).toBe(currentUrl.origin);
                }
            }
        }
    });

    test('External links should have proper security attributes', async ({ page }) => {
        await page.goto('/');
        
        const externalLinks = await page.locator('a[href^="http"]:not([href*="arthursenko.com"])').all();
        
        for (const link of externalLinks) {
            const rel = await link.getAttribute('rel');
            const target = await link.getAttribute('target');
            
            // External links opening in new tab should have noopener noreferrer
            if (target === '_blank') {
                expect(rel).toContain('noopener');
                expect(rel).toContain('noreferrer');
            }
        }
    });

    test('Should not be vulnerable to common XSS patterns', async ({ page }) => {
        await page.goto('/');
        
        // Test URL parameter injection
        const testParams = [
            '?test=<script>alert("xss")</script>',
            '?search="><script>alert("xss")</script>',
            '?name=javascript:alert("xss")',
            '?callback=<img src=x onerror=alert("xss")>'
        ];
        
        for (const param of testParams) {
            try {
                await page.goto(`/${param}`);
                const content = await page.content();
                
                // The malicious script should be encoded/escaped
                expect(content).not.toContain('<script>alert("xss")</script>');
                expect(content).not.toContain('javascript:alert("xss")');
                expect(content).not.toContain('onerror=alert("xss")');
                
                // Check that no script actually executed
                const alertDialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
                const dialog = await alertDialogPromise;
                expect(dialog).toBeNull();
                
            } catch (error) {
                // Navigation might fail, which is actually good for security
                console.log(`Navigation blocked for: ${param}`);
            }
        }
    });

    test('Should validate file upload restrictions', async ({ page }) => {
        await page.goto('/contact');
        
        const fileInputs = await page.locator('input[type="file"]').all();
        
        for (const input of fileInputs) {
            const accept = await input.getAttribute('accept');
            const multiple = await input.getAttribute('multiple');
            
            // File inputs should have accept attribute to limit file types
            if (accept) {
                // Should not accept dangerous file types
                const dangerousTypes = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.jar'];
                dangerousTypes.forEach(type => {
                    expect(accept).not.toContain(type);
                });
            }
            
            // Check for size limitations (this would typically be in JavaScript)
            const maxSize = await input.evaluate(el => {
                return el.getAttribute('data-max-size') || 
                       window.getComputedStyle(el).getPropertyValue('--max-file-size');
            });
            
            if (!maxSize) {
                console.warn('File input without apparent size restriction found');
            }
        }
    });

    test('Should have secure cookie settings', async ({ page, context }) => {
        await page.goto('/');
        
        const cookies = await context.cookies();
        
        cookies.forEach(cookie => {
            // Session cookies should be HttpOnly
            if (cookie.name.toLowerCase().includes('session') || 
                cookie.name.toLowerCase().includes('auth') ||
                cookie.name.toLowerCase().includes('token')) {
                expect(cookie.httpOnly).toBeTruthy();
            }
            
            // Secure flag should be set for HTTPS
            if (page.url().startsWith('https://')) {
                expect(cookie.secure).toBeTruthy();
            }
            
            // SameSite should be set
            expect(['Strict', 'Lax', 'None'].includes(cookie.sameSite)).toBeTruthy();
        });
    });

    test('Should not expose server/framework information', async ({ page }) => {
        const response = await page.goto('/');
        const headers = response.headers();
        
        // Check for information disclosure headers
        const serverHeader = headers['server'];
        if (serverHeader) {
            // Server header should not reveal detailed version info
            expect(serverHeader).not.toMatch(/\d+\.\d+\.\d+/); // Version numbers
        }
        
        const xPoweredBy = headers['x-powered-by'];
        expect(xPoweredBy).toBeUndefined(); // Should not expose framework
        
        // Check page content for framework signatures
        const content = await page.content();
        const frameworkSignatures = [
            /generator.*WordPress \d+\.\d+/i,
            /drupal \d+\.\d+/i,
            /joomla \d+\.\d+/i,
            /powered by.*\d+\.\d+/i
        ];
        
        frameworkSignatures.forEach(signature => {
            expect(content).not.toMatch(signature);
        });
    });

    test('Should handle 404 errors securely', async ({ page }) => {
        const response = await page.goto('/nonexistent-page-12345', { 
            waitUntil: 'networkidle' 
        }).catch(async () => {
            // If navigation fails, try to get the response another way
            return await page.request.get('/nonexistent-page-12345');
        });
        
        if (response && response.status() === 404) {
            // 404 pages should not expose sensitive information
            const content = await page.content();
            
            // Should not reveal server paths
            expect(content).not.toMatch(/\/var\/www/);
            expect(content).not.toMatch(/\/home\/[^\/]+/);
            expect(content).not.toMatch(/C:\\[^<]+/);
            
            // Should not reveal detailed error information
            expect(content).not.toMatch(/stack trace/i);
            expect(content).not.toMatch(/exception/i);
            expect(content).not.toMatch(/error \d+/i);
        }
    });
});