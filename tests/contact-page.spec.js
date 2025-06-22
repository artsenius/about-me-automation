const { test, expect } = require('@playwright/test');
const { ContactPage } = require('../pages/contactPage');
const { Header } = require('../pages/components/header');

let contactPage;
let header;

test.describe('Contact Page', () => {
    test.beforeEach(async ({ page }) => {
        contactPage = new ContactPage(page);
        header = new Header(page);
        await page.goto('');
    });

    test('should be accessible via header navigation', async () => {
        await header.navigateToContact();
        await contactPage.verifyAllContactCards();
    });

    test('should display all contact cards', async () => {
        await header.navigateToContact();
        await contactPage.verifyAllContactCards();
    });

    test('should display correct contact information', async () => {
        await header.navigateToContact();

        // Verify each contact card fully
        await contactPage.verifyEmailCard();
        await contactPage.verifyPhoneCard();
        await contactPage.verifyLinkedInCard();

        // Verify content formats
        const email = await contactPage.getEmailAddress();
        expect(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/); // Basic email format validation

        const phone = await contactPage.getPhoneNumber();
        expect(phone).toMatch(/^[+\d\s()-]+$/); // Basic phone format validation

        const linkedInUrl = await contactPage.getLinkedInUrl();
        expect(linkedInUrl).toContain('linkedin.com/in/');
    });

    test('should show copy confirmation when clicking copy buttons', async () => {
        await header.navigateToContact();

        // Test copying email
        await contactPage.clickEmailCopy();

        // Test copying phone
        await contactPage.clickPhoneCopy();

        // Test copying LinkedIn URL
        await contactPage.clickLinkedInCopy();
    });
});
