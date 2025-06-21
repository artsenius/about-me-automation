// contact-page.spec.js
const { test, expect } = require('@playwright/test');
const { AboutPage } = require('../pages/aboutPage');
const { ContactPage } = require('../pages/contactPage');

test.describe('Contact Page', () => {
    test('should navigate from About page and display Contact page content', async ({ page }) => {
        await page.goto('https://artsenius.github.io/about/');
        const about = new AboutPage(page);
        await expect(about.navContact).toBeVisible();
        await about.navContact.click();
        const contact = new ContactPage(page);
        await expect(contact.grid).toBeVisible();
        await expect(contact.headingGetInTouch).toBeVisible();
        await expect(await contact.cards.count()).toBe(3);
    });
});
