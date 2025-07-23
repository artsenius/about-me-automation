# About Me Automation - Comprehensive Test Suite

A robust Playwright-based test automation framework for arthursenko.com, featuring accessibility, performance, resilience, and cross-browser testing.

## 🚀 Features

- **Comprehensive Test Coverage**: Smoke tests, functional tests, accessibility tests, performance tests, and resilience tests
- **Cross-Browser Testing**: Chromium (Desktop) and Mobile Safari support
- **Page Object Model**: Clean, maintainable test architecture
- **CI/CD Integration**: GitHub Actions workflow with automated testing
- **Detailed Reporting**: HTML reports, JUnit XML, and JSON output
- **Performance Monitoring**: Load time analysis, resource usage tracking, memory leak detection
- **Accessibility Testing**: WCAG compliance checks, keyboard navigation, screen reader support
- **Resilience Testing**: Error handling, network failures, graceful degradation

## 📋 Test Structure

```
tests/
├── smoke.spec.js           # Fast health checks
├── about-page.spec.js      # About page functionality
├── contact-page.spec.js    # Contact page features
├── header.spec.js          # Navigation testing
├── footer.spec.js          # Footer component tests
├── accessibility.spec.js   # WCAG compliance tests
├── performance.spec.js     # Performance monitoring
├── resilience.spec.js      # Error handling & graceful degradation
└── live-test-automation.spec.js # Live automation features

pages/
├── basePage.js            # Base page object with common methods
├── aboutPage.js           # About page object
├── contactPage.js         # Contact page object
├── selectors.js           # Centralized selectors
└── components/
    ├── header.js          # Header component object
    └── footer.js          # Footer component object
```

## 🛠 Installation

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn

### Setup
```bash
# Clone the repository
git clone [repository-url]
cd about-me-automation

# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Install system dependencies (Linux)
npm run install:deps
```

## 🧪 Running Tests

### Quick Start
```bash
# Run all tests
npm test

# Run smoke tests (fast health checks)
npm run test:smoke

# Run tests with UI mode
npm run test:ui
```

### Specific Test Suites
```bash
# Browser-specific tests
npm run test:chrome        # Chromium tests
npm run test:mobile        # Mobile Safari tests

# Test type-specific
npm run test:accessibility # WCAG compliance tests
npm run test:performance   # Performance monitoring
npm run test:resilience    # Error handling tests

# Development modes
npm run test:headed        # Run with visible browser
npm run test:debug         # Debug mode with step-by-step execution
```

### CI/CD Tests
```bash
# Run all test suites (for CI)
npm run test:all

# Generate CI-friendly reports
npm run test:ci
```

## 📊 Test Reports

After running tests, view reports:
```bash
# Open HTML report
npm run report

# Reports are generated in:
test-results/
├── html-report/          # Interactive HTML report
├── results.json          # JSON test results
├── junit.xml            # JUnit XML for CI integration
└── artifacts/           # Screenshots, videos, traces
```

## 🏗 Test Architecture

### Page Object Model
The framework uses the Page Object Model pattern for maintainable and reusable test code:

- **BasePage**: Common functionality shared across all pages
- **Page Objects**: Specific page implementations (AboutPage, ContactPage, etc.)
- **Component Objects**: Reusable components (Header, Footer)
- **Selectors**: Centralized element selectors using data-testid attributes

### Test Categories

1. **Smoke Tests** (`smoke.spec.js`)
   - Basic functionality verification
   - Quick health checks
   - Critical path validation

2. **Functional Tests** (`*-page.spec.js`)
   - Feature-specific testing
   - User journey validation
   - Cross-page navigation

3. **Accessibility Tests** (`accessibility.spec.js`)
   - WCAG 2.1 compliance
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast verification

4. **Performance Tests** (`performance.spec.js`)
   - Page load times
   - Resource usage monitoring
   - Memory leak detection
   - Mobile performance

5. **Resilience Tests** (`resilience.spec.js`)
   - Error handling
   - Network failure simulation
   - Graceful degradation
   - Browser compatibility

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)
- Timeout settings optimized for stability
- Multiple browser projects
- Screenshot and video on failure
- Trace collection for debugging

### Environment Variables
```bash
# Set base URL (optional)
BASE_URL=https://www.arthursenko.com/

# CI mode
CI=true
```

## 🚀 GitHub Actions CI/CD

The project includes a comprehensive GitHub Actions workflow:

- **Multi-Node Testing**: Tests on Node.js 18 and 20
- **Parallel Execution**: Different test suites run in parallel
- **Artifact Collection**: Test reports and screenshots
- **Security Auditing**: Dependency vulnerability checks
- **Lighthouse Integration**: Performance monitoring
- **Scheduled Testing**: Daily automated runs

## 📝 Writing Tests

### Basic Test Structure
```javascript
const { test, expect } = require('@playwright/test');
const { PageObject } = require('../pages/pageObject');

test.describe('Feature Name', () => {
    let pageObject;

    test.beforeEach(async ({ page }) => {
        pageObject = new PageObject(page);
        await page.goto('');
    });

    test('should verify functionality', async () => {
        // Test implementation
        expect(await pageObject.verifyElement()).toBeTruthy();
    });
});
```

### Best Practices
1. Use Page Object Model for element interactions
2. Implement data-testid attributes for reliable selectors
3. Add appropriate waits for dynamic content
4. Include accessibility checks in functional tests
5. Monitor performance metrics
6. Test error scenarios and edge cases

## 🐛 Debugging

### Debug Mode
```bash
# Run in debug mode
npm run test:debug

# Run specific test with debugging
npx playwright test tests/about-page.spec.js --debug
```

### Trace Viewer
```bash
# View traces for failed tests
npx playwright show-trace test-results/trace.zip
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots at failure point
- Video recordings of the session
- Network activity logs
- Console output

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `feature-name.spec.js`
3. Implement using Page Object Model
4. Add selectors to `selectors.js`
5. Update this README if needed

## 📞 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Check the [Playwright documentation](https://playwright.dev/)
- **Code Review**: All PRs require review and passing tests

## 📈 Test Metrics

The test suite monitors:
- **Test Coverage**: Functional coverage across all pages
- **Performance**: Page load times, resource usage
- **Accessibility**: WCAG compliance scores
- **Reliability**: Test pass rates and flakiness
- **Cross-Browser**: Compatibility across different browsers and devices

## 🔮 Future Enhancements

- [ ] Visual regression testing with Playwright screenshots
- [ ] API testing integration
- [ ] Load testing with multiple concurrent users
- [ ] Integration with monitoring tools
- [ ] Advanced accessibility testing with axe-core
- [ ] Performance budgets and alerts
- [ ] Test data management
- [ ] Parallel test execution optimization

---

**Built with ❤️ using Playwright and modern testing practices**
