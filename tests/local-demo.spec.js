const { test, expect } = require('@playwright/test');

test.describe('Local Demo Tests - Playwright MCP Capabilities', () => {
    test('should demonstrate basic browser automation capabilities', async ({ page }) => {
        // Create a simple HTML page for testing
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Playwright MCP Demo</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
                    .hidden { display: none; }
                    .result { margin: 10px; padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Playwright MCP Demo Page</h1>
                    <p>This page demonstrates various browser automation capabilities.</p>
                    
                    <section id="interaction-demo">
                        <h2>User Interaction Demo</h2>
                        <button id="click-button" class="button">Click Me</button>
                        <div id="click-result" class="result hidden">Button was clicked!</div>
                        
                        <input type="text" id="text-input" placeholder="Type something here...">
                        <div id="input-result" class="result hidden"></div>
                    </section>
                    
                    <section id="navigation-demo">
                        <h2>Navigation Demo</h2>
                        <a href="#section1" id="nav-link">Navigate to Section 1</a>
                        <div id="section1" style="margin-top: 100px;">
                            <h3>Section 1</h3>
                            <p>You navigated here successfully!</p>
                        </div>
                    </section>
                    
                    <section id="form-demo">
                        <h2>Form Demo</h2>
                        <form id="demo-form">
                            <input type="email" id="email" placeholder="Enter email" required>
                            <select id="dropdown">
                                <option value="">Select an option</option>
                                <option value="option1">Option 1</option>
                                <option value="option2">Option 2</option>
                            </select>
                            <button type="submit" class="button">Submit</button>
                        </form>
                        <div id="form-result" class="result hidden"></div>
                    </section>
                </div>
                
                <script>
                    // Add interactivity
                    document.getElementById('click-button').addEventListener('click', function() {
                        document.getElementById('click-result').classList.remove('hidden');
                    });
                    
                    document.getElementById('text-input').addEventListener('input', function(e) {
                        const result = document.getElementById('input-result');
                        result.textContent = 'You typed: ' + e.target.value;
                        result.classList.remove('hidden');
                    });
                    
                    document.getElementById('demo-form').addEventListener('submit', function(e) {
                        e.preventDefault();
                        const email = document.getElementById('email').value;
                        const dropdown = document.getElementById('dropdown').value;
                        const result = document.getElementById('form-result');
                        result.textContent = 'Form submitted! Email: ' + email + ', Selection: ' + dropdown;
                        result.classList.remove('hidden');
                    });
                </script>
            </body>
            </html>
        `;
        
        // Load the HTML content
        await page.setContent(htmlContent);
        
        // Test page title
        await expect(page).toHaveTitle('Playwright MCP Demo');
        
        // Test element visibility
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toHaveText('Playwright MCP Demo Page');
        
        console.log('✓ Basic page loading and element detection working');
    });

    test('should demonstrate click interactions and state changes', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Click Demo</title></head>
            <body>
                <button id="toggle-button">Toggle Content</button>
                <div id="toggle-content" style="display: none;">Hidden content is now visible!</div>
                <script>
                    document.getElementById('toggle-button').addEventListener('click', function() {
                        const content = document.getElementById('toggle-content');
                        content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Initially hidden
        await expect(page.locator('#toggle-content')).toBeHidden();
        
        // Click to show
        await page.click('#toggle-button');
        await expect(page.locator('#toggle-content')).toBeVisible();
        
        // Click to hide again
        await page.click('#toggle-button');
        await expect(page.locator('#toggle-content')).toBeHidden();
        
        console.log('✓ Click interactions and state changes working');
    });

    test('should demonstrate form filling and validation', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Form Demo</title></head>
            <body>
                <form id="test-form">
                    <input type="text" id="name" placeholder="Name" required>
                    <input type="email" id="email" placeholder="Email" required>
                    <select id="country">
                        <option value="">Select Country</option>
                        <option value="us">United States</option>
                        <option value="ca">Canada</option>
                        <option value="uk">United Kingdom</option>
                    </select>
                    <textarea id="message" placeholder="Message"></textarea>
                    <button type="submit">Submit</button>
                </form>
                <div id="result" style="display: none;"></div>
                <script>
                    document.getElementById('test-form').addEventListener('submit', function(e) {
                        e.preventDefault();
                        document.getElementById('result').textContent = 'Form submitted successfully!';
                        document.getElementById('result').style.display = 'block';
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Fill form fields
        await page.fill('#name', 'John Doe');
        await page.fill('#email', 'john@example.com');
        await page.selectOption('#country', 'us');
        await page.fill('#message', 'This is a test message');
        
        // Verify filled values
        await expect(page.locator('#name')).toHaveValue('John Doe');
        await expect(page.locator('#email')).toHaveValue('john@example.com');
        await expect(page.locator('#country')).toHaveValue('us');
        
        // Submit form
        await page.click('button[type="submit"]');
        await expect(page.locator('#result')).toBeVisible();
        await expect(page.locator('#result')).toHaveText('Form submitted successfully!');
        
        console.log('✓ Form filling and validation working');
    });

    test('should demonstrate keyboard navigation', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Keyboard Demo</title></head>
            <body>
                <input type="text" id="input1" placeholder="First input">
                <input type="text" id="input2" placeholder="Second input">
                <button id="button1">Button 1</button>
                <button id="button2">Button 2</button>
                <div id="focus-indicator"></div>
                <script>
                    document.addEventListener('focusin', function(e) {
                        document.getElementById('focus-indicator').textContent = 'Focused: ' + (e.target.id || e.target.tagName);
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Navigate using Tab key
        await page.keyboard.press('Tab');
        await expect(page.locator('#input1')).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('#input2')).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('#button1')).toBeFocused();
        
        // Type in focused input
        await page.focus('#input1');
        await page.keyboard.type('Keyboard input test');
        await expect(page.locator('#input1')).toHaveValue('Keyboard input test');
        
        console.log('✓ Keyboard navigation working');
    });

    test('should demonstrate screenshot and visual testing capabilities', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Visual Demo</title>
                <style>
                    body { margin: 0; font-family: Arial, sans-serif; }
                    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; max-width: 600px; margin: 0 auto; }
                    .box { width: 100px; height: 100px; background: #28a745; margin: 10px; display: inline-block; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Visual Testing Demo</h1>
                </div>
                <div class="content">
                    <p>This demonstrates visual regression testing capabilities.</p>
                    <div class="box"></div>
                    <div class="box"></div>
                    <div class="box"></div>
                </div>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Take screenshots
        await expect(page).toHaveScreenshot('demo-full-page.png', { fullPage: true });
        await expect(page.locator('.header')).toHaveScreenshot('demo-header.png');
        
        console.log('✓ Screenshot capabilities working');
    });

    test('should demonstrate network interception and mocking', async ({ page }) => {
        // Mock API responses
        await page.route('**/api/data', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Mocked API response', timestamp: Date.now() })
            });
        });
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>API Demo</title></head>
            <body>
                <button id="fetch-data">Fetch Data</button>
                <div id="api-result"></div>
                <script>
                    document.getElementById('fetch-data').addEventListener('click', async function() {
                        try {
                            const response = await fetch('/api/data');
                            const data = await response.json();
                            document.getElementById('api-result').textContent = 'API Response: ' + data.message;
                        } catch (error) {
                            document.getElementById('api-result').textContent = 'Error: ' + error.message;
                        }
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Click to trigger mocked API call
        await page.click('#fetch-data');
        await expect(page.locator('#api-result')).toHaveText('API Response: Mocked API response');
        
        console.log('✓ Network interception and mocking working');
    });

    test('should demonstrate mobile viewport testing', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mobile Demo</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { margin: 0; font-family: Arial, sans-serif; }
                    .container { padding: 10px; }
                    .responsive-text { font-size: 16px; }
                    @media (max-width: 480px) {
                        .responsive-text { font-size: 14px; color: blue; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Mobile Responsive Test</h1>
                    <p class="responsive-text">This text changes on mobile</p>
                    <div id="viewport-info"></div>
                </div>
                <script>
                    document.getElementById('viewport-info').textContent = 
                        'Viewport: ' + window.innerWidth + 'x' + window.innerHeight;
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Verify mobile-specific styles
        const textColor = await page.locator('.responsive-text').evaluate(el => 
            window.getComputedStyle(el).color
        );
        
        // Should be blue on mobile
        expect(textColor).toBe('rgb(0, 0, 255)');
        
        // Verify viewport info
        await expect(page.locator('#viewport-info')).toHaveText('Viewport: 375x667');
        
        console.log('✓ Mobile viewport testing working');
    });

    test('should demonstrate performance monitoring', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Performance Demo</title></head>
            <body>
                <h1>Performance Testing</h1>
                <button id="heavy-task">Start Heavy Task</button>
                <div id="status">Ready</div>
                <script>
                    document.getElementById('heavy-task').addEventListener('click', function() {
                        const start = performance.now();
                        document.getElementById('status').textContent = 'Processing...';
                        
                        // Simulate heavy task
                        setTimeout(() => {
                            const end = performance.now();
                            document.getElementById('status').textContent = 
                                'Completed in ' + Math.round(end - start) + 'ms';
                        }, 100);
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Monitor performance
        const startTime = Date.now();
        await page.click('#heavy-task');
        await expect(page.locator('#status')).toHaveText(/Completed in \d+ms/);
        const endTime = Date.now();
        
        const totalTime = endTime - startTime;
        expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
        
        console.log(`✓ Performance monitoring working (${totalTime}ms total)`);
    });
});