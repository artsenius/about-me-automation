const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
    const pages = [
        { name: 'About Me', path: '' },
        { name: 'About This App', path: '/about-app' },
        { name: 'Live Automation', path: '/live-test-automation' },
        { name: 'Contact', path: '/contact' }
    ];

    pages.forEach(({ name, path }) => {
        test(`${name} page should load within acceptable time limits`, async ({ page }) => {
            const startTime = Date.now();
            
            await page.goto(path, { waitUntil: 'networkidle' });
            
            const loadTime = Date.now() - startTime;
            
            // Page should load within 5 seconds
            expect(loadTime).toBeLessThan(5000);
            console.log(`${name} page loaded in ${loadTime}ms`);
        });

        test(`${name} page should have good Core Web Vitals`, async ({ page }) => {
            await page.goto(path);
            
            // Get Core Web Vitals metrics
            const metrics = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const vitals = {};
                        
                        entries.forEach((entry) => {
                            if (entry.name === 'first-contentful-paint') {
                                vitals.fcp = entry.startTime;
                            }
                            if (entry.name === 'largest-contentful-paint') {
                                vitals.lcp = entry.startTime;
                            }
                        });
                        
                        // Get layout shift
                        vitals.cls = 0;
                        new PerformanceObserver((clsList) => {
                            for (const entry of clsList.getEntries()) {
                                if (!entry.hadRecentInput) {
                                    vitals.cls += entry.value;
                                }
                            }
                            resolve(vitals);
                        }).observe({ type: 'layout-shift', buffered: true });
                    }).observe({ type: 'paint', buffered: true });
                    
                    // Fallback timeout
                    setTimeout(() => resolve({}), 2000);
                });
            });
            
            // FCP should be under 1.8s (good threshold)
            if (metrics.fcp) {
                expect(metrics.fcp).toBeLessThan(1800);
                console.log(`${name} FCP: ${metrics.fcp}ms`);
            }
            
            // LCP should be under 2.5s (good threshold)
            if (metrics.lcp) {
                expect(metrics.lcp).toBeLessThan(2500);
                console.log(`${name} LCP: ${metrics.lcp}ms`);
            }
        });

        test(`${name} page should not have memory leaks`, async ({ page }) => {
            await page.goto(path);
            
            // Get initial memory usage
            const initialMemory = await page.evaluate(() => {
                if ('memory' in performance) {
                    return performance.memory.usedJSHeapSize;
                }
                return 0;
            });
            
            // Perform some interactions
            await page.mouse.move(100, 100);
            await page.keyboard.press('Tab');
            await page.waitForTimeout(1000);
            
            // Get memory after interactions
            const finalMemory = await page.evaluate(() => {
                if ('memory' in performance) {
                    return performance.memory.usedJSHeapSize;
                }
                return 0;
            });
            
            if (initialMemory > 0 && finalMemory > 0) {
                const memoryIncrease = finalMemory - initialMemory;
                // Memory increase should not be excessive (less than 5MB)
                expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
                console.log(`${name} memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            }
        });
    });

    test('Images should be optimized', async ({ page }) => {
        await page.goto('');
        
        const imageMetrics = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            const metrics = [];
            
            images.forEach((img, index) => {
                metrics.push({
                    index: index + 1,
                    src: img.src,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    displayWidth: img.width,
                    displayHeight: img.height,
                    loading: img.loading
                });
            });
            
            return metrics;
        });
        
        imageMetrics.forEach((metric) => {
            // Images should not be significantly oversized
            if (metric.displayWidth > 0 && metric.naturalWidth > 0) {
                const ratio = metric.naturalWidth / metric.displayWidth;
                expect(ratio).toBeLessThan(3); // Image should not be more than 3x larger than display size
            }
        });
        
        console.log(`Found ${imageMetrics.length} images on About Me page`);
    });

    test('JavaScript bundles should not be too large', async ({ page }) => {
        const responses = [];
        
        page.on('response', (response) => {
            if (response.url().endsWith('.js') && response.status() === 200) {
                responses.push(response);
            }
        });
        
        await page.goto('');
        
        // Check JavaScript bundle sizes
        for (const response of responses) {
            const headers = response.headers();
            const contentLength = headers['content-length'];
            
            if (contentLength) {
                const sizeInKB = parseInt(contentLength) / 1024;
                // Individual JS files should not exceed 1MB
                expect(sizeInKB).toBeLessThan(1024);
                console.log(`JS file ${response.url().split('/').pop()}: ${sizeInKB.toFixed(2)}KB`);
            }
        }
    });

    test('Page should be responsive on different viewport sizes', async ({ page }) => {
        const viewports = [
            { width: 320, height: 568, name: 'Mobile Small' },
            { width: 375, height: 667, name: 'Mobile Medium' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 1024, height: 768, name: 'Desktop Small' },
            { width: 1920, height: 1080, name: 'Desktop Large' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('');
            
            // Check if navigation is accessible
            const navVisible = await page.isVisible('[data-testid="header-nav"]');
            const mobileMenuVisible = await page.isVisible('[data-testid="nav-menu-button"]');
            
            // Either main nav or mobile menu should be visible
            expect(navVisible || mobileMenuVisible).toBeTruthy();
            
            // Check if main content is visible
            const mainContentVisible = await page.isVisible('[data-testid="profile-section"]');
            expect(mainContentVisible).toBeTruthy();
            
            console.log(`${viewport.name} (${viewport.width}x${viewport.height}): Navigation and content visible`);
        }
    });
});