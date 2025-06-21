const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');

test.describe('About Page', () => {
    test('should display all key elements', async ({ page }) => {
        await page.goto('https://artsenius.github.io/about/');
        const about = new AboutPage(page);
        await expect(about.navAbout).toBeVisible();
        await expect(about.navContact).toBeVisible();
        await expect(about.headingAboutMe).toBeVisible();
        await expect(about.headingArthurSenko).toBeVisible();
        await expect(about.headingSeniorQALeader).toBeVisible();
        await expect(about.headingCurrentRole).toBeVisible();
        await expect(about.headingTechnicalSkills).toBeVisible();
        await expect(about.headingNotableAchievements).toBeVisible();
        await expect(about.downloadResume).toBeVisible();
        await expect(about.photo).toBeVisible();
        await expect(about.skillWebdriverIO).toBeVisible();
        await expect(about.skillCypress).toBeVisible();
        await expect(about.skillPlaywright).toBeVisible();
        await expect(about.skillSelenium).toBeVisible();
        await expect(about.skillAppium).toBeVisible();
        await expect(about.achievement1).toBeVisible();
        await expect(about.achievement2).toBeVisible();
        await expect(about.achievement3).toBeVisible();
        await expect(about.achievement4).toBeVisible();
        await expect(about.copyright).toBeVisible();
    });
});
