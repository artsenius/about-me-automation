const { BasePage } = require('./basePage');
const selectors = require('./selectors');

class LiveAutomationPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.automation;
        this.commonSelectors = selectors.common;
    }

    // Core Page Elements
    async getPageTitle() {
        return await this.getText(this.commonSelectors.pageTitle);
    }

    async verifyContent() {
        // Allow extra time for the section to render on slow networks
        await this.expectToBeVisible(this.selectors.section, 15000);
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

    async getTestRunCount() {
        await this.waitForTestResults();
        return await this.page.locator(this.selectors.testRunCard).count();
    }

    async clickLoadMore() {
        // The Load more button does not have a data-testid, use role + text
        const loadMore = this.page.getByRole('button', { name: /Load more results/i });
        if (await loadMore.isVisible()) {
            await loadMore.click();
            // Wait for potential network and new cards to appear
            await this.page.waitForLoadState('networkidle');
        }
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
        const headers = this.page.locator(this.selectors.testRunHeader);
        const cards = this.page.locator(this.selectors.testRunCard);
        const header = headers.nth(index);
        const card = cards.nth(index);

        await header.click();
        await this.waitForTimeout(300);

        // Prefer checking aria-expanded on the header for robustness
        try {
            await header.getAttribute('aria-expanded');
            await this.page.locator(`${this.selectors.testRunHeader}[aria-expanded="true"]`).nth(index).waitFor();
        } catch (e) {
            // Fallback to checking visible content region within the card
        }

        const explicitContent = card.locator(this.selectors.testRunContent);
        const hasExplicitContent = await explicitContent.count();
        if (hasExplicitContent > 0) {
            await explicitContent.first().waitFor({ state: 'visible' });
            return;
        }

        // Fallbacks: region or tabpanel used by the app
        const region = card.locator('[role="region"], [role="tabpanel"]').first();
        await region.waitFor({ state: 'visible' });
    }

    async collapseTestResult(index) {
        const headers = this.page.locator(this.selectors.testRunHeader);
        const cards = this.page.locator(this.selectors.testRunCard);
        const header = headers.nth(index);
        const card = cards.nth(index);

        await header.click();
        await this.waitForTimeout(300);

        const explicitContent = card.locator(this.selectors.testRunContent);
        const hasExplicitContent = await explicitContent.count();
        if (hasExplicitContent > 0) {
            await explicitContent.first().waitFor({ state: 'hidden' });
            return;
        }

        // Fallback: wait for aria-expanded to become false
        try {
            await this.page.locator(`${this.selectors.testRunHeader}[aria-expanded="false"]`).nth(index).waitFor();
        } catch (e) {
            // If aria-expanded not present, ensure region/tabpanel is hidden
            const region = card.locator('[role="region"], [role="tabpanel"]').first();
            await region.waitFor({ state: 'hidden' });
        }
    }

    async isTestResultExpanded(index) {
        const headers = this.page.locator(this.selectors.testRunHeader);
        const header = headers.nth(index);
        const aria = await header.getAttribute('aria-expanded');
        if (aria !== null) {
            return aria === 'true';
        }
        const card = this.page.locator(this.selectors.testRunCard).nth(index);
        const explicitContent = card.locator(this.selectors.testRunContent);
        if (await explicitContent.count() > 0) {
            return await explicitContent.first().isVisible();
        }
        const region = card.locator('[role="region"], [role="tabpanel"]').first();
        return await region.isVisible();
    }

    async getHeaderAriaExpanded(index) {
        const header = this.page.locator(this.selectors.testRunHeader).nth(index);
        return await header.getAttribute('aria-expanded');
    }

    // Test Result Content Verification
    async verifyTestResultContent(index) {
        const card = await this.getTestRunCard(index);
        if (!card) return false;

        if (!await this.isTestResultExpanded(index)) {
            await this.expandTestResult(index);
        }

        // Prefer explicit content container, otherwise use role-based region
        let contentRoot = card.locator(this.selectors.testRunContent).first();
        if (await contentRoot.count() === 0) {
            contentRoot = card.locator('[role="region"], [role="tabpanel"]').first();
        }
        await contentRoot.waitFor({ state: 'visible' });

        // Validate presence of key summary labels within the content
        await contentRoot.getByText('Duration', { exact: false }).waitFor();
        await contentRoot.getByText('Success Rate', { exact: false }).waitFor();
        await contentRoot.getByText('Passed', { exact: false }).waitFor();
        await contentRoot.getByText('Failed', { exact: false }).waitFor();

        return true;
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
