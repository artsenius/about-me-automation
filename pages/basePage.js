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
        try {
            const locator = this.page.locator(selector);
            const count = await locator.count();
            
            if (count === 0) {
                throw new Error(`No elements found for selector: ${selector}`);
            } else if (count === 1) {
                await locator.click();
            } else {
                // Multiple elements found, click first visible one
                const elements = await locator.all();
                for (const element of elements) {
                    try {
                        if (await element.isVisible()) {
                            await element.click();
                            break;
                        }
                    } catch (e) {
                        continue; // Try next element
                    }
                }
            }
            
            // After clicking a navigation link, wait for navigation to complete
            if (selector.includes('nav') || selector.includes('header')) {
                await this.waitForNavigation();
            }
        } catch (error) {
            console.log(`Error clicking selector "${selector}": ${error.message}`);
            throw error;
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
        try {
            // Handle strict mode violations by using first() element
            const locator = this.page.locator(selector);
            const count = await locator.count();
            
            if (count === 0) {
                return false;
            } else if (count === 1) {
                return await locator.isVisible();
            } else {
                // Multiple elements found, use first visible one
                return await locator.first().isVisible();
            }
        } catch (error) {
            console.log(`Error checking visibility for selector "${selector}": ${error.message}`);
            return false;
        }
    }

    async waitForVisible(selector) {
        try {
            const locator = this.page.locator(selector);
            const count = await locator.count();
            
            if (count === 1) {
                await locator.waitFor({ state: 'visible' });
            } else if (count > 1) {
                await locator.first().waitFor({ state: 'visible' });
            } else {
                throw new Error(`No elements found for selector: ${selector}`);
            }
        } catch (error) {
            console.log(`Error waiting for visibility for selector "${selector}": ${error.message}`);
            throw error;
        }
    }

    async waitForNotVisible(selector) {
        await this.page.locator(selector).waitFor({ state: 'hidden' });
    }

    async waitForTimeout(ms) {
        await this.page.waitForTimeout(ms);
    }

    // Element Text and Content
    async getText(selector) {
        try {
            const locator = this.page.locator(selector);
            const count = await locator.count();
            
            if (count === 0) {
                return '';
            } else if (count === 1) {
                return await locator.textContent() || '';
            } else {
                // Multiple elements found, get text from first one
                return await locator.first().textContent() || '';
            }
        } catch (error) {
            console.log(`Error getting text for selector "${selector}": ${error.message}`);
            return '';
        }
    }

    async getElementsText(selector) {
        try {
            const elements = await this.page.locator(selector).all();
            const texts = [];
            
            for (const element of elements) {
                try {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        texts.push(text.trim());
                    }
                } catch (e) {
                    // Skip elements that can't be accessed
                }
            }
            
            return texts;
        } catch (error) {
            console.log(`Error getting elements text for selector "${selector}": ${error.message}`);
            return [];
        }
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
