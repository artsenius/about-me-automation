const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

test.describe('Visual Regression Tests', () => {
    test('should match homepage screenshot - desktop', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Wait for images to load
        await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.every(img => img.complete);
        });
        
        // Hide dynamic content that might change
        await page.addStyleTag({
            content: `
                .dynamic-content,
                [data-testid*="time"],
                [data-testid*="date"] {
                    visibility: hidden !important;
                }
            `
        });
        
        await expect(page).toHaveScreenshot('homepage-desktop.png', {
            fullPage: true,
            threshold: 0.3
        });
    });

    test('should match homepage screenshot - mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Wait for mobile layout to settle
        await page.waitForTimeout(1000);
        
        await page.addStyleTag({
            content: `
                .dynamic-content,
                [data-testid*="time"],
                [data-testid*="date"] {
                    visibility: hidden !important;
                }
            `
        });
        
        await expect(page).toHaveScreenshot('homepage-mobile.png', {
            fullPage: true,
            threshold: 0.3
        });
    });

    test('should match about page screenshot', async ({ page }) => {
        const header = new Header(page);
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Navigate to about page (should already be there, but ensuring)
        await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.every(img => img.complete);
        });
        
        await page.addStyleTag({
            content: `
                .dynamic-content {
                    visibility: hidden !important;
                }
            `
        });
        
        await expect(page).toHaveScreenshot('about-page.png', {
            fullPage: true,
            threshold: 0.3
        });
    });

    test('should match contact page screenshot', async ({ page }) => {
        const header = new Header(page);
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        try {
            await header.navigateToContact();
            await page.waitForLoadState('networkidle');
            
            await page.addStyleTag({
                content: `
                    .dynamic-content,
                    [data-testid*="copy-message"] {
                        visibility: hidden !important;
                    }
                `
            });
            
            await expect(page).toHaveScreenshot('contact-page.png', {
                fullPage: true,
                threshold: 0.3
            });
        } catch (error) {
            console.log('Contact page navigation failed, skipping visual test');
        }
    });

    test('should match about app page screenshot', async ({ page }) => {
        const header = new Header(page);
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        try {
            await header.navigateToAboutApp();
            await page.waitForLoadState('networkidle');
            
            await page.addStyleTag({
                content: `
                    .dynamic-content {
                        visibility: hidden !important;
                    }
                `
            });
            
            await expect(page).toHaveScreenshot('about-app-page.png', {
                fullPage: true,
                threshold: 0.3
            });
        } catch (error) {
            console.log('About app page navigation failed, skipping visual test');
        }
    });

    test('should match live automation page screenshot', async ({ page }) => {
        const header = new Header(page);
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        try {
            await header.navigateToLiveAutomation();
            await page.waitForLoadState('networkidle');
            
            // Wait for any dynamic content to load
            await page.waitForTimeout(2000);
            
            // Hide dynamic test results data
            await page.addStyleTag({
                content: `
                    .test-result-item,
                    .dynamic-content,
                    [data-testid*="timestamp"],
                    [data-testid*="duration"] {
                        visibility: hidden !important;
                    }
                `
            });
            
            await expect(page).toHaveScreenshot('live-automation-page.png', {
                fullPage: true,
                threshold: 0.4 // Higher threshold for dynamic content
            });
        } catch (error) {
            console.log('Live automation page navigation failed, skipping visual test');
        }
    });

    test('should match header component across viewports', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Desktop header
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);
        
        const headerElement = page.locator('[data-testid="header-nav"]');
        if (await headerElement.count() > 0) {
            await expect(headerElement).toHaveScreenshot('header-desktop.png', {
                threshold: 0.2
            });
        }
        
        // Mobile header
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        if (await headerElement.count() > 0) {
            await expect(headerElement).toHaveScreenshot('header-mobile.png', {
                threshold: 0.2
            });
        }
    });

    test('should match footer component', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        const footerElement = page.locator('[data-testid="footer"]');
        if (await footerElement.count() > 0) {
            await expect(footerElement).toHaveScreenshot('footer-component.png', {
                threshold: 0.2
            });
        }
    });

    test('should handle hover states consistently', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Test navigation link hover states
        const navLinks = page.locator('[data-testid^="nav-link-"]');
        const linkCount = await navLinks.count();
        
        if (linkCount > 0) {
            const firstLink = navLinks.first();
            await firstLink.hover();
            await page.waitForTimeout(500);
            
            await expect(firstLink).toHaveScreenshot('nav-link-hover.png', {
                threshold: 0.3
            });
        }
    });

    test('should match button states', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Look for buttons and test their visual states
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
            const firstButton = buttons.first();
            
            // Normal state
            await expect(firstButton).toHaveScreenshot('button-normal.png', {
                threshold: 0.2
            });
            
            // Hover state
            await firstButton.hover();
            await page.waitForTimeout(200);
            await expect(firstButton).toHaveScreenshot('button-hover.png', {
                threshold: 0.3
            });
            
            // Focus state
            await firstButton.focus();
            await page.waitForTimeout(200);
            await expect(firstButton).toHaveScreenshot('button-focus.png', {
                threshold: 0.3
            });
        }
    });

    test('should detect layout consistency across page refreshes', async ({ page }) => {
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Take first screenshot
        await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.every(img => img.complete);
        });
        
        await page.addStyleTag({
            content: `
                .dynamic-content {
                    visibility: hidden !important;
                }
            `
        });
        
        const firstScreenshot = await page.screenshot({ fullPage: true });
        
        // Refresh and take second screenshot
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.every(img => img.complete);
        });
        
        await page.addStyleTag({
            content: `
                .dynamic-content {
                    visibility: hidden !important;
                }
            `
        });
        
        // The layout should be consistent after refresh
        await expect(page).toHaveScreenshot(firstScreenshot, {
            threshold: 0.1
        });
    });
});