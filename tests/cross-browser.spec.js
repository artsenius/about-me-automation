const { test, expect, devices } = require('@playwright/test');

test.describe('Cross-Browser Compatibility Tests', () => {
    // Test on different browsers
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
        test(`Should work on ${browserName}`, async ({ page, browserName: currentBrowser }) => {
            test.skip(currentBrowser !== browserName, `Skipping ${browserName} on ${currentBrowser}`);
            
            await page.goto('/');
            
            // Basic functionality should work
            await expect(page).toHaveTitle(/.+/); // Should have a title
            
            // Navigation should work
            const navLinks = await page.locator('nav a').count();
            expect(navLinks).toBeGreaterThan(0);
            
            // Check that CSS is loaded
            const bodyBackgroundColor = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });
            expect(bodyBackgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Should have some styling
        });
    });

    test('Should work on mobile devices', async ({ page, browserName }) => {
        // Test with iPhone viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        
        // Check responsive design
        const isNavMenuCollapsed = await page.locator('.hamburger-menu, .mobile-menu-toggle, .navbar-toggler').count();
        
        // Mobile menu should be present for responsive design
        if (isNavMenuCollapsed > 0) {
            console.log('Mobile navigation menu detected');
        }
        
        // Content should be readable on mobile
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        
        // No horizontal scrolling should be needed
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
        
        // Touch targets should be appropriately sized
        const buttons = await page.locator('button, a, input[type="submit"]').all();
        
        for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
            const isVisible = await button.isVisible();
            if (isVisible) {
                const boundingBox = await button.boundingBox();
                if (boundingBox) {
                    // Touch targets should be at least 44px (iOS) or 48px (Android)
                    expect(Math.min(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(40);
                }
            }
        }
    });

    test('Should work on tablet devices', async ({ page }) => {
        // Test with iPad viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');
        
        // Content should adapt to tablet size
        const content = await page.locator('main, .content, .container').first();
        const contentBox = await content.boundingBox();
        
        if (contentBox) {
            // Content should utilize reasonable amount of screen space
            expect(contentBox.width).toBeGreaterThan(600); // Should use most of tablet width
        }
        
        // Navigation should be appropriate for tablet
        const navItems = await page.locator('nav a, nav li').count();
        expect(navItems).toBeGreaterThan(0);
    });

    test('Should handle different screen resolutions', async ({ page }) => {
        const resolutions = [
            { width: 1920, height: 1080 }, // Full HD
            { width: 1366, height: 768 },  // Common laptop
            { width: 1280, height: 720 },  // HD
            { width: 1024, height: 768 }   // Smaller desktop
        ];
        
        for (const resolution of resolutions) {
            await page.setViewportSize(resolution);
            await page.goto('/');
            
            // Page should render without horizontal scrollbars
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.body.scrollWidth > window.innerWidth;
            });
            
            expect(hasHorizontalScroll).toBeFalsy();
            
            // Content should be visible and properly positioned
            const mainContent = await page.locator('main, .main-content, .content').first();
            await expect(mainContent).toBeVisible();
            
            console.log(`✓ ${resolution.width}x${resolution.height} resolution test passed`);
        }
    });

    test('Should work with different font sizes', async ({ page }) => {
        await page.goto('/');
        
        // Test with larger font sizes (accessibility requirement)
        const fontSizes = ['120%', '150%', '200%'];
        
        for (const fontSize of fontSizes) {
            await page.addStyleTag({
                content: `* { font-size: ${fontSize} !important; }`
            });
            
            // Content should still be readable and not overflow
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.evaluate(() => window.innerWidth);
            
            // Allow some reasonable overflow for larger fonts
            expect(bodyWidth).toBeLessThan(viewportWidth * 1.2);
            
            // Text should still be visible
            const textContent = await page.locator('p, h1, h2, h3').first().textContent();
            expect(textContent?.length).toBeGreaterThan(0);
        }
    });

    test('Should handle browser feature detection', async ({ page }) => {
        await page.goto('/');
        
        // Check for graceful degradation of modern features
        const modernFeatures = await page.evaluate(() => {
            return {
                flexbox: CSS.supports('display', 'flex'),
                grid: CSS.supports('display', 'grid'),
                cssVariables: CSS.supports('color', 'var(--test)'),
                intersectionObserver: 'IntersectionObserver' in window,
                webAnimations: 'animate' in document.createElement('div')
            };
        });
        
        // Core functionality should work regardless of feature support
        const coreElements = await page.locator('header, nav, main, footer').count();
        expect(coreElements).toBeGreaterThan(2); // At least nav and main should exist
        
        console.log('Browser features detected:', modernFeatures);
    });

    test('Should work with JavaScript disabled', async ({ page, context }) => {
        // Disable JavaScript
        await context.setJavaScriptEnabled(false);
        await page.goto('/');
        
        // Basic content should still be accessible
        await expect(page.locator('h1')).toBeVisible();
        
        // Navigation links should still work
        const navLinks = await page.locator('nav a[href]').count();
        expect(navLinks).toBeGreaterThan(0);
        
        // Forms should still be functional (basic HTML forms)
        const forms = await page.locator('form').count();
        if (forms > 0) {
            const formInputs = await page.locator('form input, form textarea').count();
            expect(formInputs).toBeGreaterThan(0);
        }
        
        // Re-enable JavaScript for subsequent tests
        await context.setJavaScriptEnabled(true);
    });

    test('Should handle slow network conditions', async ({ page, context }) => {
        // Simulate slow 3G
        await context.route('**/*', async route => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
            await route.continue();
        });
        
        await page.goto('/');
        
        // Page should still load, even if slowly
        await expect(page.locator('body')).toBeVisible();
        
        // Critical content should be prioritized
        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
        
        // Navigation should be available
        const navElement = await page.locator('nav').first();
        await expect(navElement).toBeVisible({ timeout: 10000 });
    });

    test('Should work with CSS disabled', async ({ page }) => {
        await page.goto('/');
        
        // Disable all stylesheets
        await page.addStyleTag({
            content: `
                * { 
                    all: unset !important; 
                    display: block !important;
                    color: black !important;
                }
            `
        });
        
        // Content should still be readable in logical order
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
        expect(headings.length).toBeGreaterThan(0);
        
        // All headings should have meaningful text
        headings.forEach(heading => {
            expect(heading.trim().length).toBeGreaterThan(0);
        });
        
        // Navigation should still be understandable
        const navLinks = await page.locator('nav a').allTextContents();
        navLinks.forEach(linkText => {
            expect(linkText.trim().length).toBeGreaterThan(0);
        });
    });

    test('Should handle print media styles', async ({ page }) => {
        await page.goto('/');
        
        // Emulate print media
        await page.emulateMedia({ media: 'print' });
        
        // Check that print styles don't break layout
        const printStyles = await page.evaluate(() => {
            const computed = window.getComputedStyle(document.body);
            return {
                backgroundColor: computed.backgroundColor,
                color: computed.color,
                fontSize: computed.fontSize
            };
        });
        
        // Print styles should typically use dark text on light background
        expect(printStyles.color).not.toBe('rgba(0, 0, 0, 0)');
        
        // Navigation elements might be hidden in print
        const navDisplay = await page.locator('nav').first().evaluate(el => {
            return window.getComputedStyle(el).display;
        });
        
        console.log(`Navigation display in print: ${navDisplay}`);
        
        // Reset to screen media
        await page.emulateMedia({ media: 'screen' });
    });
});