const { BasePage } = require('./basePage');
const selectors = require('./selectors');

class ContactPage extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = selectors.contact;
    }

    // Core Elements
    async verifyHeading() {
        await this.expectToBeVisible(this.selectors.heading);
    }

    // Contact Cards
    async verifyEmailCard() {
        await this.expectToBeVisible(this.selectors.emailCard);
        await this.expectToBeVisible(this.selectors.emailHeading);
        await this.expectToBeVisible(this.selectors.emailLink);
        await this.expectToBeVisible(this.selectors.emailCopyButton);
    }

    async verifyPhoneCard() {
        await this.expectToBeVisible(this.selectors.phoneCard);
        await this.expectToBeVisible(this.selectors.phoneHeading);
        await this.expectToBeVisible(this.selectors.phoneLink);
        await this.expectToBeVisible(this.selectors.phoneCopyButton);
    }

    async verifyLinkedInCard() {
        await this.expectToBeVisible(this.selectors.linkedInCard);
        await this.expectToBeVisible(this.selectors.linkedInHeading);
        await this.expectToBeVisible(this.selectors.linkedInLink);
        await this.expectToBeVisible(this.selectors.linkedInCopyButton);
    }

    async verifyAllContactCards() {
        await this.verifyEmailCard();
        await this.verifyPhoneCard();
        await this.verifyLinkedInCard();
    }

    // Card Content
    async getEmailAddress() {
        return await this.getText(this.selectors.emailLink);
    }

    async getPhoneNumber() {
        return await this.getText(this.selectors.phoneLink);
    }

    async getLinkedInUrl() {
        const element = await this.page.locator(this.selectors.linkedInLink);
        return await element.getAttribute('href');
    }

    // Card Actions
    async clickEmailCopy() {
        await this.click(this.selectors.emailCopyButton);
        await this.expectToBeVisible(this.selectors.emailCopiedState, 2000);
    }

    async clickPhoneCopy() {
        await this.click(this.selectors.phoneCopyButton);
        await this.expectToBeVisible(this.selectors.phoneCopiedState, 2000);
    }

    async clickLinkedInCopy() {
        await this.click(this.selectors.linkedInCopyButton);
        await this.expectToBeVisible(this.selectors.linkedInCopiedState, 2000);
    }

    async openEmailLink() {
        await this.click(this.selectors.emailLink);
    }

    async openPhoneLink() {
        await this.click(this.selectors.phoneLink);
    }

    async openLinkedInLink() {
        await this.click(this.selectors.linkedInLink);
    }
}

module.exports = { ContactPage };
