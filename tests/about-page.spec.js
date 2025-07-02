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
        expect(summary).toContain('QA Leader');
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

    test('should display technical skills section with 24 skills', async () => {
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
        expect(achievementsText).toContain('Built and scaled QA teams and processes from the ground up in both startup and enterprise environments.');
        expect(achievementsText).toContain('Co-founded TechStart.dev, helping developers and testers launch their careers with a 95% graduate employment rate.');
        expect(achievementsText).toContain('Consistently played a pivotal role on every project, demonstrating unwavering responsibility, ownership, and commitment to success.');
        expect(achievementsText).toContain('Successfully led QA initiatives that delivered measurable business value, directly contributing to millions in company revenue.');
        expect(achievementsText).toContain('Pioneered the adoption of advanced automation tools and frameworks, driving innovation in enterprise environments.');
    });
});
