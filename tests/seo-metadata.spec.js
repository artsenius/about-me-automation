const { test, expect } = require('@playwright/test');

test.describe('SEO and Metadata Tests', () => {
    test('should have proper page titles', async ({ page }) => {
        const pages = [
            { path: '', expectedTitle: /Arthur Senko/ },
            { path: '/about-app', expectedTitle: /About.*App|Arthur Senko/ },
            { path: '/live-automation', expectedTitle: /Live.*Automation|Arthur Senko/ },
            { path: '/contact', expectedTitle: /Contact|Arthur Senko/ }
        ];

        for (const pageInfo of pages) {
            await page.goto(pageInfo.path);
            const title = await page.title();
            console.log(`Page: ${pageInfo.path}, Title: ${title}`);
            expect(title).toMatch(pageInfo.expectedTitle);
            expect(title.length).toBeGreaterThan(10);
            expect(title.length).toBeLessThan(60); // Optimal title length for SEO
        }
    });

    test('should have meta descriptions', async ({ page }) => {
        const pages = ['', '/about-app', '/live-automation', '/contact'];

        for (const path of pages) {
            await page.goto(path);
            
            const description = await page.getAttribute('meta[name="description"]', 'content');
            console.log(`Page: ${path}, Description: ${description}`);
            
            expect(description).toBeTruthy();
            if (description) {
                expect(description.length).toBeGreaterThan(50);
                expect(description.length).toBeLessThan(160); // Optimal meta description length
            }
        }
    });

    test('should have proper Open Graph meta tags', async ({ page }) => {
        await page.goto('');

        // Check for Open Graph tags
        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
        const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
        const ogType = await page.getAttribute('meta[property="og:type"]', 'content');
        const ogUrl = await page.getAttribute('meta[property="og:url"]', 'content');

        console.log('Open Graph Tags:', { ogTitle, ogDescription, ogType, ogUrl });

        // These should exist for social media sharing
        if (ogTitle) expect(ogTitle.length).toBeGreaterThan(0);
        if (ogDescription) expect(ogDescription.length).toBeGreaterThan(0);
        if (ogType) expect(ogType).toMatch(/website|profile/);
        if (ogUrl) expect(ogUrl).toContain('arthursenko.com');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        const pages = ['', '/about-app', '/live-automation', '/contact'];

        for (const path of pages) {
            await page.goto(path);
            
            // Check for h1 tag (should have exactly one)
            const h1Elements = await page.locator('h1').count();
            expect(h1Elements).toBe(1);

            // Check that headings are properly nested
            const h1Text = await page.locator('h1').first().textContent();
            expect(h1Text).toBeTruthy();
            expect(h1Text.trim().length).toBeGreaterThan(0);

            console.log(`Page: ${path}, H1: ${h1Text}`);
        }
    });

    test('should have canonical URLs', async ({ page }) => {
        const pages = ['', '/about-app', '/live-automation', '/contact'];

        for (const path of pages) {
            await page.goto(path);
            
            const canonicalLink = await page.getAttribute('link[rel="canonical"]', 'href');
            console.log(`Page: ${path}, Canonical: ${canonicalLink}`);
            
            if (canonicalLink) {
                expect(canonicalLink).toContain('arthursenko.com');
                expect(canonicalLink).toMatch(/^https?:\/\//);
            }
        }
    });

    test('should have proper viewport meta tag', async ({ page }) => {
        await page.goto('');
        
        const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
        expect(viewport).toBeTruthy();
        expect(viewport).toContain('width=device-width');
        expect(viewport).toContain('initial-scale=1');
        
        console.log(`Viewport meta tag: ${viewport}`);
    });

    test('should have language attribute', async ({ page }) => {
        await page.goto('');
        
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBeTruthy();
        expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // ISO language code format
        
        console.log(`HTML lang attribute: ${htmlLang}`);
    });

    test('should have valid structured data', async ({ page }) => {
        await page.goto('');
        
        // Look for JSON-LD structured data
        const jsonLdElements = await page.locator('script[type="application/ld+json"]').count();
        
        if (jsonLdElements > 0) {
            const jsonLdContent = await page.locator('script[type="application/ld+json"]').first().textContent();
            console.log('Structured data found:', jsonLdContent);
            
            // Validate JSON structure
            expect(() => JSON.parse(jsonLdContent)).not.toThrow();
            
            const structuredData = JSON.parse(jsonLdContent);
            expect(structuredData['@context']).toBeTruthy();
            expect(structuredData['@type']).toBeTruthy();
        } else {
            console.log('No structured data found - consider adding JSON-LD for better SEO');
        }
    });

    test('should not have duplicate meta tags', async ({ page }) => {
        await page.goto('');
        
        // Check for duplicate descriptions
        const descriptionTags = await page.locator('meta[name="description"]').count();
        expect(descriptionTags).toBeLessThanOrEqual(1);
        
        // Check for duplicate titles
        const titleTags = await page.locator('title').count();
        expect(titleTags).toBe(1);
        
        // Check for duplicate canonical links
        const canonicalTags = await page.locator('link[rel="canonical"]').count();
        expect(canonicalTags).toBeLessThanOrEqual(1);
    });

    test('should have proper robots meta tag', async ({ page }) => {
        await page.goto('');
        
        const robotsMeta = await page.getAttribute('meta[name="robots"]', 'content');
        
        if (robotsMeta) {
            console.log(`Robots meta tag: ${robotsMeta}`);
            // Should not block indexing for a portfolio site
            expect(robotsMeta).not.toContain('noindex');
            expect(robotsMeta).not.toContain('nofollow');
        } else {
            // No robots meta tag means default behavior (indexable)
            console.log('No robots meta tag found - using default behavior');
        }
    });
});