const { expect } = require('@playwright/test');

/**
 * Base page object that provides framework-agnostic methods for web interactions
 * All framework-specific implementations should be contained within this class
 */
class BasePage {
    constructor(page) {
        this.page = page;
    }

    async waitForNavigation() {
        // Wait for navigation and state to settle
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.page.waitForLoadState('networkidle'),
            this.page.waitForLoadState('load')
        ]);

        // Additional wait to ensure React state and animations are fully completed
        await this.page.waitForTimeout(1000);
    }

    async getCurrentUrl() {
        return this.page.url();
    }

    // Element Actions
    async click(selector) {
        await this.page.locator(selector).click();
        // After clicking a navigation link, wait for navigation to complete
        if (selector.includes('nav') || selector.includes('header')) {
            await this.waitForNavigation();
        }
    }

    async type(selector, text) {
        await this.page.locator(selector).fill(text);
    }

    async clear(selector) {
        await this.page.locator(selector).clear();
    }

    async hover(selector) {
        await this.page.locator(selector).hover();
    }

    // Element State Checks
    async isVisible(selector) {
        return await this.page.locator(selector).isVisible();
    }

    async waitForVisible(selector) {
        await this.page.locator(selector).waitFor({ state: 'visible' });
    }

    async waitForNotVisible(selector) {
        await this.page.locator(selector).waitFor({ state: 'hidden' });
    }

    async waitForTimeout(ms) {
        await this.page.waitForTimeout(ms);
    }

    // Element Text and Content
    async getText(selector) {
        const element = await this.page.locator(selector);
        if (!await element.isVisible()) {
            throw new Error(`Element with selector "${selector}" is not visible`);
        }
        const text = await element.textContent();
        return text ? text.trim() : '';
    }

    async getElementsText(selector) {
        const elements = await this.page.locator(selector).all();
        return Promise.all(elements.map(el => el.textContent()));
    }

    async getElements(selector) {
        return await this.page.locator(selector).all();
    }

    // Form Interactions
    async selectOption(selector, value) {
        await this.page.locator(selector).selectOption(value);
    }

    async upload(selector, filePath) {
        await this.page.locator(selector).setInputFiles(filePath);
    }

    // Wait Conditions
    async waitForText(selector, text) {
        await this.page.locator(selector).waitFor({ hasText: text });
    }

    async waitForTimeout(ms) {
        await this.page.waitForTimeout(ms);
    }

    // JavaScript Operations
    async executeScript(script, ...args) {
        return await this.page.evaluate(script, ...args);
    }

    // Window Operations
    async switchToFrame(selector) {
        const frame = await this.page.frameLocator(selector);
        return frame;
    }

    async switchToTab(index) {
        const pages = this.page.context().pages();
        await pages[index].bringToFront();
        this.page = pages[index];
    }

    // Screenshots
    async takeScreenshot(path) {
        await this.page.screenshot({ path });
    }

    async takeElementScreenshot(selector, path) {
        await this.page.locator(selector).screenshot({ path });
    }

    // Browser Storage
    async getLocalStorage(key) {
        return await this.page.evaluate(k => localStorage.getItem(k), key);
    }

    async setLocalStorage(key, value) {
        await this.page.evaluate((k, v) => localStorage.setItem(k, v), key, value);
    }

    async clearLocalStorage() {
        await this.page.evaluate(() => localStorage.clear());
    }

    // Network
    async waitForResponse(urlOrPredicate, timeout = 5000) {
        return await this.page.waitForResponse(urlOrPredicate, { timeout });
    }

    // Element State Assertions
    async expectToBeVisible(selector, timeout = 5000) {
        await expect(this.page.locator(selector)).toBeVisible({ timeout });
    }

    async expectToBeHidden(selector, timeout = 5000) {
        await expect(this.page.locator(selector)).toBeHidden({ timeout });
    }

    async expectToHaveText(selector, text, timeout = 5000) {
        await expect(this.page.locator(selector)).toHaveText(text, { timeout });
    }

    async expectToContainText(selector, text, timeout = 5000) {
        await expect(this.page.locator(selector)).toContainText(text, { timeout });
    }

    // Keyboard Actions
    async pressKey(key) {
        await this.page.keyboard.press(key);
    }

    async typeText(text) {
        await this.page.keyboard.type(text);
    }

    // Mouse Actions
    async mouseMove(x, y) {
        await this.page.mouse.move(x, y);
    }

    async mouseClick(x, y) {
        await this.page.mouse.click(x, y);
    }

    // Utility Methods
    async sleep(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    async getTitle() {
        return this.page.title();
    }

    // Header Navigation Methods
    async verifyHeaderNavigationVisible() {
        await this.expectToBeVisible('[data-testid="header-nav"]');
    }

    async clickHeaderLink(linkTestId) {
        await this.verifyHeaderNavigationVisible();
        await this.click(`[data-testid="${linkTestId}"]`);
        await this.waitForNavigation();
    }

    async ensureHeaderNavigationActive() {
        const isMobile = await this.page.viewportSize().then(size => size.width <= 768);
        if (isMobile) {
            const menuButton = '[data-testid="hamburger-menu"]';
            if (await this.isVisible(menuButton)) {
                await this.click(menuButton);
                await this.waitForVisible('[data-testid="header-nav"]');
            }
        }
        await this.verifyHeaderNavigationVisible();
    }

    // Navigation - Only allow initial landing page navigation
    async navigateToLandingPage(url) {
        await this.page.goto(url);
        await this.waitForNavigation();
        await this.ensureHeaderNavigationActive();
    }
}

module.exports = { BasePage };
