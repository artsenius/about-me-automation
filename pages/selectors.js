/**
 * Centralized selectors for all pages
 * Using React component data-testid attributes
 */

module.exports = {
    // Common selectors used across components
    common: {
        // Navigation
        navigation: '[data-testid="header-nav"]',
        navContainer: '[data-testid="nav-container"]',
        navList: '[data-testid="nav-list"]',
        navLinks: '[data-testid^="nav-link-"]',
        navLinkAboutMe: '[data-testid="nav-link-about"]',
        navLinkAboutApp: '[data-testid="nav-link-about-app"]',
        navLinkLiveAutomation: '[data-testid="nav-link-automation"]',
        navLinkContact: '[data-testid="nav-link-contact"]',

        // Mobile menu elements
        hamburgerMenu: '[data-testid="nav-menu-button"]',
        mobileNavList: '[data-testid="nav-list"][data-mobile="true"]',
        pageTitle: '[data-testid="page-title"]',

        // Footer elements
        footer: '[data-testid="footer"]',
        copyright: '[data-testid="footer-copyright"]'
    },

    about: {
        // About Page elements
        profileSection: '[data-testid="profile-section"]',
        profileImage: '[data-testid="profile-image"]',
        profileName: '[data-testid="profile-name"]',
        profilePosition: '[data-testid="profile-position"]',
        resumeLink: '[data-testid="resume-link"]',
        summary: '[data-testid="about-bio"]',

        // Current Role Section
        currentRoleSection: '[data-testid="current-role-section"]',
        currentRoleTitle: '[data-testid="current-role-title"]',
        currentRoleCompany: '[data-testid="role-company"]',
        currentRoleDuration: '[data-testid="role-duration"]',
        allerganLink: 'a[href*="allerganaesthetics.com"]',
        abbvieLink: 'a[href*="abbvie.com"]',

        // Technical Skills Section
        skillsSection: '[data-testid="skills-section"]',
        skillsTitle: '[data-testid="skills-title"]',
        skillsList: '[data-testid="skills-list"]',
        skillItems: '[data-testid^="skill-item-"]',

        // Achievements Section
        achievementsSection: '[data-testid="achievements-section"]',
        achievementsTitle: '[data-testid="achievements-title"]',
        achievementsList: '[data-testid="achievements-list"]',
        achievementItems: '[data-testid="achievements-list"] > li',
        
        // Additional elements
        appInfoBox: '[data-testid="app-info-box"]',
        backToTopButton: '[aria-label="Back to top"]',
    },

    automation: {
        // Page elements
        section: '[data-testid="test-automation-section"]',

        // Test Run List
        testRunList: '[data-testid="test-run-list"]',

        // Test Run Card elements
        testRunCard: '[data-testid^="test-run-card-"]',
        testRunHeader: '[data-testid^="test-run-header-"]',
        testRunContent: '[data-testid="test-run-content"]',

        // Test Run Stats
        testRunDuration: '[data-testid="test-run-duration"]',
        testRunSuccessRate: '[data-testid="test-run-success-rate"]',
        testRunPassedTests: '[data-testid="test-run-passed-tests"]',
        testRunFailedTests: '[data-testid="test-run-failed-tests"]',
        testRunSkippedTests: '[data-testid="test-run-skipped-tests"]',
        testRunBlockedTests: '[data-testid="test-run-blocked-tests"]',
        testDetails: '[data-testid^="test-details-"]',

        // Loading state
        loadingPlaceholder: '[data-testid="loading-placeholder"]'
    }, contact: {
        // Contact Cards
        emailCard: '[data-testid="contact-card-email"]',
        phoneCard: '[data-testid="contact-card-phone"]',
        linkedInCard: '[data-testid="contact-card-linkedin"]',

        // Email Elements
        emailHeading: '[data-testid="contact-card-email"] h3:has-text("Email")',
        emailLink: '[data-testid="contact-card-email"] a[href^="mailto:"]',
        emailCopyButton: '[data-testid="contact-card-email"] button',
        emailCopiedState: '[data-testid="copy-message-email"]',

        // Phone Elements
        phoneHeading: '[data-testid="contact-card-phone"] h3:has-text("Phone")',
        phoneLink: '[data-testid="contact-card-phone"] a[href^="tel:"]',
        phoneCopyButton: '[data-testid="contact-card-phone"] button',
        phoneCopiedState: '[data-testid="copy-message-phone"]',

        // LinkedIn Elements
        linkedInHeading: '[data-testid="contact-card-linkedin"] h3:has-text("LinkedIn")',
        linkedInLink: '[data-testid="contact-card-linkedin"] a[href*="linkedin.com"]',
        linkedInCopyButton: '[data-testid="contact-card-linkedin"] button',
        linkedInCopiedState: '[data-testid="copy-message-linkedin"]',
    },

    aboutApp: {
        // Component Sections
        componentsSection: '[data-testid="about-app-components"]',
        architectureSection: '[data-testid="about-app-architecture"]',
        frontendSection: '[data-testid="about-app-frontend"]',
        backendSection: '[data-testid="about-app-backend"]',
        automationSection: '[data-testid="about-app-automation-framework"]',
        devToolsSection: '[data-testid="about-app-development-tools"]',

        // GitHub Links
        frontendCodeLink: '[data-testid="github-frontend-link"]',
        backendCodeLink: '[data-testid="github-backend-link"]',
        automationCodeLink: '[data-testid="about-app-automation-link"]',
        liveTestResultsLink: '[data-testid="live-automation-link"]',
    },
};
