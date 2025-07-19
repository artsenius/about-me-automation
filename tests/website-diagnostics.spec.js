const { test, expect } = require('@playwright/test');

test.describe('Website Diagnostics - Playwright MCP Capabilities', () => {
    test('should analyze website structure and accessibility', async ({ page }) => {
        console.log('🔍 Starting website structure analysis...');
        
        // Navigate to the website
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check if page loads successfully
        const title = await page.title();
        console.log(`✅ Page loaded with title: "${title}"`);
        
        // Analyze page structure
        const h1Elements = await page.locator('h1').count();
        const navElements = await page.locator('nav').count();
        const mainElements = await page.locator('main').count();
        const footerElements = await page.locator('footer').count();
        
        console.log(`📊 Page structure analysis:
        - H1 elements: ${h1Elements}
        - Nav elements: ${navElements}
        - Main elements: ${mainElements}
        - Footer elements: ${footerElements}`);
        
        // Check for common navigation patterns
        const navLinks = await page.locator('a[href*="/"]').count();
        const buttonElements = await page.locator('button').count();
        const linkElements = await page.locator('a').count();
        
        console.log(`🔗 Interactive elements:
        - Navigation links: ${navLinks}
        - Buttons: ${buttonElements}
        - Total links: ${linkElements}`);
        
        // Take a screenshot for visual verification
        await page.screenshot({ 
            path: 'test-results/website-structure.png', 
            fullPage: true 
        });
        
        // Verify basic functionality
        expect(h1Elements).toBeGreaterThan(0);
        expect(linkElements).toBeGreaterThan(0);
        
        console.log('✅ Website structure analysis complete');
    });

    test('should test responsive design across viewports', async ({ page }) => {
        console.log('📱 Testing responsive design...');
        
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
            console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
            
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            // Check if content is visible and properly sized
            const contentWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = viewport.width;
            
            console.log(`  Content width: ${contentWidth}px, Viewport width: ${viewportWidth}px`);
            
            // Take screenshot for each viewport
            await page.screenshot({ 
                path: `test-results/responsive-${viewport.name.toLowerCase()}.png`,
                fullPage: true 
            });
            
            // Verify no horizontal scrolling on smaller screens
            if (viewport.width <= 768) {
                expect(contentWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance
            }
        }
        
        console.log('✅ Responsive design testing complete');
    });

    test('should test keyboard navigation and accessibility', async ({ page }) => {
        console.log('⌨️ Testing keyboard navigation...');
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Test keyboard navigation
        let focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
        console.log(`Found ${focusableElements} focusable elements`);
        
        // Test Tab navigation
        await page.keyboard.press('Tab');
        const firstFocused = await page.evaluate(() => document.activeElement.tagName);
        console.log(`First focused element: ${firstFocused}`);
        
        // Test multiple tab presses
        for (let i = 0; i < Math.min(5, focusableElements); i++) {
            await page.keyboard.press('Tab');
            const currentFocused = await page.evaluate(() => ({
                tag: document.activeElement.tagName,
                text: document.activeElement.textContent?.substring(0, 50) || '',
                href: document.activeElement.href || ''
            }));
            console.log(`Tab ${i + 1}: ${currentFocused.tag} - "${currentFocused.text}" ${currentFocused.href}`);
        }
        
        // Verify basic accessibility
        expect(focusableElements).toBeGreaterThan(0);
        
        console.log('✅ Keyboard navigation testing complete');
    });

    test('should analyze performance metrics', async ({ page }) => {
        console.log('⚡ Analyzing performance metrics...');
        
        const startTime = Date.now();
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Analyze Core Web Vitals
        const vitals = await page.evaluate(() => {
            return new Promise((resolve) => {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const vitals = {};
                    
                    entries.forEach((entry) => {
                        if (entry.entryType === 'largest-contentful-paint') {
                            vitals.LCP = entry.startTime;
                        }
                        if (entry.entryType === 'first-input') {
                            vitals.FID = entry.processingStart - entry.startTime;
                        }
                        if (entry.entryType === 'layout-shift') {
                            vitals.CLS = (vitals.CLS || 0) + entry.value;
                        }
                    });
                    
                    resolve(vitals);
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                
                // Fallback timeout
                setTimeout(() => resolve({}), 2000);
            });
        });
        
        console.log('Core Web Vitals:', vitals);
        
        // Check resource loading
        const resourceCounts = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            const counts = {};
            resources.forEach(resource => {
                const type = resource.initiatorType || 'other';
                counts[type] = (counts[type] || 0) + 1;
            });
            return counts;
        });
        
        console.log('Resource counts:', resourceCounts);
        
        // Basic performance assertions
        expect(loadTime).toBeLessThan(10000); // Allow 10 seconds for slow networks
        
        console.log('✅ Performance analysis complete');
    });

    test('should test form interactions and validation', async ({ page }) => {
        console.log('📝 Testing form interactions...');
        
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');
        
        // Look for forms and inputs
        const formCount = await page.locator('form').count();
        const inputCount = await page.locator('input').count();
        const textareaCount = await page.locator('textarea').count();
        
        console.log(`Forms found: ${formCount}`);
        console.log(`Inputs found: ${inputCount}`);
        console.log(`Textareas found: ${textareaCount}`);
        
        // If forms exist, test basic interaction
        if (formCount > 0) {
            // Try to find common form fields
            const emailInputs = await page.locator('input[type="email"], input[name*="email"]').count();
            const nameInputs = await page.locator('input[name*="name"], input[placeholder*="name"]').count();
            
            console.log(`Email inputs: ${emailInputs}`);
            console.log(`Name inputs: ${nameInputs}`);
            
            // Test basic form interaction
            if (emailInputs > 0) {
                await page.locator('input[type="email"], input[name*="email"]').first().fill('test@example.com');
                console.log('✅ Email input test successful');
            }
            
            if (nameInputs > 0) {
                await page.locator('input[name*="name"], input[placeholder*="name"]').first().fill('Test User');
                console.log('✅ Name input test successful');
            }
        }
        
        console.log('✅ Form interaction testing complete');
    });

    test('should demonstrate network monitoring and mocking', async ({ page }) => {
        console.log('🌐 Testing network monitoring and mocking...');
        
        // Set up request/response monitoring
        const requests = [];
        const responses = [];
        
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
        });
        
        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                contentType: response.headers()['content-type']
            });
        });
        
        // Navigate and collect network data
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        console.log(`Network requests captured: ${requests.length}`);
        console.log(`Network responses captured: ${responses.length}`);
        
        // Analyze request types
        const requestTypes = {};
        requests.forEach(req => {
            requestTypes[req.resourceType] = (requestTypes[req.resourceType] || 0) + 1;
        });
        
        console.log('Request types:', requestTypes);
        
        // Check for failed requests
        const failedRequests = responses.filter(res => res.status >= 400);
        console.log(`Failed requests: ${failedRequests.length}`);
        
        if (failedRequests.length > 0) {
            console.log('Failed requests:', failedRequests);
        }
        
        // Test request interception/mocking
        await page.route('**/test-api**', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Mocked response from Playwright MCP' })
            });
        });
        
        console.log('✅ Network monitoring and mocking setup complete');
        
        expect(requests.length).toBeGreaterThan(0);
        expect(responses.length).toBeGreaterThan(0);
    });
});