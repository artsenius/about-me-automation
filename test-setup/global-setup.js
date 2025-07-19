const { chromium } = require('@playwright/test');

async function globalSetup() {
    console.log('🚀 Starting global test setup...');
    
    // Test site availability and handle rate limiting
    const browser = await chromium.launch();
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    try {
        console.log('🌐 Checking site availability...');
        
        // Try to access the site with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let siteAvailable = false;
        
        while (attempts < maxAttempts && !siteAvailable) {
            try {
                const response = await page.goto('https://www.arthursenko.com/', {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });
                
                if (response && response.status() === 200) {
                    siteAvailable = true;
                    console.log('✅ Site is available and responding');
                } else if (response && response.status() === 429) {
                    console.log(`⚠️  Rate limiting detected (429). Waiting before retry... (attempt ${attempts + 1}/${maxAttempts})`);
                    await page.waitForTimeout(5000); // Wait 5 seconds
                } else {
                    console.log(`⚠️  Site returned status ${response?.status()}. Retrying... (attempt ${attempts + 1}/${maxAttempts})`);
                }
            } catch (error) {
                console.log(`⚠️  Site access failed: ${error.message}. Retrying... (attempt ${attempts + 1}/${maxAttempts})`);
            }
            
            attempts++;
            if (attempts < maxAttempts && !siteAvailable) {
                await page.waitForTimeout(2000); // Wait 2 seconds between attempts
            }
        }
        
        if (!siteAvailable) {
            console.log('❌ Site is not available or rate limiting is active. Tests may fail.');
            console.log('💡 Suggestion: Run tests with longer delays or check site status');
        }
        
        // Add a small delay to avoid immediate rate limiting
        await page.waitForTimeout(1000);
        
    } catch (error) {
        console.log(`⚠️  Global setup error: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    console.log('✅ Global setup completed');
}

module.exports = globalSetup;