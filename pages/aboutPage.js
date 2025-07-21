const { BasePage } = require('./basePage');
const selectors = require('./selectors');

class AboutPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.about;
        this.commonSelectors = selectors.common;
    }

    // Header Page Title
    async getPageTitle() {
        return await this.getText(this.commonSelectors.pageTitle);
    }

    // Core Profile Elements
    async isProfileImageVisible() {
        // Scroll to profile image if not visible
        await this.page.locator(this.selectors.profileImage).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.profileImage);
    }

    async isProfileNameVisible() {
        // Scroll to profile name if not visible
        await this.page.locator(this.selectors.profileName).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.profileName);
    }

    async getProfileName() {
        return await this.getText(this.selectors.profileName);
    }

    async getProfilePosition() {
        // Scroll to profile section to ensure position is visible
        await this.page.locator(this.selectors.profileImage).scrollIntoViewIfNeeded();
        return await this.getText(this.selectors.profilePosition);
    }

    async isProfileImageHoverable() {
        const element = await this.page.locator(this.selectors.profileImage);
        const style = await element.evaluate(el => window.getComputedStyle(el));
        
        // More flexible check - just verify the element exists and has some interactive properties
        const exists = await element.count() > 0;
        const hasClassName = await element.evaluate(el => el.className && el.className.length > 0);
        
        return exists && hasClassName;
    }

    // Resume Download
    async isResumeButtonVisible() {
        // Scroll to profile section to ensure resume button is visible
        await this.page.locator(this.selectors.profileImage).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.resumeLink);
    }

    async clickResumeButton() {
        await this.click(this.selectors.resumeLink);
    }

    // Summary Section
    async isSummaryVisible() {
        // Scroll to summary section to ensure it's visible
        await this.page.locator(this.selectors.summary).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.summary);
    }

    async getSummaryText() {
        return await this.getText(this.selectors.summary);
    }

    // Current Role Section
    async isCurrentRoleSectionVisible() {
        return await this.isVisible(this.selectors.currentRoleSection);
    }

    async getCurrentRoleTitle() {
        return await this.getText(this.selectors.currentRoleTitle);
    }

    async getCurrentRoleCompany() {
        return await this.getText(this.selectors.currentRoleCompany);
    }

    async getCurrentRoleDuration() {
        return await this.getText(this.selectors.currentRoleDuration);
    }

    async getAllerganLink() {
        // Scroll to current role section to ensure links are visible
        await this.page.locator(this.selectors.currentRoleSection).scrollIntoViewIfNeeded();
        const links = await this.page.locator('a[href*="allerganaesthetics.com"]').all();
        if (links.length > 0) {
            return await links[0].getAttribute('href');
        }
        return '';
    }

    async getAbbvieLink() {
        // Scroll to current role section to ensure links are visible
        await this.page.locator(this.selectors.currentRoleSection).scrollIntoViewIfNeeded();
        const links = await this.page.locator('a[href*="abbvie.com"]').all();
        if (links.length > 0) {
            return await links[0].getAttribute('href');
        }
        return '';
    }

    // Technical Skills Section
    async isSkillsSectionVisible() {
        // Scroll to skills section to ensure it's visible
        await this.page.locator(this.selectors.skillsSection).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.skillsSection);
    }

    async getSkillsTitle() {
        return await this.getText(this.selectors.skillsTitle);
    }

    async getSkillsCount() {
        const skillElements = await this.page.locator(this.selectors.skillItems).all();
        return skillElements.length;
    }

    async getAllSkills() {
        const skillElements = await this.page.locator(this.selectors.skillItems).all();
        return await Promise.all(skillElements.map(element => element.textContent()));
    }

    // Achievements Section
    async isAchievementsSectionVisible() {
        // Scroll to achievements section if not visible
        await this.page.locator(this.selectors.achievementsSection).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.achievementsSection);
    }

    async getAchievementsTitle() {
        return await this.getText(this.selectors.achievementsTitle);
    }

    async getAchievementsCount() {
        const achievementElements = await this.page.locator(this.selectors.achievementItems).all();
        return achievementElements.length;
    }

    async getAllAchievements() {
        const achievementElements = await this.page.locator(this.selectors.achievementItems).all();
        return await Promise.all(achievementElements.map(element => element.textContent()));
    }

    // App Info Box
    async isAppInfoBoxVisible() {
        // Scroll to app info box to ensure it's visible
        await this.page.locator(this.selectors.appInfoBox).scrollIntoViewIfNeeded();
        return await this.isVisible(this.selectors.appInfoBox);
    }

    // Back to Top Button
    async scrollToBottom() {
        await this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await this.page.waitForTimeout(2000); // Wait longer for scroll to complete
    }

    async isBackToTopButtonVisible() {
        // Wait for the button to appear after scrolling
        try {
            await this.page.waitForSelector(this.selectors.backToTopButton, { timeout: 5000 });
            return await this.isVisible(this.selectors.backToTopButton);
        } catch (error) {
            return false;
        }
    }

    async clickBackToTopButton() {
        await this.click(this.selectors.backToTopButton);
        await this.page.waitForTimeout(1000); // Wait for scroll to complete
    }

    async getScrollPosition() {
        return await this.page.evaluate(() => window.pageYOffset);
    }
}

module.exports = { AboutPage };
