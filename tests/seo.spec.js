const { test, expect } = require('@playwright/test');

test.describe('SEO Tests', () => {
    test('should have proper page titles for all pages', async ({ page }) => {
        const pages = [
            { selector: '', expectedTitle: 'Arthur Senko' },
            { selector: '[data-testid="nav-link-contact"]', expectedTitle: 'Contact' },
            { selector: '[data-testid="nav-link-about-app"]', expectedTitle: 'About' },
            { selector: '[data-testid="nav-link-automation"]', expectedTitle: 'Live' }
        ];
        
        for (const pageInfo of pages) {
            if (pageInfo.selector) {
                await page.goto('');
                await page.click(pageInfo.selector);
                await page.waitForLoadState('networkidle');
            } else {
                await page.goto('');
                await page.waitForLoadState('networkidle');
            }
            
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);
            expect(title.length).toBeLessThan(60); // SEO best practice
            expect(title).toContain(pageInfo.expectedTitle);
        }
    });

    test('should have meta description tags', async ({ page }) => {
        await page.goto('');
        
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        
        expect(metaDescription).toBeTruthy();
        expect(metaDescription.length).toBeGreaterThan(120);
        expect(metaDescription.length).toBeLessThan(160); // SEO best practice
    });

    test('should have proper Open Graph tags', async ({ page }) => {
        await page.goto('');
        
        const ogTags = {
            'og:title': await page.locator('meta[property="og:title"]').getAttribute('content'),
            'og:description': await page.locator('meta[property="og:description"]').getAttribute('content'),
            'og:image': await page.locator('meta[property="og:image"]').getAttribute('content'),
            'og:url': await page.locator('meta[property="og:url"]').getAttribute('content'),
            'og:type': await page.locator('meta[property="og:type"]').getAttribute('content')
        };
        
        // All essential OG tags should be present
        expect(ogTags['og:title']).toBeTruthy();
        expect(ogTags['og:description']).toBeTruthy();
        
        // OG image should be a valid URL if present
        if (ogTags['og:image']) {
            expect(ogTags['og:image']).toMatch(/^https?:\/\/.+/);
        }
        
        // OG URL should be a valid URL if present
        if (ogTags['og:url']) {
            expect(ogTags['og:url']).toMatch(/^https?:\/\/.+/);
        }
    });

    test('should have proper Twitter Card tags', async ({ page }) => {
        await page.goto('');
        
        const twitterTags = {
            'twitter:card': await page.locator('meta[name="twitter:card"]').getAttribute('content'),
            'twitter:title': await page.locator('meta[name="twitter:title"]').getAttribute('content'),
            'twitter:description': await page.locator('meta[name="twitter:description"]').getAttribute('content'),
            'twitter:image': await page.locator('meta[name="twitter:image"]').getAttribute('content')
        };
        
        // Twitter card type should be specified
        if (twitterTags['twitter:card']) {
            expect(['summary', 'summary_large_image', 'app', 'player']).toContain(twitterTags['twitter:card']);
        }
        
        // Twitter image should be a valid URL if present
        if (twitterTags['twitter:image']) {
            expect(twitterTags['twitter:image']).toMatch(/^https?:\/\/.+/);
        }
    });

    test('should have structured data (JSON-LD)', async ({ page }) => {
        await page.goto('');
        
        const structuredData = await page.locator('script[type="application/ld+json"]').all();
        
        if (structuredData.length > 0) {
            for (const script of structuredData) {
                const content = await script.textContent();
                
                // Should be valid JSON
                expect(() => JSON.parse(content)).not.toThrow();
                
                const data = JSON.parse(content);
                
                // Should have proper schema.org context
                if (data['@context']) {
                    expect(data['@context']).toContain('schema.org');
                }
                
                // Should have a type
                expect(data['@type']).toBeTruthy();
            }
        }
    });

    test('should have proper heading structure for SEO', async ({ page }) => {
        await page.goto('');
        
        // Should have exactly one H1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
        
        // H1 should have meaningful content
        const h1Text = await page.locator('h1').textContent();
        expect(h1Text.trim().length).toBeGreaterThan(5);
        
        // Check heading hierarchy (no skipping levels)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        const headingLevels = [];
        
        for (const heading of headings) {
            const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
            const level = parseInt(tagName.charAt(1));
            headingLevels.push(level);
        }
        
        // Should start with h1
        expect(headingLevels[0]).toBe(1);
        
        // Check for proper hierarchy (no skipping levels)
        for (let i = 1; i < headingLevels.length; i++) {
            const currentLevel = headingLevels[i];
            const previousLevel = headingLevels[i - 1];
            
            // Current level shouldn't be more than 1 level deeper than previous
            expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
        }
    });

    test('should have viewport meta tag', async ({ page }) => {
        await page.goto('');
        
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        
        expect(viewport).toBeTruthy();
        expect(viewport).toContain('width=device-width');
        expect(viewport).toContain('initial-scale=1');
    });

    test('should have canonical URL', async ({ page }) => {
        await page.goto('');
        
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        
        if (canonical) {
            expect(canonical).toMatch(/^https?:\/\/.+/);
            expect(canonical).toContain('arthursenko.com');
        }
    });

    test('should have proper robots meta tag', async ({ page }) => {
        await page.goto('');
        
        const robots = await page.locator('meta[name="robots"]').getAttribute('content');
        
        if (robots) {
            // Should not block indexing for public portfolio
            expect(robots).not.toContain('noindex');
            expect(robots).not.toContain('nofollow');
        }
    });

    test('should have fast loading for SEO', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('', { waitUntil: 'load' });
        
        const loadTime = Date.now() - startTime;
        
        // Page should load quickly for SEO (under 3 seconds)
        expect(loadTime).toBeLessThan(3000);
    });

    test('should have sitemap accessibility', async ({ page, request }) => {
        // Check if sitemap.xml exists
        try {
            const sitemapResponse = await request.get('https://www.arthursenko.com/sitemap.xml');
            
            if (sitemapResponse.status() === 200) {
                const sitemapContent = await sitemapResponse.text();
                
                // Should be valid XML
                expect(sitemapContent).toContain('<?xml');
                expect(sitemapContent).toContain('<urlset');
                expect(sitemapContent).toContain('</urlset>');
                
                // Should contain the main URL
                expect(sitemapContent).toContain('arthursenko.com');
            }
        } catch (error) {
            console.warn('Sitemap check failed:', error.message);
        }
    });

    test('should have proper language attributes', async ({ page }) => {
        await page.goto('');
        
        const htmlLang = await page.locator('html').getAttribute('lang');
        
        if (htmlLang) {
            // Should have a valid language code
            expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        }
    });
});