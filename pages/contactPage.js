// contactPage.js
const { BasePage } = require('./basePage');
const selectors = require('./selectors');
const CONTACT_SELECTORS = selectors.contact;

class ContactPage extends BasePage {
    constructor(page) {
        super(page);
        this.grid = page.locator(CONTACT_SELECTORS.grid);
        this.headingGetInTouch = page.getByText(/Get In touch/i);
        this.cards = page.locator(CONTACT_SELECTORS.cards);
    }
}

module.exports = { ContactPage };
