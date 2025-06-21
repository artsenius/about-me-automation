// selectors.js
// Centralized selectors for all pages

module.exports = {
    about: {
        navAbout: '[data-testid="nav-link-about"]',
        navContact: '[data-testid="nav-link-contact"]',
        headingAboutMe: 'role=heading[name="About Me"]',
        headingArthurSenko: 'role=heading[name="Arthur Senko"]',
        headingSeniorQALeader: '[data-testid="profile-position"]',
        headingCurrentRole: 'role=heading[name="Current Role"]',
        headingTechnicalSkills: 'role=heading[name="Technical Skills"]',
        headingNotableAchievements: 'role=heading[name="Notable Achievements"]',
        downloadResume: 'role=link[name="Download Resume"]',
        photo: 'img[src*="art."]',
        copyright: 'text=/© 2025 Arthur Senko/',
        skillWebdriverIO: '[data-testid="skill-item-0"]',
        skillCypress: '[data-testid="skill-item-1"]',
        skillPlaywright: '[data-testid="skill-item-2"]',
        skillSelenium: '[data-testid="skill-item-3"]',
        skillAppium: '[data-testid="skill-item-4"]',
        achievement1: '[data-testid="achievement-1"]',
        achievement2: '[data-testid="achievement-2"]',
        achievement3: '[data-testid="achievement-3"]',
        achievement4: '[data-testid="achievement-4"]',
    },
    contact: {
        grid: '[data-testid="contact-grid"]',
        headingGetInTouch: 'role=heading[name="Get In touch"]',
        cards: '[data-testid="contact-grid"] [data-testid^="contact-card-"]',
    }
};
