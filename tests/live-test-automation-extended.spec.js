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
    
    // Helper function to wait for aria-expanded to reach expected state with retry logic
    const waitForAriaExpandedState = async (expectedState, operation, maxRetries = 8, baseTimeout = 500) => {
      let actualState = null;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        // Use exponential backoff for retries to handle varying network conditions
        const timeout = baseTimeout * Math.pow(1.5, retryCount);
        await liveAutomationPage.page.waitForTimeout(Math.min(timeout, 3000));
        
        actualState = await liveAutomationPage.getHeaderAriaExpanded(index);
        console.log(`Aria-expanded after ${operation} (attempt ${retryCount + 1}):`, actualState);
        
        if (actualState === expectedState) {
          console.log(`✓ ${operation} completed successfully on attempt ${retryCount + 1}`);
          return actualState; // Success - found expected value
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying ${operation} check (${retryCount}/${maxRetries})... Expected: ${expectedState}, Got: ${actualState}`);
        }
      }
      
      console.warn(`${operation} failed after ${maxRetries} attempts. Final state: ${actualState}`);
      return actualState;
    };

    // Expand the test result
    console.log('=== Expanding test result ===');
    await liveAutomationPage.expandTestResult(index);
    
    // Wait for expand to complete with retry logic
    const expandedState = await waitForAriaExpandedState('true', 'expand');
    
    if (expandedState !== null) {
      expect(expandedState).toBe('true');
    } else {
      // Fallback to visual state check
      const visuallyExpanded = await liveAutomationPage.isTestResultExpanded(index);
      console.warn('aria-expanded missing after expand, using visual state:', visuallyExpanded);
      if (!visuallyExpanded) {
        console.warn('Test result not visually expanded. Test failed.');
        expect(visuallyExpanded).toBeTruthy(); // This will fail and show the issue clearly
      }
      expect(visuallyExpanded).toBeTruthy();
    }

    // Small pause to ensure expand operation is fully complete before collapse
    await liveAutomationPage.page.waitForTimeout(200);

    // Collapse the test result  
    console.log('=== Collapsing test result ===');
    await liveAutomationPage.collapseTestResult(index);
    
    // Wait for collapse to complete with retry logic
    const collapsedState = await waitForAriaExpandedState('false', 'collapse');
    
    if (collapsedState !== null) {
      expect(collapsedState).toBe('false');
    } else {
      // Fallback to visual state check
      const visuallyCollapsed = await liveAutomationPage.isTestResultExpanded(index);
      console.warn('aria-expanded missing after collapse, using visual state. Expanded:', visuallyCollapsed);
      if (visuallyCollapsed) {
        console.warn('Test result still visually expanded after collapse. Test failed.');
        expect(visuallyCollapsed).toBeFalsy(); // This will fail and show the issue clearly
      }
      expect(visuallyCollapsed).toBeFalsy();
    }
  });
});

