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
        await this.expectToBeVisible(this.selectors.architectureSection);
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

    // Enhanced testing methods
    async verifyPageTitle() {
        return await this.page.title();
    }

    async verifyAllGitHubLinksNavigation() {
        const links = [
            { method: 'clickFrontendCodeLink', name: 'Frontend' },
            { method: 'clickBackendCodeLink', name: 'Backend' },
            { method: 'clickAutomationCodeLink', name: 'Automation' }
        ];

        const results = [];
        for (const link of links) {
            const [popup] = await Promise.all([
                this.page.waitForEvent('popup'),
                this[link.method]()
            ]);
            results.push({ name: link.name, popup: popup, url: await popup.url() });
            await popup.close();
        }
        return results;
    }

    async verifyLinkUrls() {
        const links = {
            frontend: await this.page.locator(this.selectors.frontendCodeLink).getAttribute('href'),
            backend: await this.page.locator(this.selectors.backendCodeLink).getAttribute('href'),
            automation: await this.page.locator(this.selectors.automationCodeLink).getAttribute('href'),
            liveResults: await this.page.locator(this.selectors.liveTestResultsLink).getAttribute('href')
        };
        return links;
    }

    async verifyArchitectureSection() {
        return await this.isVisible(this.selectors.architectureSection);
    }

    async getSectionContent(sectionSelector) {
        return await this.page.locator(sectionSelector).textContent();
    }

    async verifyAllSectionContent() {
        const sections = {
            components: await this.getSectionContent(this.selectors.componentsSection),
            architecture: await this.getSectionContent(this.selectors.architectureSection),
            frontend: await this.getSectionContent(this.selectors.frontendSection),
            backend: await this.getSectionContent(this.selectors.backendSection),
            automation: await this.getSectionContent(this.selectors.automationSection),
            devTools: await this.getSectionContent(this.selectors.devToolsSection)
        };
        return sections;
    }
}

module.exports = { AboutAppPage };
