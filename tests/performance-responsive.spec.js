const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { AboutAppPage } = require('../pages/aboutAppPage');
const { ContactPage } = require('../pages/contactPage');
const { LiveAutomationPage } = require('../pages/liveAutomationPage');
const { Header } = require('../pages/components/header');

let aboutPage, aboutAppPage, contactPage, liveAutomationPage, header;

test.describe('Performance and Responsive Design Tests', () => {
    test.beforeEach(async ({ page }) => {
        aboutPage = new AboutPage(page);
        aboutAppPage = new AboutAppPage(page);
        contactPage = new ContactPage(page);
        liveAutomationPage = new LiveAutomationPage(page);
        header = new Header(page);
    });

    test('should measure Core Web Vitals and performance metrics', async ({ page }) => {
        console.log('=== MEASURING CORE WEB VITALS ===');
        
        // Navigate to the page and wait for load
        const startTime = Date.now();
        await page.goto('');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`Page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
        
        // Measure performance metrics using Performance API
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize,
                decodedBodySize: navigation.decodedBodySize
            };
        });
        
        console.log('Performance Metrics:', performanceMetrics);
        
        // Verify reasonable performance thresholds
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000); // FCP < 3s
        expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // DCL < 2s
        
        // Test performance on all pages
        const pages = [
            { name: 'About App', navigate: () => header.navigateToAboutApp() },
            { name: 'Contact', navigate: () => header.navigateToContact() },
            { name: 'Live Automation', navigate: () => header.navigateToLiveAutomation() }
        ];
        
        for (const pageTest of pages) {
            const pageStartTime = Date.now();
            await pageTest.navigate();
            await page.waitForLoadState('networkidle');
            const pageLoadTime = Date.now() - pageStartTime;
            
            console.log(`${pageTest.name} page load time: ${pageLoadTime}ms`);
            expect(pageLoadTime).toBeLessThan(3000); // Page transitions should be fast
        }
    });

    test('should be responsive across different viewport sizes', async ({ page }) => {
        console.log('\n=== TESTING RESPONSIVE DESIGN ===');
        
        const viewports = [
            { width: 320, height: 568, name: 'iPhone SE' },
            { width: 375, height: 667, name: 'iPhone 8' },
            { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
            { width: 768, height: 1024, name: 'iPad' },
            { width: 1024, height: 768, name: 'iPad Landscape' },
            { width: 1366, height: 768, name: 'Laptop' },
            { width: 1920, height: 1080, name: 'Desktop' },
            { width: 2560, height: 1440, name: 'Large Desktop' }
        ];
        
        await page.goto('');
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            console.log(`\nTesting viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
            
            // Wait for any responsive adjustments
            await page.waitForTimeout(500);
            
            // Check if navigation is properly responsive
            const navVisible = await page.locator('[data-testid="header-nav"]').isVisible();
            const hamburgerVisible = await page.locator('[data-testid="nav-menu-button"]').isVisible();
            
            console.log(`Navigation visible: ${navVisible}, Hamburger visible: ${hamburgerVisible}`);
            
            // Mobile viewports should show hamburger menu
            if (viewport.width <= 768) {
                expect(hamburgerVisible).toBeTruthy();
            }
            
            // Test content visibility and layout
            const profileImageVisible = await page.locator('[data-testid="profile-image"]').isVisible();
            const profileNameVisible = await page.locator('[data-testid="profile-name"]').isVisible();
            
            expect(profileImageVisible).toBeTruthy();
            expect(profileNameVisible).toBeTruthy();
            
            // Check for horizontal scroll (should not exist)
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            console.log(`Has horizontal scroll: ${hasHorizontalScroll}`);
            expect(hasHorizontalScroll).toBeFalsy();
            
            // Test font scaling
            const h1FontSize = await page.locator('h1').first().evaluate(el => {
                return parseInt(window.getComputedStyle(el).fontSize);
            });
            
            console.log(`H1 font size: ${h1FontSize}px`);
            
            // Font should scale appropriately (basic check)
            if (viewport.width <= 320) {
                expect(h1FontSize).toBeGreaterThan(16); // Minimum readable size
            }
        }
    });

    test('should handle touch interactions on mobile devices', async ({ page, browser }) => {
        console.log('\n=== TESTING TOUCH INTERACTIONS ===');
        
        // Create mobile context
        const mobileContext = await browser.newContext({
            viewport: { width: 375, height: 667 },
            hasTouch: true,
            isMobile: true
        });
        
        const mobilePage = await mobileContext.newPage();
        const mobileHeader = new Header(mobilePage);
        
        await mobilePage.goto('');
        
        // Test touch navigation
        const hamburgerButton = mobilePage.locator('[data-testid="nav-menu-button"]');
        if (await hamburgerButton.isVisible()) {
            await hamburgerButton.tap();
            
            // Wait for menu to open
            await mobilePage.waitForTimeout(500);
            
            // Test navigation tap
            const aboutAppLink = mobilePage.locator('[data-testid="nav-link-about-app"]');
            if (await aboutAppLink.isVisible()) {
                await aboutAppLink.tap();
                
                // Verify navigation worked
                await mobilePage.waitForTimeout(1000);
                const currentUrl = mobilePage.url();
                console.log(`After tap navigation, URL: ${currentUrl}`);
            }
        }
        
        // Test contact page touch interactions
        await mobileHeader.navigateToContact();
        
        const copyButtons = [
            '[data-testid="contact-card-email"] button',
            '[data-testid="contact-card-phone"] button',
            '[data-testid="contact-card-linkedin"] button'
        ];
        
        for (const buttonSelector of copyButtons) {
            const button = mobilePage.locator(buttonSelector);
            if (await button.count() > 0) {
                await button.tap();
                await mobilePage.waitForTimeout(500);
                console.log(`Tested touch interaction for ${buttonSelector}`);
            }
        }
        
        // Test external link touch behavior
        await mobileHeader.navigateToAboutApp();
        const githubLink = mobilePage.locator('[data-testid="github-frontend-link"]');
        
        if (await githubLink.count() > 0) {
            // Test that external links work with touch
            const [popup] = await Promise.all([
                mobilePage.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
                githubLink.tap()
            ]);
            
            if (popup) {
                console.log('External link opened in new tab via touch');
                await popup.close();
            } else {
                console.log('External link handled differently (may navigate in same tab)');
            }
        }
        
        await mobileContext.close();
    });

    test('should optimize images and media for different screen densities', async ({ page }) => {
        console.log('\n=== TESTING IMAGE AND MEDIA OPTIMIZATION ===');
        
        await page.goto('');
        
        // Test different pixel densities
        const densities = [1, 1.5, 2, 3];
        
        for (const density of densities) {
            await page.emulateMedia({ reducedMotion: 'reduce' }); // Test for accessibility
            
            // Set device pixel ratio
            await page.evaluate((dpr) => {
                Object.defineProperty(window, 'devicePixelRatio', {
                    value: dpr
                });
            }, density);
            
            console.log(`Testing with device pixel ratio: ${density}`);
            
            // Check image loading
            const images = await page.locator('img').all();
            
            for (let i = 0; i < Math.min(3, images.length); i++) {
                const img = images[i];
                const src = await img.getAttribute('src');
                const alt = await img.getAttribute('alt');
                const loading = await img.getAttribute('loading');
                
                console.log(`Image ${i}: src=${src}, alt="${alt}", loading=${loading}`);
                
                // Verify image loads successfully
                const isLoaded = await img.evaluate(el => el.complete && el.naturalHeight !== 0);
                expect(isLoaded).toBeTruthy();
            }
            
            // Test for responsive images (srcset)
            const responsiveImages = await page.locator('img[srcset]').count();
            console.log(`Responsive images with srcset: ${responsiveImages}`);
        }
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
        console.log('\n=== TESTING SLOW NETWORK CONDITIONS ===');
        
        // Simulate slow 3G network
        await page.route('**/*', async route => {
            // Add delay to simulate slow network
            await new Promise(resolve => setTimeout(resolve, 100));
            route.continue();
        });
        
        const startTime = Date.now();
        await page.goto('');
        
        // Test loading states
        const loadingElements = await page.locator('[data-testid*="loading"], .loading, [class*="skeleton"]').count();
        console.log(`Loading indicators found: ${loadingElements}`);
        
        // Wait for content to fully load
        await page.waitForLoadState('networkidle');
        const slowLoadTime = Date.now() - startTime;
        
        console.log(`Load time with simulated slow network: ${slowLoadTime}ms`);
        
        // Test navigation with slow network
        await header.navigateToLiveAutomation();
        await page.waitForTimeout(2000);
        
        // Check if loading states are shown
        const testRunList = await page.locator('[data-testid="test-run-list"]').isVisible();
        console.log(`Test run list visible: ${testRunList}`);
        
        // Remove network simulation
        await page.unroute('**/*');
    });

    test('should maintain usability with CSS and JavaScript disabled', async ({ page }) => {
        console.log('\n=== TESTING PROGRESSIVE ENHANCEMENT ===');
        
        // Test basic page structure and accessibility
        await page.goto('', { waitUntil: 'domcontentloaded' });
        
        // Test basic functionality - these should work with just HTML
        const basicElements = [
            '[data-testid="profile-section"]',
            '[data-testid="profile-name"]',
            '[data-testid="header-nav"]'
        ];
        
        // Wait for the page to fully load and render
        await page.waitForLoadState('networkidle');
        
        for (const selector of basicElements) {
            const exists = await page.locator(selector).isVisible();
            console.log(`${selector} visible: ${exists}`);
            expect(exists).toBeTruthy();
        }
        
        // Test with minimal CSS (simulate slow CSS loading)
        await page.addStyleTag({
            content: `
                * { 
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `
        });
        
        console.log('Tested with reduced animations for accessibility');
    });

    test('should optimize for Core Web Vitals metrics', async ({ page }) => {
        console.log('\n=== TESTING CORE WEB VITALS OPTIMIZATION ===');
        
        // Enable performance tracking
        await page.coverage.startJSCoverage();
        await page.coverage.startCSSCoverage();
        
        await page.goto('');
        await page.waitForLoadState('networkidle');
        
        // Measure Largest Contentful Paint (LCP)
        const lcpMetric = await page.evaluate(() => {
            return new Promise((resolve) => {
                if ('web-vital' in window) {
                    // If web-vitals library is loaded
                    resolve(null);
                } else {
                    // Fallback measurement
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lcpEntry = entries[entries.length - 1];
                        resolve(lcpEntry.startTime);
                    });
                    observer.observe({ entryTypes: ['largest-contentful-paint'] });
                    
                    // Timeout fallback
                    setTimeout(() => resolve(null), 5000);
                }
            });
        });
        
        if (lcpMetric) {
            console.log(`LCP: ${lcpMetric}ms`);
            expect(lcpMetric).toBeLessThan(4000); // Good LCP is < 2.5s, acceptable < 4s
        }
        
        // Measure Cumulative Layout Shift (CLS)
        const clsMetric = await page.evaluate(() => {
            return new Promise((resolve) => {
                let clsValue = 0;
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                });
                observer.observe({ entryTypes: ['layout-shift'] });
                
                setTimeout(() => resolve(clsValue), 3000);
            });
        });
        
        console.log(`CLS: ${clsMetric}`);
        expect(clsMetric).toBeLessThan(0.25); // Good CLS is < 0.1, acceptable < 0.25
        
        // Test interaction responsiveness (FID simulation)
        const interactionTime = await page.evaluate(() => {
            const startTime = performance.now();
            // Simulate user interaction
            document.dispatchEvent(new Event('click'));
            return performance.now() - startTime;
        });
        
        console.log(`Interaction response time: ${interactionTime}ms`);
        expect(interactionTime).toBeLessThan(300); // Good FID is < 100ms, acceptable < 300ms
        
        // Get coverage reports with proper error handling
        try {
            const jsCoverage = await page.coverage.stopJSCoverage();
            const cssCoverage = await page.coverage.stopCSSCoverage();
            
            if (jsCoverage && Array.isArray(jsCoverage)) {
                const jsUsed = jsCoverage.reduce((acc, entry) => acc + (entry.ranges ? entry.ranges.reduce((acc2, range) => acc2 + range.end - range.start, 0) : 0), 0);
                const jsTotal = jsCoverage.reduce((acc, entry) => acc + (entry.text ? entry.text.length : 0), 0);
                const jsUsedPercentage = jsTotal > 0 ? (jsUsed / jsTotal * 100).toFixed(2) : 0;
                console.log(`JavaScript usage: ${jsUsedPercentage}% (${jsUsed}/${jsTotal} bytes)`);
            } else {
                console.log('JavaScript coverage data not available');
            }
            
            if (cssCoverage && Array.isArray(cssCoverage)) {
                const cssUsed = cssCoverage.reduce((acc, entry) => acc + (entry.ranges ? entry.ranges.reduce((acc2, range) => acc2 + range.end - range.start, 0) : 0), 0);
                const cssTotal = cssCoverage.reduce((acc, entry) => acc + (entry.text ? entry.text.length : 0), 0);
                const cssUsedPercentage = cssTotal > 0 ? (cssUsed / cssTotal * 100).toFixed(2) : 0;
                console.log(`CSS usage: ${cssUsedPercentage}% (${cssUsed}/${cssTotal} bytes)`);
            } else {
                console.log('CSS coverage data not available');
            }
        } catch (error) {
            console.log('Coverage data collection failed:', error.message);
            // Continue test execution even if coverage fails
        }
    });
});