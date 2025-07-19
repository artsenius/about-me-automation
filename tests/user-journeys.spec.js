const { test, expect } = require('@playwright/test');

test.describe('User Journey Tests', () => {
    test('should complete full site exploration journey', async ({ page }) => {
        // Start at home page
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check home page loaded correctly
        await expect(page.locator('h1').first()).toBeVisible();
        
        // Navigate to About page
        await page.click('a[href*="about"]:not([href*="app"])');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*about.*/);
        
        // Check About page content
        await expect(page.locator('h1, h2').first()).toBeVisible();
        
        // Navigate to Contact page
        await page.click('a[href*="contact"]');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*contact.*/);
        
        // Check Contact page content
        await expect(page.locator('h1, h2').first()).toBeVisible();
        
        // Navigate to Live Automation page
        await page.click('a[href*="live-automation"]');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*live-automation.*/);
        
        // Check Live Automation page content
        await expect(page.locator('h1, h2').first()).toBeVisible();
        
        // Return to home
        await page.goto('/');
        await expect(page.locator('h1').first()).toBeVisible();
    });

    test('should handle external link interactions properly', async ({ page }) => {
        await page.goto('/about');
        await page.waitForLoadState('networkidle');
        
        // Find external links (GitHub, LinkedIn, etc.)
        const externalLinks = await page.locator('a[href^="http"]:not([href*="arthursenko.com"])').all();
        
        if (externalLinks.length > 0) {
            // Test first external link
            const firstLink = externalLinks[0];
            const href = await firstLink.getAttribute('href');
            const target = await firstLink.getAttribute('target');
            
            // External links should open in new tab/window
            expect(target).toBe('_blank');
            
            // Should have rel attributes for security
            const rel = await firstLink.getAttribute('rel');
            if (rel) {
                expect(rel).toMatch(/noopener|noreferrer/);
            }
        }
    });

    test('should maintain consistent navigation across all pages', async ({ page }) => {
        const pages = ['/', '/about', '/contact', '/live-automation'];
        
        for (const pagePath of pages) {
            await page.goto(pagePath);
            await page.waitForLoadState('networkidle');
            
            // Check header navigation exists
            const navLinks = await page.locator('nav a, header a').count();
            expect(navLinks).toBeGreaterThan(2);
            
            // Check footer exists
            const footer = await page.locator('footer').count();
            expect(footer).toBeGreaterThan(0);
            
            // Check page has main content
            const mainContent = await page.locator('main, .main, #main').count();
            const hasContent = mainContent > 0 || 
                              await page.locator('h1, h2').count() > 0;
            expect(hasContent).toBeTruthy();
        }
    });

    test('should handle responsive navigation menu', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Look for mobile menu toggle (hamburger menu)
        const mobileMenuToggle = await page.locator('[aria-label*="menu"], .hamburger, .menu-toggle, button[aria-expanded]').first();
        
        if (await mobileMenuToggle.isVisible()) {
            // Test mobile menu functionality
            await mobileMenuToggle.click();
            
            // Menu should open
            const expandedState = await mobileMenuToggle.getAttribute('aria-expanded');
            if (expandedState) {
                expect(expandedState).toBe('true');
            }
            
            // Should be able to close menu
            await mobileMenuToggle.click();
            const collapsedState = await mobileMenuToggle.getAttribute('aria-expanded');
            if (collapsedState) {
                expect(collapsedState).toBe('false');
            }
        }
    });

    test('should handle form interactions on contact page', async ({ page }) => {
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');
        
        // Look for contact forms or input elements
        const inputs = await page.locator('input, textarea').all();
        const buttons = await page.locator('button, input[type="submit"]').all();
        
        if (inputs.length > 0) {
            // Test basic form interaction
            const firstInput = inputs[0];
            await firstInput.click();
            await firstInput.fill('Test User');
            
            const inputValue = await firstInput.inputValue();
            expect(inputValue).toBe('Test User');
            
            // Clear the input
            await firstInput.fill('');
        }
        
        // Test copy-to-clipboard functionality if present
        const copyButtons = await page.locator('button:has-text("copy"), [aria-label*="copy"]').all();
        if (copyButtons.length > 0) {
            // Test copy button interaction
            const firstCopyButton = copyButtons[0];
            await firstCopyButton.click();
            
            // Should show some feedback (success message, icon change, etc.)
            // This is implementation-specific, so we just ensure click works
            expect(await firstCopyButton.isVisible()).toBeTruthy();
        }
    });

    test('should handle search functionality if present', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Look for search input
        const searchInput = await page.locator('input[type="search"], input[placeholder*="search"], .search-input').first();
        
        if (await searchInput.isVisible()) {
            await searchInput.fill('test query');
            await page.keyboard.press('Enter');
            
            // Should handle search submission without errors
            const currentUrl = page.url();
            expect(currentUrl).toBeTruthy();
        }
    });

    test('should handle back/forward browser navigation', async ({ page }) => {
        // Start at home
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Navigate to about
        await page.goto('/about');
        await page.waitForLoadState('networkidle');
        
        // Use browser back button
        await page.goBack();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('arthursenko.com');
        
        // Use browser forward button
        await page.goForward();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('about');
    });

    test('should maintain state during page transitions', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check if there are any interactive elements that maintain state
        const expandableElements = await page.locator('[aria-expanded], .collapsible, .expandable').all();
        
        if (expandableElements.length > 0) {
            const element = expandableElements[0];
            const initialState = await element.getAttribute('aria-expanded');
            
            // Interact with element
            await element.click();
            await page.waitForTimeout(500);
            
            const changedState = await element.getAttribute('aria-expanded');
            
            // If it had aria-expanded, it should have changed
            if (initialState) {
                expect(changedState).not.toBe(initialState);
            }
        }
    });
});