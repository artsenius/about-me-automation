const { BasePage } = require('../basePage');
const { common } = require('../selectors');

class Header extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = common;
    }

    // Navigation visibility
    async verifyHeaderVisible() {
        return await this.isVisible(this.selectors.navigation);
    }

    // Mobile Navigation
    async isHamburgerMenuVisible() {
        try {
            // Wait for navigation to be ready
            await this.waitForNavigation();
            // Then check if the menu button exists and is visible
            const menuButton = await this.page.locator(this.selectors.hamburgerMenu);
            const isVisible = await menuButton.isVisible();
            return isVisible;
        } catch (e) {
            return false;
        }
    }

    async openHamburgerMenu() {
        if (await this.isHamburgerMenuVisible()) {
            // Open menu if not already open
            if (!await this.isVisible(this.selectors.navList)) {
                await this.click(this.selectors.hamburgerMenu);
                // Wait for the animation and menu to be fully visible
                await this.waitForTimeout(500);
                await this.waitForVisible(this.selectors.navList);
                // Additional wait for animation
                await this.waitForTimeout(500);
            }
        }
    }

    async closeHamburgerMenu() {
        if (await this.isHamburgerMenuVisible()) {
            // Close menu if open
            if (await this.isVisible(this.selectors.navList)) {
                await this.click(this.selectors.hamburgerMenu);
                // Wait for the animation and menu to be hidden
                await this.waitForTimeout(500);
                await this.waitForNotVisible(this.selectors.navList);
            }
        }
    }

    async verifyMobileNavigation() {
        if (!await this.isHamburgerMenuVisible()) {
            return false;
        }

        // Open menu and verify links
        await this.openHamburgerMenu();
        // Wait for animation and menu to be fully visible
        await this.waitForTimeout(500);
        // All links should be visible when the menu is open
        const allLinks = await this.page.locator(this.selectors.navLinks).all();
        const visibilityStates = await Promise.all(allLinks.map(link => link.isVisible()));
        const linksVisible = visibilityStates.every(visible => visible);
        const allLinksPresent = await this.verifyAllLinksPresent();

        // Close menu and verify it's closed
        await this.closeHamburgerMenu();
        const menuClosed = !await this.isVisible(this.selectors.navList);

        return linksVisible && allLinksPresent && menuClosed;
    }

    // Navigation State
    async verifyAllLinksPresent() {
        const links = await this.getElementsText(this.selectors.navLinks);
        const requiredLinks = ['About Me', 'About This App', 'Live Automation', 'Contact'];
        return requiredLinks.every(link => links.includes(link));
    }

    async verifyActiveLink(linkText) {
        const dataTestIdMap = {
            'About Me': 'nav-link-about',
            'About This App': 'nav-link-about-app',
            'Live Automation': 'nav-link-automation',
            'Contact': 'nav-link-contact'
        };

        // Get the color of the link to check if it's active
        const link = await this.page.locator(`[data-testid="${dataTestIdMap[linkText]}"]`);
        const color = await link.evaluate(el => window.getComputedStyle(el).color);

        // Active link has color #3498db (RGB: 52, 152, 219)
        return color === 'rgb(52, 152, 219)';
    }

    // Navigation Actions
    async navigateToAboutMe() {
        if (await this.isHamburgerMenuVisible()) {
            await this.openHamburgerMenu();
            // On mobile, wait after menu opens before clicking
            await this.waitForTimeout(500);
        }

        await Promise.all([
            this.waitForNavigation(),
            this.click(this.selectors.navLinkAboutMe)
        ]);

        // Close menu after navigation on mobile
        if (await this.isHamburgerMenuVisible()) {
            await this.closeHamburgerMenu();
        }
    }

    async navigateToAboutApp() {
        if (await this.isHamburgerMenuVisible()) {
            await this.openHamburgerMenu();
            // On mobile, wait after menu opens before clicking
            await this.waitForTimeout(500);
        }

        await Promise.all([
            this.waitForNavigation(),
            this.click(this.selectors.navLinkAboutApp)
        ]);

        // Close menu after navigation on mobile
        if (await this.isHamburgerMenuVisible()) {
            await this.closeHamburgerMenu();
        }
    }

    async navigateToLiveAutomation() {
        if (await this.isHamburgerMenuVisible()) {
            await this.openHamburgerMenu();
            // On mobile, wait after menu opens before clicking
            await this.waitForTimeout(500);
        }

        await Promise.all([
            this.waitForNavigation(),
            this.click(this.selectors.navLinkLiveAutomation)
        ]);

        // Close menu after navigation on mobile
        if (await this.isHamburgerMenuVisible()) {
            await this.closeHamburgerMenu();
        }
    }

    async navigateToContact() {
        if (await this.isHamburgerMenuVisible()) {
            await this.openHamburgerMenu();
            // On mobile, wait after menu opens before clicking
            await this.waitForTimeout(500);
        }

        await Promise.all([
            this.waitForNavigation(),
            this.click(this.selectors.navLinkContact)
        ]);

        // Close menu after navigation on mobile
        if (await this.isHamburgerMenuVisible()) {
            await this.closeHamburgerMenu();
        }
    }

    // Navigation Methods
    async prepareForNavigation() {
        // If hamburger menu is visible, make sure it's open before navigating
        if (await this.isHamburgerMenuVisible()) {
            await this.openHamburgerMenu();
        }
    }

    async navigateToAboutMe() {
        await this.prepareForNavigation();
        await this.click(this.selectors.navLinkAboutMe);
    }

    async navigateToAboutApp() {
        await this.prepareForNavigation();
        await this.click(this.selectors.navLinkAboutApp);
    }

    async navigateToLiveAutomation() {
        await this.prepareForNavigation();
        await this.click(this.selectors.navLinkLiveAutomation);
    }

    async navigateToContact() {
        await this.prepareForNavigation();
        await this.click(this.selectors.navLinkContact);
    }

    // Helper methods
    async waitForVisible(selector) {
        await this.page.locator(selector).waitFor({ state: 'visible' });
    }

    async waitForNotVisible(selector) {
        await this.page.locator(selector).waitFor({ state: 'hidden' });
    }

    async isVisible(selector) {
        const element = this.page.locator(selector);
        try {
            await element.waitFor({ state: 'visible', timeout: 2000 });
            return true;
        } catch (e) {
            return false;
        }
    }

    async waitForTimeout(ms) {
        await this.page.waitForTimeout(ms);
    }
}

module.exports = { Header };
