const { BasePage } = require('./basePage');
const selectors = require('./selectors');

class AboutPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.about;
    }

    // Core Profile Elements
    async isTitleVisible() {
        return await this.isVisible(this.selectors.pageTitle);
    }

    async getTitle() {
        return await this.getText(this.selectors.pageTitle);
    }

    async isProfileImageVisible() {
        return await this.isVisible(this.selectors.profileImage);
    }

    async isProfileNameVisible() {
        return await this.isVisible(this.selectors.profileName);
    }

    async getProfileName() {
        return await this.getText(this.selectors.profileName);
    }

    // Resume Download
    async isResumeButtonVisible() {
        return await this.isVisible(this.selectors.resumeLink);
    }

    async clickResumeButton() {
        await this.click(this.selectors.resumeLink);
    }

    // Summary Section
    async isSummaryVisible() {
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
        const links = await this.page.locator('a[href*="allerganaesthetics.com"]').all();
        if (links.length > 0) {
            return await links[0].getAttribute('href');
        }
        return '';
    }

    async getAbbvieLink() {
        const links = await this.page.locator('a[href*="abbvie.com"]').all();
        if (links.length > 0) {
            return await links[0].getAttribute('href');
        }
        return '';
    }

    // Technical Skills Section
    async isSkillsSectionVisible() {
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
}

module.exports = { AboutPage };
