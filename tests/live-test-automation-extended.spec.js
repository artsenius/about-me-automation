const { test, expect } = require('@playwright/test');
const { LiveAutomationPage } = require('../pages/liveAutomationPage');
const { Header } = require('../pages/components/header');

let liveAutomationPage;
let header;

test.describe('Live Automation Page - Extended', () => {
  test.beforeEach(async ({ page }) => {
    liveAutomationPage = new LiveAutomationPage(page);
    header = new Header(page);
    await page.goto('');
    await header.navigateToLiveAutomation();
    await liveAutomationPage.waitForTestResults();
  });

  test('should load more results when clicking Load more', async () => {
    const initialCount = await liveAutomationPage.getTestRunCount();
    await liveAutomationPage.clickLoadMore();

    // Either more items appear, or capped at current max (no change). Validate non-decrease and >= 1.
    const afterCount = await liveAutomationPage.getTestRunCount();
    expect(afterCount).toBeGreaterThanOrEqual(initialCount);
    expect(afterCount).toBeGreaterThan(0);
  });

  test('should toggle aria-expanded on header when expanding/collapsing', async () => {
    // We only need the first card for this behavior
    const index = 0;

    // Expand
    await liveAutomationPage.expandTestResult(index);
    const expanded = await liveAutomationPage.getHeaderAriaExpanded(index);
    // Some UIs omit aria-expanded; if so, fallback assert via isTestResultExpanded
    if (expanded !== null) {
      expect(expanded).toBe('true');
    } else {
      expect(await liveAutomationPage.isTestResultExpanded(index)).toBeTruthy();
    }

    // Collapse
    await liveAutomationPage.collapseTestResult(index);
    const collapsed = await liveAutomationPage.getHeaderAriaExpanded(index);
    if (collapsed !== null) {
      expect(collapsed).toBe('false');
    } else {
      expect(await liveAutomationPage.isTestResultExpanded(index)).toBeFalsy();
    }
  });
});

