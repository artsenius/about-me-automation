# About Me Website - Test Automation Framework

This repository contains the end-to-end test automation framework for the About Me website using Playwright. The framework is designed to run automated tests against both the development and production environments.

## Overview

The framework tests the following components:
- About page functionality
- Contact page functionality
- Live Test Automation features
- Integration with the backend API

## Project Structure

```
├── pages/           # Page Object Models
│   ├── aboutPage.js
│   ├── basePage.js
│   ├── contactPage.js
│   └── selectors.js
├── tests/           # Test Specifications
│   ├── about-page.spec.js
│   └── contact-page.spec.js
├── reporting/       # Test Results Processing
│   ├── create-test-result-json.js
│   └── upload-test-result.js
└── playwright.config.js
```

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Access to the test environments

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
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npx playwright test tests/about-page.spec.js
```

### Run tests in headed mode
```bash
npx playwright test --headed
```

### Run tests against specific configuration
```bash
npx playwright test --config=playwright.config.js
```

## Test Reports

After test execution, reports are available in:
- HTML Report: `playwright-report/index.html`
- Test Results JSON: `test-results/`

The framework automatically uploads test results to the backend API for visualization in the Live Test Automation dashboard.

## Continuous Integration

The tests are configured to run automatically on:
- Pull requests to main branch
- Scheduled daily runs
- Manual triggers through GitHub Actions

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests locally
4. Submit a pull request

## Support

For any questions or issues, please contact the team or create a GitHub issue.
