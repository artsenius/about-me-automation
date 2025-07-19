/**
 * CSS Selectors for automated testing
 * Using data-testid attributes that exist on the website with fallbacks
 */
module.exports = {
    // Common/Header Navigation Selectors
    common: {
        navigation: '[data-testid="header-nav"], nav, header nav, .nav, .navigation',
        navContainer: '[data-testid="nav-container"], nav, .navbar, .nav-container',
        navList: '[data-testid="nav-list"], nav ul, .nav-list, .navbar-nav',
        navLinks: '[data-testid^="nav-link-"], nav a, nav button, .nav-link, .navbar-nav a, .navbar-nav button',
        navLinkAboutMe: '[data-testid="nav-link-about"], nav button:has-text("About Me"), nav a[href*="about"]:not([href*="app"])',
        navLinkAboutApp: '[data-testid="nav-link-about-app"], nav button:has-text("About This App"), nav a[href*="about"][href*="app"]',
        navLinkLiveAutomation: '[data-testid="nav-link-automation"], nav button:has-text("Live Automation"), nav a[href*="automation"], nav a[href*="live"]',
        navLinkContact: '[data-testid="nav-link-contact"], nav button:has-text("Contact"), nav a[href*="contact"]',
        
        // Mobile Navigation
        hamburgerMenu: '[data-testid="nav-menu-button"], .hamburger, .menu-toggle, button:has-text("Menu")',
        mobileNavList: '[data-testid="nav-list"][data-mobile="true"], .mobile-nav, .nav-mobile',
        pageTitle: '[data-testid="page-title"], [data-testid="mobile-page-title"], h1, .page-title'
    },

    // Footer Selectors
    footer: {
        footer: '[data-testid="footer"], footer, .footer, .site-footer',
        copyright: '[data-testid="footer-copyright"], footer *:has-text("©"), .copyright'
    },

    // About Page Selectors
    about: {
        profileSection: '[data-testid="profile-section"], .profile, .about-section, .hero-section',
        profileImage: '[data-testid="profile-image"], img[alt*="Arthur"], .profile-image, .headshot',
        profileName: '[data-testid="profile-name"]',
        resumeLink: '[data-testid="resume-link"], a[href*=".pdf"], a:has-text("Resume"), a[download]',
        summary: '[data-testid="about-bio"], .summary, .bio, .about-text, .description',
        
        // Current Role Section
        currentRoleSection: '[data-testid="current-role-section"], section:has-text("Current Role"), .current-role',
        currentRoleTitle: '[data-testid="current-role-title"], h2:has-text("Current Role"), h3:has-text("Current Role")',
        currentRoleContent: '.current-role p, section:has-text("Current Role") p',
        
        // Company Links Section
        companySection: 'section:has-text("Company"), .company-section, .experience-section',
        companyLinks: 'a[href*="company"], .company-link, a[target="_blank"]:not([href*="linkedin"]):not([href*="github"])',
        
        // Skills Section
        skillsSection: '[data-testid="skills-section"], section:has-text("Skills"), .skills-section',
        skillsTitle: '[data-testid="skills-title"], h2:has-text("Skills"), h3:has-text("Skills")',
        skillsList: '[data-testid="skills-list"], .skills-list, .skills ul, .skill-items',
        skillItems: '[data-testid^="skill-"], .skill, .skills li, .skill-item',
        
        // Achievements Section
        achievementsSection: '[data-testid="achievements-section"], section:has-text("Achievement"), .achievements',
        achievementsTitle: '[data-testid="achievements-title"], h2:has-text("Achievement"), h3:has-text("Achievement")',
        achievementsList: '[data-testid="achievements-list"], .achievements ul, .accomplishments ul',
        achievementItems: '[data-testid="achievements-list"] > li, .achievements li, .accomplishments li'
    },

    // Live Automation Page Selectors
    liveAutomation: {
        section: '[data-testid="test-automation-section"], .automation-section, .test-results',
        pageContent: '.automation-content, .test-automation, main',
        testRunList: '[data-testid="test-run-list"], .test-runs, .test-results-list',
        
        // Test Run Cards
        testRunCard: '[data-testid^="test-run-card-"], .test-run, .test-result-card',
        testRunHeader: '[data-testid^="test-run-header-"], .test-run-header, .test-result-header',
        testRunContent: '[data-testid="test-run-content"], .test-run-content, .test-result-content',
        
        // Test Run Details
        testRunDuration: '[data-testid="test-run-duration"], .duration, .test-duration',
        testRunSuccessRate: '[data-testid="test-run-success-rate"], .success-rate, .pass-rate',
        testRunPassedTests: '[data-testid="test-run-passed-tests"], .passed, .success',
        testRunFailedTests: '[data-testid="test-run-failed-tests"], .failed, .error',
        testRunSkippedTests: '[data-testid="test-run-skipped-tests"], .skipped, .pending',
        testRunBlockedTests: '[data-testid="test-run-blocked-tests"], .blocked, .disabled',
        testDetails: '[data-testid^="test-details-"], .test-details, .test-info',
        
        // Loading States
        loadingPlaceholder: '[data-testid="loading-placeholder"], .loading, .spinner'
    },

    // Contact Page Selectors
    contact: {
        emailCard: '[data-testid="contact-card-email"], .contact-email, .email-contact',
        phoneCard: '[data-testid="contact-card-phone"], .contact-phone, .phone-contact',
        linkedInCard: '[data-testid="contact-card-linkedin"], .contact-linkedin, .linkedin-contact',
        
        // Email Elements
        emailHeading: '[data-testid="contact-card-email"] h3:has-text("Email"), h3:has-text("Email")',
        emailLink: '[data-testid="contact-card-email"] a[href^="mailto:"], a[href^="mailto:"]',
        emailCopyButton: '[data-testid="contact-card-email"] button, .email-card button',
        emailCopiedState: '[data-testid="copy-message-email"], .copied, .copy-success',
        
        // Phone Elements
        phoneHeading: '[data-testid="contact-card-phone"] h3:has-text("Phone"), h3:has-text("Phone")',
        phoneLink: '[data-testid="contact-card-phone"] a[href^="tel:"], a[href^="tel:"]',
        phoneCopyButton: '[data-testid="contact-card-phone"] button, .phone-card button',
        phoneCopiedState: '[data-testid="copy-message-phone"], .copied, .copy-success',
        
        // LinkedIn Elements
        linkedInHeading: '[data-testid="contact-card-linkedin"] h3:has-text("LinkedIn"), h3:has-text("LinkedIn")',
        linkedInLink: '[data-testid="contact-card-linkedin"] a[href*="linkedin.com"], a[href*="linkedin.com"]',
        linkedInCopyButton: '[data-testid="contact-card-linkedin"] button, .linkedin-card button',
        linkedInCopiedState: '[data-testid="copy-message-linkedin"], .copied, .copy-success'
    },

    // About App Page Selectors
    aboutApp: {
        // Main Sections
        componentsSection: '[data-testid="about-app-components"], section:has-text("Components")',
        architectureSection: '[data-testid="about-app-architecture"], section:has-text("Architecture")', 
        frontendSection: '[data-testid="about-app-frontend"], section:has-text("Frontend")',
        backendSection: '[data-testid="about-app-backend"], section:has-text("Backend")',
        automationSection: '[data-testid="about-app-automation-framework"], section:has-text("Automation")',
        devToolsSection: '[data-testid="about-app-development-tools"], section:has-text("Tools")',
        
        // External Links
        frontendCodeLink: '[data-testid="github-frontend-link"], a[href*="github"][href*="frontend"]',
        backendCodeLink: '[data-testid="github-backend-link"], a[href*="github"][href*="backend"]',
        automationCodeLink: '[data-testid="about-app-automation-link"], a[href*="github"][href*="automation"]',
        liveTestResultsLink: '[data-testid="live-automation-link"], a[href*="live"], a[href*="automation"]'
    }
};
