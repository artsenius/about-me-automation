/**
 * CSS Selectors for automated testing
 * Updated to work with actual website structure instead of data-testid attributes
 */
module.exports = {
    // Common/Header Navigation Selectors
    common: {
        navigation: 'nav, header nav, .nav, .navigation',
        navContainer: 'nav, .navbar, .nav-container',
        navList: 'nav ul, .nav-list, .navbar-nav',
        navLinks: 'nav a, .nav-link, .navbar-nav a',
        navLinkAboutMe: 'nav a[href*="about"]:not([href*="app"]), nav button:has-text("About Me"), [data-testid="nav-link-about"]',
        navLinkAboutApp: 'nav a[href*="about"][href*="app"], nav button:has-text("About This App"), [data-testid="nav-link-about-app"]',
        navLinkLiveAutomation: '[data-testid="nav-link-automation"]:not([href]), nav button:has-text("Live"), nav button[data-testid="nav-link-automation"]',
        navLinkContact: 'nav a[href*="contact"], nav button:has-text("Contact"), [data-testid="nav-link-contact"]',
        
        // Mobile Navigation
        hamburgerMenu: '.hamburger, .menu-toggle, button:has-text("Menu"), [aria-label*="menu"]',
        mobileNavList: '.mobile-nav, .nav-mobile, nav.mobile',
        pageTitle: 'h1, .page-title, .main-title'
    },

    // Footer Selectors
    footer: {
        footer: 'footer, .footer, .site-footer',
        copyright: 'footer *:has-text("©"), .copyright, footer *:has-text("rights reserved")'
    },

    // About Page Selectors
    about: {
        profileSection: '.profile, .about-section, .hero-section, section:has(img[alt*="Arthur"])',
        profileImage: 'img[alt*="Arthur"], .profile-image, .headshot, .author-image, img[src*="profile"]',
        profileName: 'h1:has-text("Arthur"), .profile-name, .author-name, h1, h2',
        resumeLink: 'a[href*=".pdf"], a:has-text("Resume"), a:has-text("CV"), a[download]',
        summary: '.summary, .bio, .about-text, .description, p:has-text("QA")',
        
        // Current Role Section
        currentRoleSection: 'section:has-text("Current Role"), .current-role, .role-section',
        currentRoleTitle: 'h2:has-text("Current Role"), h3:has-text("Current Role"), .current-role h2, .current-role h3',
        currentRoleContent: '.current-role p, section:has-text("Current Role") p',
        
        // Company Links Section
        companySection: 'section:has-text("Company"), .company-section, .experience-section',
        companyLinks: 'a[href*="company"], .company-link, a[target="_blank"]:not([href*="linkedin"]):not([href*="github"])',
        
        // Skills Section
        skillsSection: 'section:has-text("Skills"), .skills-section, .technical-skills',
        skillsTitle: 'h2:has-text("Skills"), h3:has-text("Skills"), .skills-title',
        skillsList: '.skills-list, .skills ul, .skill-items',
        skillItems: '.skill, .skills li, .skill-item, .technology',
        
        // Achievements Section
        achievementsSection: 'section:has-text("Achievement"), .achievements, .accomplishments',
        achievementsTitle: 'h2:has-text("Achievement"), h3:has-text("Achievement"), .achievements-title',
        achievementsList: '.achievements ul, .accomplishments ul, .achievement-list',
        achievementItems: '.achievements li, .accomplishments li, .achievement-item'
    },

    // Live Automation Page Selectors
    liveAutomation: {
        section: '.automation-section, .test-results, .live-automation',
        pageContent: '.automation-content, .test-automation, main',
        testRunList: '.test-runs, .test-results-list, .automation-results',
        
        // Test Run Cards
        testRunCard: '.test-run, .test-result-card, .automation-card',
        testRunHeader: '.test-run-header, .test-result-header, .card-header',
        testRunContent: '.test-run-content, .test-result-content, .card-body',
        
        // Test Run Details
        testRunDuration: '.duration, .test-duration, .run-time',
        testRunSuccessRate: '.success-rate, .pass-rate, .percentage',
        testRunPassedTests: '.passed, .success, .passed-tests',
        testRunFailedTests: '.failed, .error, .failed-tests',
        testRunSkippedTests: '.skipped, .pending, .skipped-tests',
        testRunBlockedTests: '.blocked, .disabled, .blocked-tests',
        testDetails: '.test-details, .test-info, .result-details',
        
        // Loading States
        loadingPlaceholder: '.loading, .spinner, .placeholder'
    },

    // Contact Page Selectors
    contact: {
        emailCard: '.contact-email, .email-contact, section:has-text("Email"), .contact-item:has(a[href^="mailto:"])',
        phoneCard: '.contact-phone, .phone-contact, section:has-text("Phone"), .contact-item:has(a[href^="tel:"])',
        linkedInCard: '.contact-linkedin, .linkedin-contact, section:has-text("LinkedIn"), .contact-item:has(a[href*="linkedin"])',
        
        // Email Elements
        emailHeading: 'h3:has-text("Email"), h2:has-text("Email"), .email-heading',
        emailLink: 'a[href^="mailto:"]',
        emailCopyButton: '.email-card button, .contact-email button, button:near(a[href^="mailto:"])',
        emailCopiedState: '.copied, .copy-success, .copy-confirmation',
        
        // Phone Elements
        phoneHeading: 'h3:has-text("Phone"), h2:has-text("Phone"), .phone-heading',
        phoneLink: 'a[href^="tel:"]',
        phoneCopyButton: '.phone-card button, .contact-phone button, button:near(a[href^="tel:"])',
        phoneCopiedState: '.copied, .copy-success, .copy-confirmation',
        
        // LinkedIn Elements
        linkedInHeading: 'h3:has-text("LinkedIn"), h2:has-text("LinkedIn"), .linkedin-heading',
        linkedInLink: 'a[href*="linkedin.com"]',
        linkedInCopyButton: '.linkedin-card button, .contact-linkedin button, button:near(a[href*="linkedin"])',
        linkedInCopiedState: '.copied, .copy-success, .copy-confirmation'
    },

    // About App Page Selectors
    aboutApp: {
        // Main Sections
        componentsSection: 'section:has-text("Components"), .components-section',
        architectureSection: 'section:has-text("Architecture"), .architecture-section', 
        frontendSection: 'section:has-text("Frontend"), .frontend-section',
        backendSection: 'section:has-text("Backend"), .backend-section',
        automationSection: 'section:has-text("Automation"), .automation-section, section:has-text("Framework")',
        devToolsSection: 'section:has-text("Tools"), .tools-section, section:has-text("Development")',
        
        // External Links
        frontendCodeLink: 'a[href*="github"][href*="frontend"], a:has-text("Frontend Code")',
        backendCodeLink: 'a[href*="github"][href*="backend"], a:has-text("Backend Code")',
        automationCodeLink: 'a[href*="github"][href*="automation"], a:has-text("Automation")',
        liveTestResultsLink: 'a[href*="live"], a[href*="automation"], a:has-text("Live Results")'
    }
};
