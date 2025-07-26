#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Test configuration
const testConfig = {
    timeout: 30000,
    workers: 1,
    retries: 1
};

// Test files to run in order of priority
const testFiles = [
    'header.spec.js',           // Basic navigation
    'footer.spec.js',           // Footer functionality  
    'about-page.spec.js',       // Main page content
    'contact-page.spec.js',     // Contact functionality
    'about-app-page.spec.js',   // About app page
    'live-test-automation.spec.js', // Live automation
    'accessibility.spec.js',    // Accessibility tests
    'performance.spec.js',      // Performance tests
    'cross-browser.spec.js',    // Cross-browser tests
    'security.spec.js',         // Security tests
    'error-handling.spec.js'    // Error handling
];

// Results tracking
const results = {
    passed: [],
    failed: [],
    timeout: [],
    total: 0
};

async function runTest(testFile) {
    return new Promise((resolve) => {
        const command = `npx playwright test tests/${testFile} --timeout=${testConfig.timeout} --workers=${testConfig.workers} --retries=${testConfig.retries}`;
        
        console.log(`\n🧪 Running ${testFile}...`);
        
        const startTime = Date.now();
        const child = exec(command, { cwd: process.cwd() });
        
        let output = '';
        let hasOutput = false;
        
        child.stdout?.on('data', (data) => {
            output += data;
            hasOutput = true;
            process.stdout.write('.');
        });
        
        child.stderr?.on('data', (data) => {
            output += data;
            hasOutput = true;
            process.stdout.write('!');
        });
        
        // Set a timeout for the test
        const timeout = setTimeout(() => {
            child.kill('SIGTERM');
            console.log(`\n⏱️  ${testFile} timed out after ${testConfig.timeout}ms`);
            results.timeout.push(testFile);
            resolve({
                testFile,
                status: 'timeout',
                duration: Date.now() - startTime,
                output: output.substring(0, 500) + '...'
            });
        }, testConfig.timeout + 5000); // Give extra time for cleanup
        
        child.on('close', (code) => {
            clearTimeout(timeout);
            const duration = Date.now() - startTime;
            
            if (code === 0) {
                console.log(`\n✅ ${testFile} passed (${duration}ms)`);
                results.passed.push(testFile);
                resolve({
                    testFile,
                    status: 'passed',
                    duration,
                    output: hasOutput ? output.substring(output.length - 200) : 'No output'
                });
            } else {
                console.log(`\n❌ ${testFile} failed with code ${code} (${duration}ms)`);
                results.failed.push(testFile);
                resolve({
                    testFile,
                    status: 'failed',
                    duration,
                    output: output.substring(0, 500) + '...',
                    exitCode: code
                });
            }
        });
    });
}

async function runAllTests() {
    console.log('🚀 Starting Playwright test suite...\n');
    console.log(`Configuration: timeout=${testConfig.timeout}ms, workers=${testConfig.workers}, retries=${testConfig.retries}\n`);
    
    const testResults = [];
    results.total = testFiles.length;
    
    // Run tests sequentially to avoid resource conflicts
    for (const testFile of testFiles) {
        const result = await runTest(testFile);
        testResults.push(result);
        
        // Short pause between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate summary report
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n✅ Passed: ${results.passed.length}/${results.total}`);
    results.passed.forEach(test => console.log(`   ✓ ${test}`));
    
    if (results.failed.length > 0) {
        console.log(`\n❌ Failed: ${results.failed.length}/${results.total}`);
        results.failed.forEach(test => console.log(`   ✗ ${test}`));
    }
    
    if (results.timeout.length > 0) {
        console.log(`\n⏱️  Timeout: ${results.timeout.length}/${results.total}`);
        results.timeout.forEach(test => console.log(`   ⏱ ${test}`));
    }
    
    const passRate = ((results.passed.length / results.total) * 100).toFixed(1);
    console.log(`\n📈 Pass Rate: ${passRate}%`);
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    testResults.forEach(result => {
        const statusIcon = result.status === 'passed' ? '✅' : 
                          result.status === 'failed' ? '❌' : '⏱️';
        console.log(`${statusIcon} ${result.testFile} (${result.duration}ms)`);
        if (result.status !== 'passed' && result.output) {
            console.log(`   Output: ${result.output.substring(0, 100)}...`);
        }
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (results.timeout.length > 0) {
        console.log('   - Consider increasing timeout values for slow tests');
        console.log('   - Check network connectivity to https://www.arthursenko.com/');
        console.log('   - Run tests with --headed flag to debug visual issues');
    }
    if (results.failed.length > 0) {
        console.log('   - Review failed test logs for specific error messages');
        console.log('   - Run individual tests with --debug flag for detailed output');
    }
    if (results.passed.length > 0) {
        console.log('   - ✨ Good test coverage for working functionality!');
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Return overall success
    return results.failed.length === 0 && results.timeout.length < results.total * 0.5;
}

// Main execution
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests, runTest };