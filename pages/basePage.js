// basePage.js
// Base page object for reusable methods

class BasePage {
    constructor(page) {
        this.page = page;
    }
    async goto(url) {
        await this.page.goto(url);
    }
    async click(selector) {
        await this.page.click(selector);
    }
    async isVisible(selector) {
        return await this.page.isVisible(selector);
    }
    async getText(selector) {
        return await this.page.textContent(selector);
    }
}

module.exports = { BasePage };
