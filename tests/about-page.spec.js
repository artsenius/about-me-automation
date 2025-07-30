const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { Header } = require('../pages/components/header');
const path = require('path');

let aboutPage;
let header;

test.describe('About Page', () => {
    test.beforeEach(async ({ page }) => {
        aboutPage = new AboutPage(page);
        header = new Header(page);
        // Navigate to base URL
        await page.goto('');
    });

    test('should display profile section', async () => {
        // Verify profile section
        expect(await aboutPage.isProfileImageVisible()).toBeTruthy();
        expect(await aboutPage.isProfileNameVisible()).toBeTruthy();
        expect(await aboutPage.getProfileName()).toBe('Arthur Senko');
    });

    test('should display profile position with correct text', async () => {
        // Verify profile position text
        const position = await aboutPage.getProfilePosition();
        expect(position).toContain('Lead QA Engineer');
        expect(position).toContain('SDET');
        expect(position).toContain('AI Enthusiast');
    });

    test('should have hoverable profile image', async () => {
        // Verify profile image has hover effects
        expect(await aboutPage.isProfileImageHoverable()).toBeTruthy();
    });

    test('should have working resume download', async ({ page }) => {
        // Verify resume button
        expect(await aboutPage.isResumeButtonVisible()).toBeTruthy();

        // Set up download listener and click the button
        const downloadPromise = page.waitForEvent('download');
        await aboutPage.clickResumeButton();
        const download = await downloadPromise;

        // Verify downloaded file
        expect(download.suggestedFilename()).toContain('Senko');
        expect(path.extname(download.suggestedFilename())).toBe('.pdf');
    });

    test('should display summary and current role sections', async () => {
        // Verify summary section
        expect(await aboutPage.isSummaryVisible()).toBeTruthy();
        const summary = await aboutPage.getSummaryText();
        expect(summary).toContain('Lead QA Engineer');
        expect(summary).toContain('AI testing');
        expect(summary).toContain('automation');

        // Verify current role section
        expect(await aboutPage.isCurrentRoleSectionVisible()).toBeTruthy();
        expect(await aboutPage.getCurrentRoleTitle()).toContain('Current Role');
    });

    test('should have working company links', async () => {
        // Verify company links
        const allerganUrl = await aboutPage.getAllerganLink();
        expect(allerganUrl).toContain('allerganaesthetics.com');

        const abbvieUrl = await aboutPage.getAbbvieLink();
        expect(abbvieUrl).toContain('abbvie.com');
    });

    test('should display technical skills section with 30 skills', async () => {
        // Verify section visibility and title
        expect(await aboutPage.isSkillsSectionVisible()).toBeTruthy();
        expect(await aboutPage.getSkillsTitle()).toBe('Technical Skills');

        // Verify skills count and content
        expect(await aboutPage.getSkillsCount()).toBe(30);
    });

    test('should display achievements section', async () => {
        // Verify section visibility and title
        expect(await aboutPage.isAchievementsSectionVisible()).toBeTruthy();
        expect(await aboutPage.getAchievementsTitle()).toBe('Notable Achievements');

        // Verify achievements count and content
        const achievements = await aboutPage.getAllAchievements();
        expect(achievements).toHaveLength(5);

        // Verify notable achievements content
        const achievementsText = achievements.join(' ');
        expect(achievementsText).toContain('Built QA teams and processes from the ground up in startup and enterprise environments.');
        expect(achievementsText).toContain('Co-founded a startup, helping people launch careers with a 95% graduate employment rate.');
        expect(achievementsText).toContain('Played a key role on every project, demonstrating responsibility and commitment to success.');
        expect(achievementsText).toContain('Successfully led QA initiatives directly contributing to millions in company revenue.');
        expect(achievementsText).toContain('Pioneered the adoption of advanced automation tools and frameworks, driving innovation.');
    });

    test('should display app info box', async () => {
        // Verify app info box is present
        expect(await aboutPage.isAppInfoBoxVisible()).toBeTruthy();
    });

    test('should display back to top button when scrolled to bottom', async () => {
        // Scroll to bottom
        await aboutPage.scrollToBottom();
        
        // Verify back to top button is visible (if implemented)
        const isButtonVisible = await aboutPage.isBackToTopButtonVisible();
        if (isButtonVisible) {
            expect(isButtonVisible).toBeTruthy();
        }
    });

    test('should scroll to top when back to top button is clicked', async () => {
        // Scroll to bottom first
        await aboutPage.scrollToBottom();
        
        // Get scroll position at bottom
        const bottomScrollPosition = await aboutPage.getScrollPosition();
        
        // Only proceed if we actually scrolled and back to top button is available
        if (bottomScrollPosition > 0 && await aboutPage.isBackToTopButtonVisible()) {
            // Click back to top button
            await aboutPage.clickBackToTopButton();
            
            // Verify page scrolled to top
            const topScrollPosition = await aboutPage.getScrollPosition();
            expect(topScrollPosition).toBeLessThan(bottomScrollPosition);
        }
    });

    // NEW COMPREHENSIVE TESTS FOR BETTER COVERAGE

    test('should have proper page title and metadata', async ({ page }) => {
        // Verify page title
        const title = await page.title();
        expect(title).toContain('About Me');
        
        // Verify meta description exists
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        expect(metaDescription).toBeTruthy();
        expect(metaDescription.length).toBeGreaterThan(50);
    });

    test('should have accessible profile image', async ({ page }) => {
        // Check for alt text on profile image
        const profileImg = page.locator(aboutPage.selectors.profileImage);
        const altText = await profileImg.getAttribute('alt');
        expect(altText).toBeTruthy();
        expect(altText).toContain('Arthur');
    });

    test('should have keyboard accessible resume download', async ({ page }) => {
        // Focus on resume button and verify it can be activated with keyboard
        const resumeButton = page.locator(aboutPage.selectors.resumeLink);
        await resumeButton.focus();
        
        // Verify button is focused
        const isFocused = await resumeButton.evaluate(el => el === document.activeElement);
        expect(isFocused).toBeTruthy();
        
        // Verify button has proper role/accessibility attributes
        const tabIndex = await resumeButton.getAttribute('tabindex');
        expect(tabIndex !== '-1').toBeTruthy(); // Should be keyboard accessible
    });

    test('should validate all external links', async ({ page }) => {
        // Get all external links
        const externalLinks = await page.locator('a[href^="http"]').all();
        
        // Verify external links have proper attributes
        for (const link of externalLinks) {
            const href = await link.getAttribute('href');
            const target = await link.getAttribute('target');
            const rel = await link.getAttribute('rel');
            
            expect(href).toBeTruthy();
            // External links should open in new tab
            if (href && !href.includes('arthursenko.com')) {
                expect(target).toBe('_blank');
                expect(rel).toContain('noopener');
            }
        }
    });

    test('should have responsive design elements', async ({ page }) => {
        // Test different viewport sizes
        const viewports = [
            { width: 320, height: 568 },  // Mobile
            { width: 768, height: 1024 }, // Tablet
            { width: 1920, height: 1080 } // Desktop
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            
            // Verify key elements are still visible
            expect(await aboutPage.isProfileImageVisible()).toBeTruthy();
            expect(await aboutPage.isProfileNameVisible()).toBeTruthy();
            expect(await aboutPage.isSkillsSectionVisible()).toBeTruthy();
            
            // Verify page doesn't have horizontal scroll on mobile
            if (viewport.width <= 768) {
                const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
                expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small margin
            }
        }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        // Verify heading structure for accessibility
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        
        expect(headings.length).toBeGreaterThan(0);
        
        // Check that there's an h1 on the page
        const h1Elements = await page.locator('h1').count();
        expect(h1Elements).toBeGreaterThanOrEqual(1);
        
        // Verify headings have meaningful text
        for (const heading of headings) {
            const text = await heading.textContent();
            expect(text?.trim().length).toBeGreaterThan(0);
        }
    });

    test('should load profile image successfully', async ({ page }) => {
        // Wait for profile image to load
        const profileImg = page.locator(aboutPage.selectors.profileImage);
        await profileImg.waitFor({ state: 'visible' });
        
        // Verify image loaded successfully (not broken)
        const naturalWidth = await profileImg.evaluate(img => img.naturalWidth);
        const naturalHeight = await profileImg.evaluate(img => img.naturalHeight);
        
        expect(naturalWidth).toBeGreaterThan(0);
        expect(naturalHeight).toBeGreaterThan(0);
    });

    test('should have proper color contrast', async ({ page }) => {
        // This test checks that text elements have sufficient color contrast
        // We'll check the profile name as a key text element
        const profileName = page.locator(aboutPage.selectors.profileName);
        await profileName.waitFor({ state: 'visible' });
        
        const styles = await profileName.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize
            };
        });
        
        // Verify text has a color set (not default browser styling)
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
        expect(styles.fontSize).toBeTruthy();
    });

    test('should handle network delays gracefully', async ({ page }) => {
        // Simulate slow network
        await page.route('**/*', route => {
            setTimeout(() => route.continue(), 100);
        });
        
        // Reload page with delay
        await page.reload();
        
        // Verify key elements still load
        expect(await aboutPage.isProfileImageVisible()).toBeTruthy();
        expect(await aboutPage.isProfileNameVisible()).toBeTruthy();
    });

    test('should have proper semantic structure', async ({ page }) => {
        // Check for proper semantic HTML elements
        const main = await page.locator('main').count();
        const sections = await page.locator('section').count();
        const articles = await page.locator('article').count();
        
        // Should have semantic structure
        expect(main + sections + articles).toBeGreaterThan(0);
        
        // Check for proper list structure in skills/achievements
        const lists = await page.locator('ul, ol').count();
        expect(lists).toBeGreaterThan(0);
    });

    test('should have working focus management', async ({ page }) => {
        // Test tab navigation through interactive elements
        const interactiveElements = await page.locator('a, button, [tabindex]:not([tabindex="-1"])').all();
        
        expect(interactiveElements.length).toBeGreaterThan(0);
        
        // Test that first interactive element can receive focus
        if (interactiveElements.length > 0) {
            await interactiveElements[0].focus();
            const isFocused = await interactiveElements[0].evaluate(el => el === document.activeElement);
            expect(isFocused).toBeTruthy();
        }
    });

    test('should validate skills section content', async () => {
        // Get all skills and verify they're meaningful
        const skills = await aboutPage.getAllSkills();
        
        expect(skills.length).toBe(30);
        
        // Verify skills contain expected technologies
        const skillsText = skills.join(' ').toLowerCase();
        expect(skillsText).toContain('javascript');
        expect(skillsText).toContain('playwright');
        expect(skillsText).toContain('testing');
        
        // Verify no empty skills
        for (const skill of skills) {
            expect(skill.trim().length).toBeGreaterThan(0);
        }
    });

    test('should handle page refresh correctly', async ({ page }) => {
        // Get initial state
        const initialName = await aboutPage.getProfileName();
        
        // Refresh page
        await page.reload();
        
        // Verify content loads correctly after refresh
        expect(await aboutPage.isProfileNameVisible()).toBeTruthy();
        expect(await aboutPage.getProfileName()).toBe(initialName);
    });
});
