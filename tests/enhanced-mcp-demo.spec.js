const { test, expect } = require('@playwright/test');

test.describe('Enhanced Playwright MCP Capabilities Demo', () => {
    test('should demonstrate advanced browser automation features', async ({ page, context }) => {
        // Create a comprehensive demo page with advanced features
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Advanced Playwright MCP Demo</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                    .container { max-width: 1200px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                    .demo-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; }
                    .button { padding: 12px 24px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 5px; transition: all 0.3s; }
                    .button:hover { background: #0056b3; transform: translateY(-2px); }
                    .success { background: #28a745; }
                    .warning { background: #ffc107; color: #000; }
                    .danger { background: #dc3545; }
                    .result { margin: 10px; padding: 15px; background: #e9ecef; border-left: 4px solid #007bff; border-radius: 4px; }
                    .hidden { display: none; }
                    .fade-in { animation: fadeIn 0.5s ease-in; }
                    .slide-down { animation: slideDown 0.3s ease-out; }
                    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; }
                    .modal-content { background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; }
                    .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
                    .progress-fill { height: 100%; background: #007bff; width: 0%; transition: width 0.3s ease; }
                    .tooltip { position: relative; display: inline-block; }
                    .tooltip .tooltiptext { visibility: hidden; width: 200px; background-color: #333; color: #fff; text-align: center; border-radius: 5px; padding: 5px; position: absolute; z-index: 1; bottom: 125%; left: 50%; margin-left: -100px; opacity: 0; transition: opacity 0.3s; }
                    .tooltip:hover .tooltiptext { visibility: visible; opacity: 1; }
                    .drag-drop { width: 200px; height: 100px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; margin: 10px; cursor: move; }
                    .drag-drop.drag-over { border-color: #007bff; background: #e3f2fd; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Advanced Playwright MCP Demo</h1>
                    <p>This demonstration showcases advanced browser automation capabilities with Playwright MCP.</p>
                    
                    <div class="demo-section">
                        <h2>🎯 Interactive Elements & State Management</h2>
                        <button id="multi-state-btn" class="button">Click to Cycle States</button>
                        <div id="state-display" class="result">Current State: Initial</div>
                        <div class="tooltip">
                            Hover for tooltip
                            <span class="tooltiptext">This is a tooltip demonstrating hover interactions!</span>
                        </div>
                    </div>
                    
                    <div class="demo-section">
                        <h2>📊 Dynamic Content & Animations</h2>
                        <button id="animate-btn" class="button">Trigger Animation</button>
                        <div id="animated-content" class="result hidden">
                            <h3>Animated Content!</h3>
                            <p>This content appears with smooth animations.</p>
                        </div>
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    
                    <div class="demo-section">
                        <h2>📝 Advanced Form Interactions</h2>
                        <form id="advanced-form">
                            <input type="text" id="username" placeholder="Username" required>
                            <input type="email" id="email" placeholder="Email" required>
                            <select id="country">
                                <option value="">Select Country</option>
                                <option value="us">United States</option>
                                <option value="ca">Canada</option>
                                <option value="uk">United Kingdom</option>
                                <option value="de">Germany</option>
                                <option value="fr">France</option>
                            </select>
                            <input type="range" id="rating" min="1" max="10" value="5">
                            <span id="rating-display">Rating: 5</span>
                            <textarea id="comments" placeholder="Additional comments..." rows="3"></textarea>
                            <div>
                                <input type="checkbox" id="newsletter" name="newsletter">
                                <label for="newsletter">Subscribe to newsletter</label>
                            </div>
                            <div>
                                <input type="radio" id="plan-basic" name="plan" value="basic">
                                <label for="plan-basic">Basic Plan</label>
                                <input type="radio" id="plan-premium" name="plan" value="premium">
                                <label for="plan-premium">Premium Plan</label>
                            </div>
                            <button type="submit" class="button success">Submit Form</button>
                        </form>
                        <div id="form-result" class="result hidden"></div>
                    </div>
                    
                    <div class="demo-section">
                        <h2>🌐 Network Interactions & API Testing</h2>
                        <button id="fetch-data" class="button">Fetch API Data</button>
                        <button id="post-data" class="button warning">Post Data</button>
                        <button id="simulate-error" class="button danger">Simulate Error</button>
                        <div id="api-results" class="result hidden"></div>
                    </div>
                    
                    <div class="demo-section">
                        <h2>🖱️ Drag & Drop Interface</h2>
                        <div id="drag-source" class="drag-drop">Drag me!</div>
                        <div id="drop-target" class="drag-drop">Drop here!</div>
                        <div id="drag-result" class="result hidden"></div>
                    </div>
                    
                    <div class="demo-section">
                        <h2>🎭 Modal & Overlay Testing</h2>
                        <button id="open-modal" class="button">Open Modal</button>
                        <button id="show-alert" class="button warning">Show Alert</button>
                        <button id="show-confirm" class="button">Show Confirm</button>
                    </div>
                    
                    <div class="demo-section">
                        <h2>📱 Responsive & Mobile Features</h2>
                        <button id="test-responsive" class="button">Test Responsive Layout</button>
                        <div id="responsive-info" class="result hidden"></div>
                    </div>
                </div>
                
                <!-- Modal -->
                <div id="demo-modal" class="modal">
                    <div class="modal-content">
                        <h3>Demo Modal</h3>
                        <p>This is a modal dialog for testing overlay interactions.</p>
                        <button id="close-modal" class="button">Close Modal</button>
                    </div>
                </div>
                
                <script>
                    let currentState = 0;
                    const states = ['Initial', 'Loading', 'Success', 'Error', 'Complete'];
                    
                    // Multi-state button
                    document.getElementById('multi-state-btn').addEventListener('click', function() {
                        currentState = (currentState + 1) % states.length;
                        const btn = this;
                        const display = document.getElementById('state-display');
                        
                        btn.textContent = 'State: ' + states[currentState];
                        display.textContent = 'Current State: ' + states[currentState];
                        
                        // Change button color based on state
                        btn.className = 'button';
                        if (states[currentState] === 'Success') btn.classList.add('success');
                        if (states[currentState] === 'Error') btn.classList.add('danger');
                        if (states[currentState] === 'Loading') btn.classList.add('warning');
                    });
                    
                    // Animation trigger
                    document.getElementById('animate-btn').addEventListener('click', function() {
                        const content = document.getElementById('animated-content');
                        const progress = document.getElementById('progress-fill');
                        
                        content.classList.remove('hidden');
                        content.classList.add('fade-in');
                        
                        // Animate progress bar
                        let width = 0;
                        const interval = setInterval(() => {
                            width += 10;
                            progress.style.width = width + '%';
                            if (width >= 100) clearInterval(interval);
                        }, 100);
                    });
                    
                    // Form interactions
                    document.getElementById('rating').addEventListener('input', function(e) {
                        document.getElementById('rating-display').textContent = 'Rating: ' + e.target.value;
                    });
                    
                    document.getElementById('advanced-form').addEventListener('submit', function(e) {
                        e.preventDefault();
                        const result = document.getElementById('form-result');
                        const formData = new FormData(this);
                        const data = Object.fromEntries(formData.entries());
                        
                        result.innerHTML = '<h4>Form Submitted Successfully!</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        result.classList.remove('hidden');
                        result.classList.add('slide-down');
                    });
                    
                    // API interactions
                    document.getElementById('fetch-data').addEventListener('click', async function() {
                        const results = document.getElementById('api-results');
                        results.innerHTML = 'Loading...';
                        results.classList.remove('hidden');
                        
                        try {
                            const response = await fetch('/api/demo-data');
                            const data = await response.json();
                            results.innerHTML = '<h4>API Response:</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        } catch (error) {
                            results.innerHTML = '<h4>Mocked API Response:</h4><pre>' + JSON.stringify({
                                message: 'Demo data loaded successfully',
                                timestamp: new Date().toISOString(),
                                data: [1, 2, 3, 4, 5]
                            }, null, 2) + '</pre>';
                        }
                    });
                    
                    document.getElementById('post-data').addEventListener('click', async function() {
                        const results = document.getElementById('api-results');
                        results.innerHTML = 'Posting data...';
                        results.classList.remove('hidden');
                        
                        setTimeout(() => {
                            results.innerHTML = '<h4>POST Response:</h4><pre>' + JSON.stringify({
                                status: 'success',
                                message: 'Data posted successfully',
                                id: Math.floor(Math.random() * 1000)
                            }, null, 2) + '</pre>';
                        }, 1000);
                    });
                    
                    document.getElementById('simulate-error').addEventListener('click', function() {
                        const results = document.getElementById('api-results');
                        results.innerHTML = '<h4>Error Response:</h4><pre style="color: red;">' + JSON.stringify({
                            error: 'Simulated error for testing',
                            code: 500,
                            timestamp: new Date().toISOString()
                        }, null, 2) + '</pre>';
                        results.classList.remove('hidden');
                    });
                    
                    // Drag and drop
                    const dragSource = document.getElementById('drag-source');
                    const dropTarget = document.getElementById('drop-target');
                    
                    dragSource.setAttribute('draggable', true);
                    
                    dragSource.addEventListener('dragstart', function(e) {
                        e.dataTransfer.setData('text/plain', 'dragged-item');
                    });
                    
                    dropTarget.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        this.classList.add('drag-over');
                    });
                    
                    dropTarget.addEventListener('dragleave', function() {
                        this.classList.remove('drag-over');
                    });
                    
                    dropTarget.addEventListener('drop', function(e) {
                        e.preventDefault();
                        this.classList.remove('drag-over');
                        const data = e.dataTransfer.getData('text/plain');
                        document.getElementById('drag-result').innerHTML = '<h4>Drop successful!</h4><p>Dropped: ' + data + '</p>';
                        document.getElementById('drag-result').classList.remove('hidden');
                    });
                    
                    // Modal functionality
                    document.getElementById('open-modal').addEventListener('click', function() {
                        document.getElementById('demo-modal').style.display = 'flex';
                    });
                    
                    document.getElementById('close-modal').addEventListener('click', function() {
                        document.getElementById('demo-modal').style.display = 'none';
                    });
                    
                    document.getElementById('show-alert').addEventListener('click', function() {
                        alert('This is an alert dialog for testing browser dialogs!');
                    });
                    
                    document.getElementById('show-confirm').addEventListener('click', function() {
                        const result = confirm('Do you want to proceed with this action?');
                        console.log('Confirm result:', result);
                    });
                    
                    // Responsive testing
                    document.getElementById('test-responsive').addEventListener('click', function() {
                        const info = document.getElementById('responsive-info');
                        const width = window.innerWidth;
                        const height = window.innerHeight;
                        const devicePixelRatio = window.devicePixelRatio || 1;
                        
                        info.innerHTML = '<h4>Viewport Information:</h4>' +
                                       '<p>Width: ' + width + 'px</p>' +
                                       '<p>Height: ' + height + 'px</p>' +
                                       '<p>Device Pixel Ratio: ' + devicePixelRatio + '</p>' +
                                       '<p>User Agent: ' + navigator.userAgent.substring(0, 100) + '...</p>';
                        info.classList.remove('hidden');
                    });
                </script>
            </body>
            </html>
        `;
        
        // Load the enhanced demo page
        await page.setContent(htmlContent);
        
        // Test page title and basic structure
        await expect(page).toHaveTitle('Advanced Playwright MCP Demo');
        await expect(page.locator('h1')).toHaveText('🚀 Advanced Playwright MCP Demo');
        
        console.log('✅ Enhanced demo page loaded successfully');
    });

    test('should demonstrate state management and complex interactions', async ({ page }) => {
        // Create state management demo
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>State Management Demo</title></head>
            <body>
                <button id="state-btn">Change State</button>
                <div id="state-display">State: 0</div>
                <script>
                    let state = 0;
                    document.getElementById('state-btn').addEventListener('click', function() {
                        state++;
                        document.getElementById('state-display').textContent = 'State: ' + state;
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Test initial state
        await expect(page.locator('#state-display')).toHaveText('State: 0');
        
        // Test state changes through multiple clicks
        for (let i = 1; i <= 5; i++) {
            await page.click('#state-btn');
            await expect(page.locator('#state-display')).toHaveText(`State: ${i}`);
        }
        
        console.log('✅ State management testing complete');
    });

    test('should demonstrate file upload and download capabilities', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>File Operations Demo</title></head>
            <body>
                <input type="file" id="file-upload" multiple>
                <button id="download-btn">Download Test File</button>
                <div id="file-info"></div>
                <script>
                    document.getElementById('file-upload').addEventListener('change', function(e) {
                        const files = Array.from(e.target.files);
                        const info = files.map(f => f.name + ' (' + f.size + ' bytes)').join(', ');
                        document.getElementById('file-info').textContent = 'Files: ' + info;
                    });
                    
                    document.getElementById('download-btn').addEventListener('click', function() {
                        const content = 'This is a test file content\\nGenerated by Playwright MCP Demo';
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'playwright-demo.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                    });
                </script>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Test file upload (simulated)
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#file-upload');
        const fileChooser = await fileChooserPromise;
        
        // Create a temporary file for testing
        const fs = require('fs');
        const path = require('path');
        const tmpDir = path.join(__dirname, '..', 'test-results');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        
        const testFilePath = path.join(tmpDir, 'test-upload.txt');
        fs.writeFileSync(testFilePath, 'Test file content for upload');
        
        await fileChooser.setFiles(testFilePath);
        
        // Verify file upload worked
        await expect(page.locator('#file-info')).toContainText('test-upload.txt');
        
        // Test download
        const downloadPromise = page.waitForEvent('download');
        await page.click('#download-btn');
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toBe('playwright-demo.txt');
        
        // Clean up
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
        
        console.log('✅ File operations testing complete');
    });

    test('should demonstrate advanced browser features and contexts', async ({ browser }) => {
        // Test multiple contexts and pages
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();
        
        const page1 = await context1.newPage();
        const page2 = await context2.newPage();
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Context Demo</title></head>
            <body>
                <h1 id="context-title">Context Test Page</h1>
                <button id="set-storage">Set Local Storage</button>
                <div id="storage-info"></div>
                <script>
                    document.getElementById('set-storage').addEventListener('click', function() {
                        localStorage.setItem('test-key', 'context-' + Math.random());
                        document.getElementById('storage-info').textContent = 'Storage set: ' + localStorage.getItem('test-key');
                    });
                    
                    // Display current storage on load
                    const stored = localStorage.getItem('test-key');
                    if (stored) {
                        document.getElementById('storage-info').textContent = 'Existing storage: ' + stored;
                    }
                </script>
            </body>
            </html>
        `;
        
        await page1.setContent(htmlContent);
        await page2.setContent(htmlContent);
        
        // Test isolated storage between contexts
        await page1.click('#set-storage');
        await page2.click('#set-storage');
        
        const storage1 = await page1.locator('#storage-info').textContent();
        const storage2 = await page2.locator('#storage-info').textContent();
        
        // Verify contexts are isolated
        expect(storage1).not.toBe(storage2);
        expect(storage1).toContain('Storage set: context-');
        expect(storage2).toContain('Storage set: context-');
        
        await context1.close();
        await context2.close();
        
        console.log('✅ Context isolation testing complete');
    });

    test('should demonstrate advanced selectors and element manipulation', async ({ page }) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Advanced Selectors Demo</title></head>
            <body>
                <div class="container">
                    <div class="item" data-category="fruits">Apple</div>
                    <div class="item" data-category="fruits">Banana</div>
                    <div class="item" data-category="vegetables">Carrot</div>
                    <div class="item" data-category="vegetables" data-organic="true">Broccoli</div>
                    <p class="description">Total items: <span id="count">4</span></p>
                </div>
                <button id="filter-organic">Show Organic Only</button>
                <button id="filter-fruits">Show Fruits Only</button>
                <button id="show-all">Show All</button>
            </body>
            </html>
        `;
        
        await page.setContent(htmlContent);
        
        // Test complex selectors
        const allItems = page.locator('.item');
        const fruitItems = page.locator('.item[data-category="fruits"]');
        const organicItems = page.locator('.item[data-organic="true"]');
        
        // Verify counts
        await expect(allItems).toHaveCount(4);
        await expect(fruitItems).toHaveCount(2);
        await expect(organicItems).toHaveCount(1);
        
        // Test text-based selectors
        await expect(page.locator('text=Apple')).toBeVisible();
        await expect(page.locator('.item:has-text("Broccoli")')).toHaveAttribute('data-organic', 'true');
        
        // Test nth selectors
        await expect(allItems.nth(0)).toHaveText('Apple');
        await expect(allItems.nth(-1)).toHaveText('Broccoli');
        
        // Test filtering
        const visibleItems = allItems.locator(':visible');
        await expect(visibleItems).toHaveCount(4);
        
        console.log('✅ Advanced selectors testing complete');
    });

    test('should demonstrate performance monitoring and metrics', async ({ page }) => {
        console.log('🔄 Starting performance monitoring...');
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Performance Demo</title></head>
            <body>
                <h1>Performance Testing Page</h1>
                <button id="heavy-task">Start Heavy Task</button>
                <div id="result"></div>
                <script>
                    document.getElementById('heavy-task').addEventListener('click', function() {
                        const start = performance.now();
                        
                        // Simulate heavy computation
                        let result = 0;
                        for (let i = 0; i < 1000000; i++) {
                            result += Math.random();
                        }
                        
                        const end = performance.now();
                        document.getElementById('result').textContent = 'Task completed in ' + (end - start).toFixed(2) + 'ms';
                    });
                </script>
            </body>
            </html>
        `;
        
        // Monitor performance metrics
        const performanceMetrics = [];
        
        page.on('metrics', metrics => {
            performanceMetrics.push(metrics);
        });
        
        const startTime = Date.now();
        await page.setContent(htmlContent);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`Page load time: ${loadTime}ms`);
        
        // Test heavy task performance
        await page.click('#heavy-task');
        await expect(page.locator('#result')).toContainText('Task completed in');
        
        const taskResult = await page.locator('#result').textContent();
        console.log(`Heavy task result: ${taskResult}`);
        
        // Get performance metrics
        const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                resourceCount: performance.getEntriesByType('resource').length
            };
        });
        
        console.log('Performance metrics:', metrics);
        
        expect(loadTime).toBeLessThan(5000);
        expect(metrics.domContentLoaded).toBeGreaterThanOrEqual(0);
        
        console.log('✅ Performance monitoring complete');
    });
});