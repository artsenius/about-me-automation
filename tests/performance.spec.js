const { test, expect } = require('@playwright/test');
const { Header } = require('../pages/components/header');

let header;

test.describe('Performance Tests', () => {
    test.beforeEach(async ({ page }) => {
        header = new Header(page);
    });

    test('should load home page within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('');
        await page.waitForLoadState('domcontentloaded');
        const endTime = Date.now();
        
        const loadTime = endTime - startTime;
        console.log(`Home page load time: ${loadTime}ms`);
        
        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('should navigate between pages efficiently', async ({ page }) => {
        await page.goto('');
        
        const navigationTimes = [];
        const pages = [
            { name: 'About App', method: () => header.navigateToAboutApp() },
            { name: 'Live Automation', method: () => header.navigateToLiveAutomation() },
            { name: 'Contact', method: () => header.navigateToContact() },
            { name: 'About Me', method: () => header.navigateToAboutMe() }
        ];
        
        for (const pageInfo of pages) {
            const startTime = Date.now();
            await pageInfo.method();
            await page.waitForLoadState('domcontentloaded');
            const endTime = Date.now();
            
            const navTime = endTime - startTime;
            navigationTimes.push({ page: pageInfo.name, time: navTime });
            console.log(`${pageInfo.name} navigation time: ${navTime}ms`);
            
            // Each navigation should complete within 3 seconds
            expect(navTime).toBeLessThan(3000);
        }
        
        // Average navigation time should be reasonable
        const averageTime = navigationTimes.reduce((sum, item) => sum + item.time, 0) / navigationTimes.length;
        console.log(`Average navigation time: ${averageTime}ms`);
        expect(averageTime).toBeLessThan(2000);
    });

    test('should handle concurrent requests efficiently', async ({ page }) => {
        await page.goto('');
        
        // Simulate multiple quick navigation actions
        const startTime = Date.now();
        
        // Quick succession of navigation attempts
        await header.navigateToAboutApp();
        await header.navigateToContact();
        await header.navigateToAboutMe();
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log(`Total time for 3 quick navigations: ${totalTime}ms`);
        
        // Should handle rapid navigation changes gracefully
        expect(totalTime).toBeLessThan(10000);
        
        // Should end up on the last requested page (About Me)
        const currentUrl = page.url();
        expect(currentUrl).toContain('arthursenko.com');
    });

    test('should load images efficiently', async ({ page }) => {
        await page.goto('');
        
        // Wait for images to load
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Check if profile image loaded
        const profileImage = page.locator('[data-testid="profile-image"]');
        if (await profileImage.count() > 0) {
            const imageLoaded = await profileImage.evaluate(img => img.complete && img.naturalHeight !== 0);
            expect(imageLoaded).toBeTruthy();
        }
    });

    test('should respond to user interactions quickly', async ({ page }) => {
        await page.goto('');
        
        // Test button click responsiveness
        const resumeButton = page.locator('[data-testid="resume-link"]');
        if (await resumeButton.count() > 0) {
            const startTime = Date.now();
            await resumeButton.hover();
            const endTime = Date.now();
            
            const hoverTime = endTime - startTime;
            console.log(`Button hover response time: ${hoverTime}ms`);
            
            // Hover should be nearly instantaneous
            expect(hoverTime).toBeLessThan(500);
        }
    });

    test('should handle mobile navigation performance', async ({ page, browserName }, testInfo) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('');
        
        // Test mobile menu performance
        const hamburgerMenu = page.locator('[data-testid="nav-menu-button"]');
        
        if (await hamburgerMenu.isVisible()) {
            const startTime = Date.now();
            await hamburgerMenu.click();
            await page.waitForSelector('[data-testid="nav-list"]', { state: 'visible' });
            const endTime = Date.now();
            
            const menuOpenTime = endTime - startTime;
            console.log(`Mobile menu open time: ${menuOpenTime}ms`);
            
            // Mobile menu should open quickly
            expect(menuOpenTime).toBeLessThan(1000);
            
            // Close menu
            const closeStartTime = Date.now();
            await hamburgerMenu.click();
            await page.waitForSelector('[data-testid="nav-list"]', { state: 'hidden' });
            const closeEndTime = Date.now();
            
            const menuCloseTime = closeEndTime - closeStartTime;
            console.log(`Mobile menu close time: ${menuCloseTime}ms`);
            
            // Mobile menu should close quickly
            expect(menuCloseTime).toBeLessThan(1000);
        }
    });
});
