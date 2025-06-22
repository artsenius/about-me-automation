const { BasePage } = require('./basePage');
const selectors = require('./selectors');

class AboutAppPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.aboutApp;
    }

    // Component Sections
    async verifyComponentSections() {
        // Verify section headers
        await this.expectToBeVisible(this.selectors.componentsSection);
        await this.expectToBeVisible(this.selectors.frontendSection);
        await this.expectToBeVisible(this.selectors.backendSection);
        await this.expectToBeVisible(this.selectors.automationSection);

        // Verify component descriptions are visible
        await this.expectToContainText(this.selectors.frontendSection + ' + p', 'React application built with TypeScript');
        await this.expectToContainText(this.selectors.backendSection + ' + p', 'Express.js server with MongoDB');
        await this.expectToContainText(this.selectors.automationSection + ' + p', 'Playwright-based automation framework');
    }

    // Live Results Section
    async verifyLiveResultsSection() {
        await this.expectToBeVisible(this.selectors.liveResultsSection);
        await this.expectToContainText(this.selectors.liveResultsSection + ' + p', 'continuously tested');
    }

    // GitHub Links
    async verifyAllLinks() {
        await this.expectToBeVisible(this.selectors.frontendCodeLink);
        await this.expectToBeVisible(this.selectors.backendCodeLink);
        await this.expectToBeVisible(this.selectors.automationCodeLink);
        await this.expectToBeVisible(this.selectors.liveTestResultsLink);
    }

    async clickLiveTestResultsLink() {
        await this.click(this.selectors.liveTestResultsLink);
    }

    async clickFrontendCodeLink() {
        await this.click(this.selectors.frontendCodeLink);
    }

    async clickBackendCodeLink() {
        await this.click(this.selectors.backendCodeLink);
    }

    async clickAutomationCodeLink() {
        await this.click(this.selectors.automationCodeLink);
    }
}

module.exports = { AboutAppPage };
