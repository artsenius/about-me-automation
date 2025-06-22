# About Me Website - Test Automation Framework

This repository contains the end-to-end test automation framework for the About Me website using Playwright. The framework is designed to run automated tests across multiple browsers and device configurations.

## Overview

The framework provides comprehensive testing for:
- About Me page functionality
- About This App page features
- Live Test Automation dashboard
- Contact page functionality
- Header navigation
- Footer consistency
- Mobile responsiveness
- Cross-browser compatibility

## Project Structure

```
├── pages/              # Page Object Models
│   ├── components/     # Shared Components
│   │   ├── header.js
│   │   └── footer.js
│   ├── aboutPage.js
│   ├── aboutAppPage.js
│   ├── basePage.js
│   ├── contactPage.js
│   ├── liveAutomationPage.js
│   └── selectors.js
├── tests/             # Test Specifications
│   ├── about-page.spec.js
│   ├── about-app-page.spec.js
│   ├── contact-page.spec.js
│   ├── live-test-automation.spec.js
│   ├── header.spec.js
│   └── footer.spec.js
├── reporting/         # Test Results Processing
│   ├── create-test-result-json.js
│   ├── upload-test-result.js
│   └── README.md
├── test-results/     # Test Artifacts
│   ├── results.json
│   └── playwright-report.json
└── playwright.config.js
```

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Access to test environments

## Setup

1. Clone the repository:
```bash
git clone git@github.com:artsenius/about-me-automation.git
cd about-me-automation
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install --with-deps
```

## Running Tests

### Run all tests
```bash
# Run tests with both JSON and HTML reporters
npx playwright test
```

### Run specific test file
```bash
npx playwright test tests/about-page.spec.js
```

### Run tests for specific browser/device
```bash
# Desktop Chrome
npx playwright test --project=chromium

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### Debug mode
```bash
# Run in headed mode
npx playwright test --headed

# Run with debug inspector
npx playwright test --debug
```

## Test Reporting

The framework includes a comprehensive reporting system:

1. Test Execution Reports
   - HTML Report: `test-results/html-report/index.html`
   - JSON Results: `test-results/results.json`
   - Formatted Report: `test-results/playwright-report.json`

2. Test Artifacts
   - Screenshots (on failure)
   - Videos (on failure)
   - Trace files
   - Error logs

3. Live Results Dashboard
   - All test results are automatically uploaded to the backend API
   - Results are visible in real-time on the Live Test Automation page
   - Historical test runs are preserved for trend analysis

## Continuous Integration

Tests are automated through GitHub Actions:

1. Scheduled Runs
   - Nightly tests at 00:00 UTC
   - Full suite across all browsers/devices
   - Results automatically uploaded to dashboard

2. Manual Triggers
   - Can be initiated from GitHub Actions UI
   - Useful for on-demand validation

3. Workflow Features
   - Parallel test execution
   - Comprehensive error reporting
   - Artifact preservation
   - Automatic result processing
   - Failure notifications

## Best Practices

1. Page Objects
   - Use base page methods
   - Prefer data-testid selectors
   - Implement robust waiting strategies

2. Test Design
   - Independent test cases
   - Clear test descriptions
   - Proper setup/teardown

3. Mobile Testing
   - Test responsive behavior
   - Verify mobile navigation
   - Check touch interactions

## Contributing

1. Create a feature branch
2. Make your changes
3. Run all tests locally
4. Submit a pull request

## Debugging

For failed tests in CI:
1. Check the HTML report in artifacts
2. Review error screenshots and videos
3. Analyze trace files if needed
4. Check the Live Test Automation dashboard

## Support

For questions or issues:
1. Review existing GitHub issues
2. Check the documentation
3. Contact the team
