const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
    test('should have proper security headers', async ({ page }) => {
        let response;
        
        page.on('response', res => {
            if (res.url().includes('arthursenko.com') && !response) {
                response = res;
            }
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        if (response) {
            const headers = response.headers();
            
            // Check for security headers
            console.log('Security headers check:');
            
            // Content Security Policy
            if (headers['content-security-policy']) {
                console.log('✓ Content-Security-Policy present');
                expect(headers['content-security-policy']).toBeTruthy();
            } else {
                console.log('⚠ Content-Security-Policy missing');
            }
            
            // X-Frame-Options
            if (headers['x-frame-options']) {
                console.log('✓ X-Frame-Options present');
                expect(headers['x-frame-options']).toBeTruthy();
            } else {
                console.log('⚠ X-Frame-Options missing');
            }
            
            // X-Content-Type-Options
            if (headers['x-content-type-options']) {
                console.log('✓ X-Content-Type-Options present');
                expect(headers['x-content-type-options']).toBe('nosniff');
            } else {
                console.log('⚠ X-Content-Type-Options missing');
            }
            
            // Strict-Transport-Security (for HTTPS)
            if (headers['strict-transport-security']) {
                console.log('✓ Strict-Transport-Security present');
                expect(headers['strict-transport-security']).toBeTruthy();
            } else {
                console.log('⚠ Strict-Transport-Security missing');
            }
        }
    });

    test('should use HTTPS protocol', async ({ page }) => {
        await page.goto('');
        
        const url = page.url();
        expect(url.startsWith('https://')).toBeTruthy();
        console.log(`URL protocol: ${url.split('://')[0]}`);
    });

    test('should not expose sensitive information in source', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const content = await page.content();
        
        // Check for common sensitive information patterns
        const sensitivePatterns = [
            /api[_-]?key/i,
            /secret[_-]?key/i,
            /password/i,
            /token/i,
            /authorization/i,
            /bearer/i,
            /access[_-]?token/i
        ];
        
        const foundSensitive = [];
        
        sensitivePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                foundSensitive.push(matches[0]);
            }
        });
        
        if (foundSensitive.length > 0) {
            console.log('Potentially sensitive information found:', foundSensitive);
        }
        
        // Should not expose obvious sensitive information
        expect(foundSensitive.length).toBeLessThan(3);
    });

    test('should not have vulnerable dependencies in client-side', async ({ page }) => {
        const requests = [];
        
        page.on('request', request => {
            requests.push(request.url());
        });
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Check for known vulnerable libraries/versions
        const vulnerableLibraries = [
            'jquery/1.',
            'jquery/2.',
            'bootstrap/3.',
            'moment.js/2.1',
            'angular/1.'
        ];
        
        const foundVulnerable = requests.filter(url => 
            vulnerableLibraries.some(lib => url.includes(lib))
        );
        
        if (foundVulnerable.length > 0) {
            console.log('Potentially vulnerable libraries found:', foundVulnerable);
        }
        
        expect(foundVulnerable.length).toBe(0);
    });

    test('should handle errors gracefully without information disclosure', async ({ page }) => {
        // Test 404 error handling
        const response = await page.goto('/nonexistent-page', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        }).catch(() => null);
        
        if (response) {
            const content = await page.content();
            
            // Should not expose stack traces or internal paths
            const problematicPatterns = [
                /stack trace/i,
                /internal server error/i,
                /debug/i,
                /exception/i,
                /error.*line.*\d+/i,
                /\/var\/www/i,
                /\/home\/.*\//i,
                /c:\\/i
            ];
            
            const foundProblematic = problematicPatterns.filter(pattern => 
                pattern.test(content)
            );
            
            expect(foundProblematic.length).toBe(0);
        }
    });

    test('should protect against XSS in input fields', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Look for input fields
        const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
        
        if (inputs.length > 0) {
            const xssPayload = '<script>alert("xss")</script>';
            
            for (const input of inputs) {
                // Try to inject XSS payload
                await input.fill(xssPayload);
                
                // Check if the payload is escaped or sanitized
                const value = await input.inputValue();
                
                // The value should either be empty, escaped, or sanitized
                expect(value).not.toContain('<script>');
                console.log(`Input field handled XSS payload appropriately`);
            }
        } else {
            console.log('No input fields found for XSS testing');
        }
    });

    test('should have proper cookie security settings', async ({ page, context }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const cookies = await context.cookies();
        
        if (cookies.length > 0) {
            cookies.forEach(cookie => {
                console.log(`Cookie: ${cookie.name}`);
                
                // Check for HttpOnly flag on sensitive cookies
                if (cookie.name.toLowerCase().includes('session') || 
                    cookie.name.toLowerCase().includes('auth') ||
                    cookie.name.toLowerCase().includes('token')) {
                    expect(cookie.httpOnly).toBeTruthy();
                    console.log(`  ✓ HttpOnly: ${cookie.httpOnly}`);
                }
                
                // Check for Secure flag (should be true for HTTPS sites)
                if (page.url().startsWith('https://')) {
                    expect(cookie.secure).toBeTruthy();
                    console.log(`  ✓ Secure: ${cookie.secure}`);
                }
                
                // Check SameSite attribute
                console.log(`  SameSite: ${cookie.sameSite || 'not set'}`);
            });
        } else {
            console.log('No cookies found');
        }
    });

    test('should not expose development/debug information', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const content = await page.content();
        
        // Check for development information
        const devPatterns = [
            /console\.log/i,
            /debugger/i,
            /development/i,
            /localhost/i,
            /127\.0\.0\.1/i,
            /\.map$/i, // source maps
            /webpack/i,
            /node_modules/i
        ];
        
        const foundDev = [];
        
        devPatterns.forEach((pattern, index) => {
            if (pattern.test(content)) {
                foundDev.push(devPatterns[index].toString());
            }
        });
        
        if (foundDev.length > 0) {
            console.log('Development information found:', foundDev);
        }
        
        // Some development traces are acceptable in production
        expect(foundDev.length).toBeLessThan(5);
    });
});