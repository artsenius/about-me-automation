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
        await this.expectToBeVisible(this.selectors.devToolsSection);
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
