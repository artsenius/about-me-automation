const { BasePage } = require('./basePage');
const selectors = require('./selectors');
const LIVE_AUTO_SELECTORS = selectors.liveAutomation;

class LiveTestAutomationPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = LIVE_AUTO_SELECTORS;
    }

    // Verification Methods
    async verifyPageLoaded() {
        await this.expectToBeVisible(this.selectors.title);
        await this.expectToBeVisible(this.selectors.section);
        await this.expectToBeVisible(this.selectors.testRunList);
    }

    async verifyLoadingState() {
        await this.expectToBeVisible(this.selectors.loadingPlaceholder);
    }

    // Test Run Card Methods
    async getTestRunCards() {
        return await this.getElements(this.selectors.testRunCard);
    }

    async expandTestRun(index) {
        const cards = await this.getElements(this.selectors.testRunCard);
        if (cards.length > index) {
            await this.click(`${this.selectors.testRunHeader}:nth-child(${index + 1})`);
        }
    }

    // Test Details Methods
    async getTestSummary() {
        return await this.getText(this.selectors.testSummary);
    }

    async getTestDetails() {
        return await this.getText(this.selectors.testDetails);
    }

    async getPassedCount() {
        return await this.getText(this.selectors.passedCount);
    }

    async getFailedCount() {
        return await this.getText(this.selectors.failedCount);
    }

    async getStartTime() {
        return await this.getText(this.selectors.startTime);
    }

    async getDuration() {
        return await this.getText(this.selectors.duration);
    }

    async getSuccessRate() {
        return await this.getText(this.selectors.successRate);
    }

    // Wait Methods
    async waitForTestRunsToLoad() {
        await this.waitForElementToBeHidden(this.selectors.loadingPlaceholder);
        await this.waitForElement(this.selectors.testRunList);
    }

    async waitForTestDetailsToLoad(index) {
        await this.waitForElement(`${this.selectors.testRunCard}:nth-child(${index + 1}) ${this.selectors.testDetails}`);
    }
}

module.exports = { LiveTestAutomationPage };
