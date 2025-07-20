const { test, expect } = require('@playwright/test');

test.describe('API Tests', () => {
    const API_BASE_URL = 'https://about-me-automation-backend.azurewebsites.net/api';

    test('Test runs API should be accessible', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/test-runs`);
        
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
        
        console.log(`API returned ${data.length} test runs`);
    });

    test('Test runs API should return valid data structure', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/test-runs`);
        const data = await response.json();
        
        if (data.length > 0) {
            const testRun = data[0];
            
            // Validate required fields
            expect(testRun).toHaveProperty('id');
            expect(testRun).toHaveProperty('timestamp');
            expect(testRun).toHaveProperty('status');
            expect(testRun).toHaveProperty('stats');
            
            // Validate stats structure
            if (testRun.stats) {
                expect(testRun.stats).toHaveProperty('passed');
                expect(testRun.stats).toHaveProperty('failed');
                expect(testRun.stats).toHaveProperty('total');
                expect(typeof testRun.stats.passed).toBe('number');
                expect(typeof testRun.stats.failed).toBe('number');
                expect(typeof testRun.stats.total).toBe('number');
            }
        }
    });

    test('Test runs API should handle pagination', async ({ request }) => {
        // Test with limit parameter
        const response = await request.get(`${API_BASE_URL}/test-runs?limit=5`);
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        expect(data.length).toBeLessThanOrEqual(5);
    });

    test('Individual test run API should work', async ({ request }) => {
        // First get list of test runs
        const listResponse = await request.get(`${API_BASE_URL}/test-runs`);
        const testRuns = await listResponse.json();
        
        if (testRuns.length > 0) {
            const testRunId = testRuns[0].id;
            
            // Get individual test run
            const detailResponse = await request.get(`${API_BASE_URL}/test-runs/${testRunId}`);
            expect(detailResponse.status()).toBe(200);
            
            const testRun = await detailResponse.json();
            expect(testRun.id).toBe(testRunId);
        }
    });

    test('API should handle CORS properly', async ({ request }) => {
        const response = await request.options(`${API_BASE_URL}/test-runs`);
        
        // CORS preflight should be handled
        expect([200, 204]).toContain(response.status());
    });

    test('API should validate input on POST requests', async ({ request }) => {
        // Test posting invalid data
        const response = await request.post(`${API_BASE_URL}/test-runs`, {
            data: {
                invalid: 'data'
            }
        });
        
        // Should return error for invalid data
        expect([400, 422]).toContain(response.status());
    });

    test('API should have proper error handling', async ({ request }) => {
        // Test non-existent endpoint
        const response = await request.get(`${API_BASE_URL}/non-existent-endpoint`);
        expect(response.status()).toBe(404);
        
        // Test invalid test run ID
        const invalidIdResponse = await request.get(`${API_BASE_URL}/test-runs/invalid-id`);
        expect([404, 400]).toContain(invalidIdResponse.status());
    });

    test('API should return consistent response times', async ({ request }) => {
        const startTime = Date.now();
        const response = await request.get(`${API_BASE_URL}/test-runs`);
        const responseTime = Date.now() - startTime;
        
        expect(response.status()).toBe(200);
        // API should respond within 5 seconds
        expect(responseTime).toBeLessThan(5000);
        
        console.log(`API response time: ${responseTime}ms`);
    });

    test('API data should be consistent with UI display', async ({ page, request }) => {
        // Get API data
        const apiResponse = await request.get(`${API_BASE_URL}/test-runs`);
        const apiData = await apiResponse.json();
        
        // Navigate to live automation page
        await page.goto('/live-test-automation');
        await page.waitForSelector('[data-testid="test-run-list"]');
        
        // Get UI data
        const uiTestRuns = await page.evaluate(() => {
            const testRunCards = document.querySelectorAll('[data-testid^="test-run-card-"]');
            return Array.from(testRunCards).map(card => {
                const passedElement = card.querySelector('[data-testid="test-run-passed-tests"]');
                const failedElement = card.querySelector('[data-testid="test-run-failed-tests"]');
                
                return {
                    passed: passedElement ? parseInt(passedElement.textContent) : 0,
                    failed: failedElement ? parseInt(failedElement.textContent) : 0
                };
            });
        });
        
        // Compare API and UI data counts
        if (apiData.length > 0 && uiTestRuns.length > 0) {
            expect(uiTestRuns.length).toBeLessThanOrEqual(apiData.length);
        }
    });

    test('API should handle rate limiting gracefully', async ({ request }) => {
        const requests = [];
        
        // Make multiple rapid requests
        for (let i = 0; i < 10; i++) {
            requests.push(request.get(`${API_BASE_URL}/test-runs`));
        }
        
        const responses = await Promise.all(requests);
        
        // All requests should either succeed or return proper rate limit response
        responses.forEach(response => {
            expect([200, 429]).toContain(response.status());
        });
        
        const successfulRequests = responses.filter(r => r.status() === 200);
        expect(successfulRequests.length).toBeGreaterThan(0);
    });

    test('API should return proper content types', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/test-runs`);
        const contentType = response.headers()['content-type'];
        
        expect(contentType).toContain('application/json');
    });
});