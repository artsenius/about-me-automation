const { BasePage } = require('./basePage');
const selectors = require('./selectors');

class LiveAutomationPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.automation;
    }

    // Core Page Elements
    async verifyHeading() {
        await this.expectToBeVisible(this.selectors.title);
    }

    async verifyContent() {
        await this.expectToBeVisible(this.selectors.section);
    }

    // Test Results Loading
    async waitForTestResults() {
        await this.waitForNotVisible(this.selectors.loadingPlaceholder);
        await this.waitForVisible(this.selectors.testRunList);
        // Wait for the first test run card
        await this.page.locator(this.selectors.testRunCard).first().waitFor({ state: 'visible' });
    }

    async getTestResultComponents() {
        await this.waitForTestResults();
        return await this.page.locator(this.selectors.testRunCard).all();
    }

    // Test Run Card Actions
    async getTestRunCard(index) {
        const cards = await this.getTestResultComponents();
        if (index < cards.length) {
            return cards[index];
        }
        return null;
    }

    async expandTestResult(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            // Click the header to expand
            await card.locator(this.selectors.testRunHeader).click();
            await this.waitForTimeout(500); // Wait for animation
            // Wait for content within this card
            const content = card.locator(this.selectors.testRunContent);
            await content.waitFor({ state: 'visible' });
        }
    }

    async collapseTestResult(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            // Click the header to collapse
            await card.locator(this.selectors.testRunHeader).click();
            await this.waitForTimeout(500); // Wait for animation
            // Wait for content within this card
            const content = card.locator(this.selectors.testRunContent);
            await content.waitFor({ state: 'hidden' });
        }
    }

    async isTestResultExpanded(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            const content = card.locator(this.selectors.testRunContent);
            return await content.isVisible();
        }
        return false;
    }

    // Test Result Content Verification
    async verifyTestResultContent(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            // First make sure the content is expanded
            if (!await this.isTestResultExpanded(index)) {
                await this.expandTestResult(index);
            }

            // Verify all required elements are present
            await card.locator(this.selectors.testRunContent).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testRunDuration).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testRunSuccessRate).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testRunPassedTests).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testRunFailedTests).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testRunSkippedTests).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testRunBlockedTests).waitFor({ state: 'visible' });
            await card.locator(this.selectors.testDetails).waitFor({ state: 'visible' });

            return true;
        }
        return false;
    }

    // Test Result Info
    async getTestName(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            const header = await card.locator(this.selectors.testRunHeader);
            return await header.textContent();
        }
        return null;
    }

    async getTestDuration(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            if (!await this.isTestResultExpanded(index)) {
                await this.expandTestResult(index);
            }
            const duration = await card.locator(this.selectors.testRunDuration);
            return await duration.textContent();
        }
        return null;
    }

    async getTestStatus(index) {
        const card = await this.getTestRunCard(index);
        if (card) {
            const passed = await card.locator(this.selectors.testRunPassedTests);
            const failed = await card.locator(this.selectors.testRunFailedTests);
            const passCount = parseInt((await passed.textContent())?.match(/\d+/)?.[0] || '0');
            const failCount = parseInt((await failed.textContent())?.match(/\d+/)?.[0] || '0');
            return passCount > 0 && failCount === 0 ? 'passed' : 'failed';
        }
        return null;
    }
}

module.exports = { LiveAutomationPage };
