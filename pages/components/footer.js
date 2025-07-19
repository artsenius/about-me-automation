const { BasePage } = require('../basePage');
const selectors = require('../selectors');

class Footer extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.footer;
    }

    async isFooterVisible() {
        return await this.isVisible(this.selectors.footer);
    }

    async getCopyrightText() {
        return await this.getText(this.selectors.copyright);
    }

    async verifyCopyrightPresent() {
        return await this.isVisible(this.selectors.copyright);
    }
}

module.exports = { Footer };
