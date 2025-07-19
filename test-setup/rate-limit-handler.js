/**
 * Rate limiting utility for handling 429 responses and delays
 */
class RateLimitHandler {
    static delay = 1000; // Default delay in milliseconds
    static maxRetries = 3;
    
    /**
     * Wait for a specified amount of time
     * @param {number} ms - Milliseconds to wait
     */
    static async wait(ms = this.delay) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Execute a function with retry logic for rate limiting
     * @param {Function} fn - Function to execute
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} delayMs - Delay between retries
     */
    static async withRetry(fn, maxRetries = this.maxRetries, delayMs = this.delay) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // Check if error is rate limiting related
                if (this.isRateLimitError(error)) {
                    console.log(`Rate limiting detected on attempt ${attempt}/${maxRetries}. Waiting ${delayMs}ms...`);
                    
                    if (attempt < maxRetries) {
                        await this.wait(delayMs * attempt); // Exponential backoff
                        continue;
                    }
                }
                
                // For non-rate-limit errors, don't retry
                if (attempt === 1) {
                    throw error;
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Check if an error is related to rate limiting
     * @param {Error} error - Error to check
     */
    static isRateLimitError(error) {
        const errorMessage = error.message?.toLowerCase() || '';
        
        return (
            errorMessage.includes('429') ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('too many requests') ||
            errorMessage.includes('target page, context or browser has been closed')
        );
    }
    
    /**
     * Navigate to a page with rate limiting protection
     * @param {Page} page - Playwright page object
     * @param {string} url - URL to navigate to
     * @param {object} options - Navigation options
     */
    static async navigateWithProtection(page, url, options = {}) {
        return this.withRetry(async () => {
            const response = await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 60000,
                ...options
            });
            
            if (response && response.status() === 429) {
                throw new Error('Rate limit encountered (429)');
            }
            
            return response;
        });
    }
    
    /**
     * Click an element with rate limiting protection
     * @param {Page} page - Playwright page object
     * @param {string} selector - Element selector
     * @param {object} options - Click options
     */
    static async clickWithProtection(page, selector, options = {}) {
        return this.withRetry(async () => {
            await page.locator(selector).click({
                timeout: 30000,
                ...options
            });
            
            // Wait a bit after clicking to avoid rapid requests
            await this.wait(500);
        });
    }
}

module.exports = RateLimitHandler;