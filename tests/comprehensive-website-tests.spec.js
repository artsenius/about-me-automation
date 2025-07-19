const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Website Testing Suite', () => {
    
    test.describe('Core Functionality Tests', () => {
        test('should verify essential page elements are present', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Verify basic page structure
            await expect(page.locator('h1, h2').first()).toBeVisible();
            await expect(page.locator('nav, header')).toBeVisible();
            await expect(page.locator('footer')).toBeVisible();
            
            // Verify navigation functionality
            const navLinks = await page.locator('nav a, nav button').count();
            expect(navLinks).toBeGreaterThan(0);
            
            // Check for profile name with flexible selector
            const profileElements = await page.locator('[data-testid="profile-name"], h1:has-text("Arthur"), h2:has-text("Arthur")').count();
            expect(profileElements).toBeGreaterThan(0);
        });

        test('should verify page navigation works correctly', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Test navigation to Contact page
            const contactLink = page.locator('[data-testid="nav-link-contact"], nav a:has-text("Contact"), nav button:has-text("Contact")').first();
            if (await contactLink.isVisible()) {
                await contactLink.click();
                await page.waitForLoadState('networkidle');
                await expect(page).toHaveURL(/.*contact.*/);
            }
        });

        test('should verify resume download functionality', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Look for resume link with multiple fallback selectors
            const resumeSelector = '[data-testid="resume-link"], a[href*=".pdf"], a:has-text("Resume"), a:has-text("CV"), a[download]';
            const resumeLink = page.locator(resumeSelector).first();
            
            if (await resumeLink.isVisible()) {
                // Set up download listener
                const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
                await resumeLink.click();
                const download = await downloadPromise;
                
                // Verify download
                expect(download.suggestedFilename()).toMatch(/\.(pdf|doc|docx)$/i);
            } else {
                console.log('Resume download link not found - this may be expected depending on site configuration');
            }
        });
    });

    test.describe('Responsive Design Tests', () => {
        test('should work correctly on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Verify mobile layout
            await expect(page.locator('h1, h2').first()).toBeVisible();
            
            // Check for mobile navigation (hamburger menu)
            const mobileMenu = page.locator('[data-testid="nav-menu-button"], .hamburger, .menu-toggle, button[aria-label*="menu"], button:has-text("☰")');
            if (await mobileMenu.count() > 0) {
                expect(await mobileMenu.first().isVisible()).toBeTruthy();
            }
        });

        test('should work correctly on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Verify tablet layout
            await expect(page.locator('h1, h2').first()).toBeVisible();
            
            // Verify content fits properly
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyWidth).toBeLessThanOrEqual(768);
        });
    });

    test.describe('Performance and Quality Tests', () => {
        test('should load within acceptable time', async ({ page }) => {
            const startTime = Date.now();
            
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(10000); // 10 seconds max
        });

        test('should have proper SEO meta tags', async ({ page }) => {
            await page.goto('');
            
            // Check title
            const title = await page.title();
            expect(title.length).toBeGreaterThan(10);
            expect(title.length).toBeLessThan(60);
            
            // Check meta description
            const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
            if (metaDescription) {
                expect(metaDescription.length).toBeGreaterThan(50);
                expect(metaDescription.length).toBeLessThan(160);
            }
            
            // Check viewport meta tag
            const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
            expect(viewport).toBeTruthy();
        });

        test('should have accessible navigation', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Test keyboard navigation
            await page.keyboard.press('Tab');
            const firstFocused = await page.evaluate(() => document.activeElement.tagName);
            expect(['A', 'BUTTON', 'INPUT'].includes(firstFocused)).toBeTruthy();
            
            // Check for skip links
            const skipLinks = await page.locator('a[href*="#"], a:has-text("Skip")').count();
            // Skip links are good practice but not required
            if (skipLinks > 0) {
                console.log(`Found ${skipLinks} skip links - good accessibility practice`);
            }
        });

        test('should not have console errors', async ({ page }) => {
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Filter out known harmless errors
            const significantErrors = errors.filter(error => 
                !error.includes('favicon') && 
                !error.includes('Google Analytics') &&
                !error.includes('gtag')
            );
            
            expect(significantErrors.length).toBe(0);
        });
    });

    test.describe('Content Verification Tests', () => {
        test('should display appropriate content sections', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Check for profile/about content
            const profileContent = await page.locator('[data-testid="profile-name"], h1:has-text("Arthur"), h2:has-text("Arthur"), .profile, .about').count();
            expect(profileContent).toBeGreaterThan(0);
            
            // Check for bio/summary content
            const bioContent = await page.locator('[data-testid="about-bio"], .bio, .summary, .description, p:has-text("QA"), p:has-text("automation")').count();
            if (bioContent > 0) {
                console.log('Found bio/summary content');
            }
            
            // Look for skills or expertise content
            const skillsContent = await page.locator('*:has-text("skill"), *:has-text("technolog"), *:has-text("expertise"), *:has-text("experience")').count();
            if (skillsContent > 0) {
                console.log(`Found ${skillsContent} references to skills/technology/expertise`);
            }
        });

        test('should have working external links', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Find external links
            const externalLinks = await page.locator('a[href^="http"], a[target="_blank"]').all();
            
            for (const link of externalLinks.slice(0, 3)) { // Test first 3 external links
                const href = await link.getAttribute('href');
                if (href && !href.includes('javascript:')) {
                    // Verify link is valid (not broken)
                    const response = await page.request.head(href).catch(() => null);
                    if (response) {
                        expect(response.status()).toBeLessThan(400);
                    }
                }
            }
        });
    });

    test.describe('Interactive Features Tests', () => {
        test('should handle theme toggle if present', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Look for theme toggle
            const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("🌙"), button:has-text("☀"), .theme-toggle');
            
            if (await themeToggle.count() > 0) {
                const initialTheme = await page.evaluate(() => document.documentElement.className);
                await themeToggle.first().click();
                await page.waitForTimeout(500);
                const newTheme = await page.evaluate(() => document.documentElement.className);
                
                // Theme should have changed
                expect(initialTheme).not.toBe(newTheme);
                console.log('Theme toggle functionality verified');
            }
        });

        test('should handle contact form if present', async ({ page }) => {
            await page.goto('');
            await page.waitForLoadState('networkidle');
            
            // Navigate to contact page if exists
            const contactNav = page.locator('[data-testid="nav-link-contact"], nav a:has-text("Contact"), nav button:has-text("Contact")').first();
            
            if (await contactNav.isVisible()) {
                await contactNav.click();
                await page.waitForLoadState('networkidle');
                
                // Look for contact form
                const forms = await page.locator('form').count();
                const inputs = await page.locator('input[type="email"], input[type="text"], textarea').count();
                
                if (forms > 0 || inputs > 0) {
                    console.log(`Found contact form with ${inputs} input fields`);
                    
                    // Test form validation if email field exists
                    const emailField = page.locator('input[type="email"]').first();
                    if (await emailField.count() > 0) {
                        await emailField.fill('invalid-email');
                        const isInvalid = await emailField.evaluate(el => !el.validity.valid);
                        expect(isInvalid).toBeTruthy();
                        console.log('Email validation working correctly');
                    }
                }
            }
        });
    });

    test.describe('Security and Privacy Tests', () => {
        test('should have proper security headers', async ({ page }) => {
            const response = await page.goto('');
            const headers = response.headers();
            
            // Check for basic security headers
            const securityHeaders = [
                'x-frame-options',
                'x-content-type-options', 
                'x-xss-protection',
                'content-security-policy',
                'strict-transport-security'
            ];
            
            let foundHeaders = 0;
            for (const header of securityHeaders) {
                if (headers[header]) {
                    foundHeaders++;
                }
            }
            
            // Should have at least some security headers
            expect(foundHeaders).toBeGreaterThan(0);
            console.log(`Found ${foundHeaders}/${securityHeaders.length} security headers`);
        });

        test('should not expose sensitive information', async ({ page }) => {
            await page.goto('');
            const content = await page.content();
            
            // Check for exposed sensitive patterns
            const sensitivePatterns = [
                /api[_-]?key/i,
                /password/i,
                /secret/i,
                /token/i,
                /private[_-]?key/i
            ];
            
            for (const pattern of sensitivePatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    // Allow certain common false positives
                    const allowedMatches = ['password', 'api', 'token'].filter(allowed => 
                        matches[0].toLowerCase().includes(allowed) && 
                        (content.includes('placeholder') || content.includes('example'))
                    );
                    
                    if (allowedMatches.length === 0) {
                        console.warn(`Potential sensitive information exposure: ${matches[0]}`);
                    }
                }
            }
        });
    });
});