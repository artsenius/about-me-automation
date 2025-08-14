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
        copyright: '[data-testid="footer-copyright"]',

        // Common interactive elements
        buttons: '[data-testid^="button-"]',
        links: '[data-testid^="link-"]',
        listItems: '[data-testid^="list-item-"]',
        cards: '[data-testid^="card-"]'
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
        skillItemsGeneric: '[data-testid="skills-list"] li',

        // Achievements Section
        achievementsSection: '[data-testid="achievements-section"]',
        achievementsTitle: '[data-testid="achievements-title"]',
        achievementsList: '[data-testid="achievements-list"]',
        achievementItems: '[data-testid="achievements-list"] > li',
        achievementItemsGeneric: '[data-testid^="achievement-item-"]',
        
        // Additional elements
        appInfoBox: '[data-testid="app-info-box"]',
        backToTopButton: '[aria-label="Back to top"]',

        // Suggested new selectors for missing elements
        externalLinks: '[data-testid^="external-link-"]',
        internalLinks: '[data-testid^="internal-link-"]',
        paragraphs: '[data-testid^="paragraph-"]',
        spans: '[data-testid^="span-"]'
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

        // Test Run Stats - Updated with more specific selectors
        testRunDuration: '[data-testid="test-run-duration"]',
        testRunSuccessRate: '[data-testid="test-run-success-rate"]',
        testRunPassedTests: '[data-testid="test-run-passed-tests"]',
        testRunFailedTests: '[data-testid="test-run-failed-tests"]',
        testRunSkippedTests: '[data-testid="test-run-skipped-tests"]',
        testRunBlockedTests: '[data-testid="test-run-blocked-tests"]',
        testDetails: '[data-testid^="test-details-"]',

        // Additional Test Run Stats (currently missing from page)
        testRunTotalTests: '[data-testid="test-run-total-tests"]',
        testRunStartTime: '[data-testid="test-run-start-time"]',
        testRunEndTime: '[data-testid="test-run-end-time"]',
        testRunEnvironment: '[data-testid="test-run-environment"]',
        testRunBrowser: '[data-testid="test-run-browser"]',
        testRunStatus: '[data-testid="test-run-status"]',

        // Test Case Details
        testCaseName: '[data-testid^="test-case-name-"]',
        testCaseStatus: '[data-testid^="test-case-status-"]',
        testCaseDuration: '[data-testid^="test-case-duration-"]',
        testCaseError: '[data-testid^="test-case-error-"]',

        // Loading state
        loadingPlaceholder: '[data-testid="loading-placeholder"]',
        loadingSpinner: '[data-testid="loading-spinner"]',
        
        // Error states
        errorMessage: '[data-testid="error-message"]',
        retryButton: '[data-testid="retry-button"]',

        // Filters and controls
        filterDropdown: '[data-testid="filter-dropdown"]',
        sortDropdown: '[data-testid="sort-dropdown"]',
        refreshButton: '[data-testid="refresh-button"]',
        expandAllButton: '[data-testid="expand-all-button"]',
        collapseAllButton: '[data-testid="collapse-all-button"]'
    }, 

    contact: {
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

        // Additional Contact Elements (suggested)
        contactForm: '[data-testid="contact-form"]',
        contactFormName: '[data-testid="contact-form-name"]',
        contactFormEmail: '[data-testid="contact-form-email"]',
        contactFormMessage: '[data-testid="contact-form-message"]',
        contactFormSubmit: '[data-testid="contact-form-submit"]',
        contactFormSuccess: '[data-testid="contact-form-success"]',
        contactFormError: '[data-testid="contact-form-error"]'
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

        // Technology Lists (suggested)
        frontendTechList: '[data-testid="frontend-tech-list"]',
        backendTechList: '[data-testid="backend-tech-list"]',
        automationTechList: '[data-testid="automation-tech-list"]',
        devToolsList: '[data-testid="dev-tools-list"]',
        
        // Technology Items
        techItems: '[data-testid^="tech-item-"]',
        
        // Code snippets or examples
        codeExamples: '[data-testid^="code-example-"]',
        
        // Expandable sections
        expandableSection: '[data-testid^="expandable-section-"]',
        expandButton: '[data-testid^="expand-button-"]',
        collapseButton: '[data-testid^="collapse-button-"]'
    },

    // New accessibility selectors
    accessibility: {
        focusableElements: '[data-testid^="focusable-"]',
        skipLinks: '[data-testid^="skip-link-"]',
        landmarks: '[data-testid^="landmark-"]',
        headings: '[data-testid^="heading-"]',
        ariaLabels: '[data-testid^="aria-"]',
        ariaDescribedBy: '[data-testid^="described-by-"]'
    },

    // Performance and loading selectors
    performance: {
        loadingIndicators: '[data-testid^="loading-"]',
        progressBars: '[data-testid^="progress-"]',
        lazyLoadedImages: '[data-testid^="lazy-image-"]',
        lazyLoadedSections: '[data-testid^="lazy-section-"]'
    },

    // Form elements (if any forms are added)
    forms: {
        form: '[data-testid^="form-"]',
        input: '[data-testid^="input-"]',
        textarea: '[data-testid^="textarea-"]',
        select: '[data-testid^="select-"]',
        checkbox: '[data-testid^="checkbox-"]',
        radio: '[data-testid^="radio-"]',
        submitButton: '[data-testid^="submit-"]',
        resetButton: '[data-testid^="reset-"]',
        validationError: '[data-testid^="error-"]',
        validationSuccess: '[data-testid^="success-"]'
    },

    // Modal and overlay selectors
    modals: {
        modal: '[data-testid^="modal-"]',
        modalOverlay: '[data-testid^="modal-overlay-"]',
        modalHeader: '[data-testid^="modal-header-"]',
        modalBody: '[data-testid^="modal-body-"]',
        modalFooter: '[data-testid^="modal-footer-"]',
        modalCloseButton: '[data-testid^="modal-close-"]',
        tooltip: '[data-testid^="tooltip-"]',
        dropdown: '[data-testid^="dropdown-"]',
        popup: '[data-testid^="popup-"]'
    }
};
