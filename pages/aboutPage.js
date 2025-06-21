const { BasePage } = require('./basePage');
const selectors = require('./selectors');
const ABOUT_SELECTORS = selectors.about;

class AboutPage extends BasePage {
    constructor(page) {
        super(page);
        this.navAbout = page.locator(ABOUT_SELECTORS.navAbout);
        this.navContact = page.locator(ABOUT_SELECTORS.navContact);
        this.headingAboutMe = page.locator(ABOUT_SELECTORS.headingAboutMe);
        this.headingArthurSenko = page.locator(ABOUT_SELECTORS.headingArthurSenko);
        this.headingSeniorQALeader = page.locator(ABOUT_SELECTORS.headingSeniorQALeader);
        this.headingCurrentRole = page.locator(ABOUT_SELECTORS.headingCurrentRole);
        this.headingTechnicalSkills = page.locator(ABOUT_SELECTORS.headingTechnicalSkills);
        this.headingNotableAchievements = page.locator(ABOUT_SELECTORS.headingNotableAchievements);
        this.downloadResume = page.locator(ABOUT_SELECTORS.downloadResume);
        this.photo = page.locator(ABOUT_SELECTORS.photo);
        this.copyright = page.locator(ABOUT_SELECTORS.copyright);
        this.skillWebdriverIO = page.locator(ABOUT_SELECTORS.skillWebdriverIO);
        this.skillCypress = page.locator(ABOUT_SELECTORS.skillCypress);
        this.skillPlaywright = page.locator(ABOUT_SELECTORS.skillPlaywright);
        this.skillSelenium = page.locator(ABOUT_SELECTORS.skillSelenium);
        this.skillAppium = page.locator(ABOUT_SELECTORS.skillAppium);
        this.achievement1 = page.locator(ABOUT_SELECTORS.achievement1);
        this.achievement2 = page.locator(ABOUT_SELECTORS.achievement2);
        this.achievement3 = page.locator(ABOUT_SELECTORS.achievement3);
        this.achievement4 = page.locator(ABOUT_SELECTORS.achievement4);
    }
}

module.exports = { AboutPage };
