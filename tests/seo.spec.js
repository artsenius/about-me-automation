const { test, expect } = require('@playwright/test');

test.describe('SEO Tests', () => {
    test('should have proper meta tags on home page', async ({ page }) => {
        await page.goto('/');
        
        // Check title tag
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(title.length).toBeLessThan(60); // SEO best practice
        
        // Check meta description
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        expect(metaDescription).toBeTruthy();
        expect(metaDescription.length).toBeGreaterThan(50);
        expect(metaDescription.length).toBeLessThan(160); // SEO best practice
        
        // Check meta viewport for mobile optimization
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toBeTruthy();
        expect(viewport).toContain('width=device-width');
    });

    test('should have unique titles and descriptions across pages', async ({ page }) => {
        const pages = ['/', '/about', '/contact', '/live-automation'];
        const pageData = [];
        
        for (const pagePath of pages) {
            await page.goto(pagePath);
            await page.waitForLoadState('networkidle');
            
            const title = await page.title();
            const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
            
            pageData.push({
                path: pagePath,
                title: title,
                description: metaDescription
            });
        }
        
        // Check for unique titles
        const titles = pageData.map(p => p.title);
        const uniqueTitles = new Set(titles);
        expect(uniqueTitles.size).toBe(titles.length);
        
        // Check for unique descriptions (if they exist)
        const descriptions = pageData.filter(p => p.description).map(p => p.description);
        if (descriptions.length > 1) {
            const uniqueDescriptions = new Set(descriptions);
            expect(uniqueDescriptions.size).toBe(descriptions.length);
        }
    });

    test('should have proper Open Graph tags', async ({ page }) => {
        await page.goto('/');
        
        // Check for Open Graph meta tags
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
        const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
        const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
        const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
        
        // At least title should be present for social sharing
        if (ogTitle) {
            expect(ogTitle.length).toBeGreaterThan(0);
        }
        
        // If Open Graph is implemented, check basic requirements
        if (ogTitle || ogDescription || ogType || ogUrl) {
            expect(ogTitle || ogDescription).toBeTruthy();
        }
    });

    test('should have proper heading structure for SEO', async ({ page }) => {
        await page.goto('/');
        
        // Should have exactly one H1 tag
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
        
        // H1 should not be empty
        const h1Text = await page.locator('h1').first().textContent();
        expect(h1Text?.trim().length).toBeGreaterThan(0);
        
        // Should have H2 tags for content structure
        const h2Count = await page.locator('h2').count();
        expect(h2Count).toBeGreaterThan(0);
    });

    test('should have clean URLs and proper canonical tags', async ({ page }) => {
        const pages = ['/', '/about', '/contact', '/live-automation'];
        
        for (const pagePath of pages) {
            await page.goto(pagePath);
            
            // Check URL structure - should be clean
            const currentUrl = page.url();
            expect(currentUrl).toContain('https://');
            expect(currentUrl).not.toContain('#');
            
            // Check for canonical tag (if implemented)
            const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
            if (canonical) {
                expect(canonical).toContain('arthursenko.com');
            }
        }
    });

    test('should have proper robots meta tag', async ({ page }) => {
        await page.goto('/');
        
        const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
        
        // If robots meta exists, check it's not blocking indexing
        if (robotsMeta) {
            expect(robotsMeta).not.toContain('noindex');
            expect(robotsMeta).not.toContain('nofollow');
        }
        
        // Check that there's no accidental blocking
        const noindexMeta = await page.locator('meta[name="robots"][content*="noindex"]').count();
        expect(noindexMeta).toBe(0);
    });

    test('should have structured data or schema markup', async ({ page }) => {
        await page.goto('/');
        
        // Check for JSON-LD structured data
        const jsonLd = await page.locator('script[type="application/ld+json"]').count();
        
        // Check for microdata
        const microdata = await page.locator('[itemscope], [itemtype], [itemprop]').count();
        
        // Should have some form of structured data for better SEO
        // This is optional but recommended
        if (jsonLd > 0 || microdata > 0) {
            console.log(`Found structured data: JSON-LD: ${jsonLd}, Microdata: ${microdata}`);
        }
    });

    test('should have appropriate meta tags for performance', async ({ page }) => {
        await page.goto('/');
        
        // Check for resource hints
        const preconnect = await page.locator('link[rel="preconnect"]').count();
        const dns_prefetch = await page.locator('link[rel="dns-prefetch"]').count();
        const preload = await page.locator('link[rel="preload"]').count();
        
        console.log(`Performance hints - Preconnect: ${preconnect}, DNS-prefetch: ${dns_prefetch}, Preload: ${preload}`);
        
        // Check for efficient loading attributes
        const lazyImages = await page.locator('img[loading="lazy"]').count();
        const totalImages = await page.locator('img').count();
        
        if (totalImages > 3) {
            // Should have some lazy loading for performance
            console.log(`Image loading optimization - Lazy: ${lazyImages}, Total: ${totalImages}`);
        }
    });
});