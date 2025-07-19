#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.testResults = [];
        this.failedTests = [];
        this.startTime = Date.now();
    }

    async checkEnvironment() {
        console.log('🔍 Checking test environment...\n');
        
        // Check if node_modules exists
        if (!fs.existsSync('node_modules')) {
            console.log('❌ node_modules not found. Running npm install...');
            await this.runCommand('npm', ['install']);
        } else {
            console.log('✅ node_modules found');
        }

        // Check if Playwright is installed
        try {
            const playwrightPath = path.join('node_modules', '.bin', 'playwright');
            if (!fs.existsSync(playwrightPath)) {
                console.log('❌ Playwright not found. Installing...');
                await this.runCommand('npx', ['playwright', 'install']);
            } else {
                console.log('✅ Playwright found');
            }
        } catch (error) {
            console.log('⚠️  Playwright check failed:', error.message);
        }

        // Check test directory
        if (!fs.existsSync('tests')) {
            console.log('❌ Tests directory not found');
            return false;
        } else {
            console.log('✅ Tests directory found');
        }

        console.log(''); // Empty line for spacing
        return true;
    }

    async runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                stdio: 'inherit',
                shell: true,
                ...options
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(code);
                } else {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            });

            process.on('error', (error) => {
                reject(error);
            });
        });
    }

    async runTestSuite(testFile = null, options = {}) {
        const args = ['playwright', 'test'];
        
        if (testFile) {
            args.push(testFile);
        }

        if (options.headed) {
            args.push('--headed');
        }

        if (options.debug) {
            args.push('--debug');
        }

        if (options.ui) {
            args.push('--ui');
        }

        if (options.timeout) {
            args.push(`--timeout=${options.timeout}`);
        }

        if (options.retries) {
            args.push(`--retries=${options.retries}`);
        }

        if (options.workers) {
            args.push(`--workers=${options.workers}`);
        }

        if (options.reporter) {
            args.push(`--reporter=${options.reporter}`);
        }

        try {
            console.log(`🚀 Running: npx ${args.join(' ')}`);
            await this.runCommand('npx', args);
            console.log('✅ Tests completed successfully');
            return true;
        } catch (error) {
            console.log('❌ Tests failed:', error.message);
            return false;
        }
    }

    async runIndividualTests() {
        const testFiles = [
            'tests/about-page.spec.js',
            'tests/contact-page.spec.js',
            'tests/header.spec.js',
            'tests/footer.spec.js',
            'tests/performance.spec.js',
            'tests/accessibility.spec.js',
            'tests/security.spec.js',
            'tests/cross-browser.spec.js'
        ];

        console.log('🔬 Running individual test files...\n');

        for (const testFile of testFiles) {
            if (fs.existsSync(testFile)) {
                console.log(`\n📝 Running ${testFile}...`);
                try {
                    const success = await this.runTestSuite(testFile, {
                        timeout: 30000,
                        retries: 1,
                        workers: 1,
                        reporter: 'list'
                    });
                    
                    this.testResults.push({
                        file: testFile,
                        success: success,
                        timestamp: new Date().toISOString()
                    });

                    if (!success) {
                        this.failedTests.push(testFile);
                    }
                } catch (error) {
                    console.log(`❌ Failed to run ${testFile}:`, error.message);
                    this.failedTests.push(testFile);
                }
            } else {
                console.log(`⚠️  Test file not found: ${testFile}`);
            }
        }
    }

    async generateReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const passed = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;

        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST EXECUTION REPORT');
        console.log('='.repeat(60));
        console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📁 Total Files: ${this.testResults.length}`);
        
        if (this.failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.failedTests.forEach(test => {
                console.log(`   - ${test}`);
            });
        }

        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            results: this.testResults,
            failedTests: this.failedTests,
            summary: {
                passed: passed,
                failed: failed,
                total: this.testResults.length
            }
        };

        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }

        fs.writeFileSync(
            path.join('test-results', 'test-execution-report.json'),
            JSON.stringify(report, null, 2)
        );

        console.log('\n📄 Report saved to: test-results/test-execution-report.json');
        console.log('='.repeat(60));
    }

    async main() {
        const args = process.argv.slice(2);
        const options = {};

        // Parse command line arguments
        args.forEach(arg => {
            if (arg === '--headed') options.headed = true;
            if (arg === '--debug') options.debug = true;
            if (arg === '--ui') options.ui = true;
            if (arg.startsWith('--timeout=')) options.timeout = arg.split('=')[1];
            if (arg.startsWith('--retries=')) options.retries = arg.split('=')[1];
            if (arg.startsWith('--workers=')) options.workers = arg.split('=')[1];
            if (arg.startsWith('--reporter=')) options.reporter = arg.split('=')[1];
        });

        console.log('🎭 Enhanced Playwright Test Runner\n');

        // Check environment
        const envReady = await this.checkEnvironment();
        if (!envReady) {
            console.log('❌ Environment not ready for testing');
            process.exit(1);
        }

        // Try running all tests first
        console.log('🚀 Attempting to run all tests...\n');
        const allTestsSuccess = await this.runTestSuite(null, {
            timeout: 60000,
            retries: 1,
            workers: 2,
            reporter: 'html'
        });

        if (!allTestsSuccess) {
            console.log('\n⚠️  Full test suite failed. Trying individual test files...\n');
            await this.runIndividualTests();
        } else {
            this.testResults.push({
                file: 'All tests',
                success: true,
                timestamp: new Date().toISOString()
            });
        }

        await this.generateReport();

        // Exit with appropriate code
        if (this.failedTests.length > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🎭 Enhanced Playwright Test Runner

Usage: node scripts/test-runner.js [options]

Options:
  --headed          Run tests in headed mode (visible browser)
  --debug           Run tests in debug mode
  --ui              Open Playwright UI mode
  --timeout=<ms>    Set test timeout (default: 60000)
  --retries=<n>     Set number of retries (default: 1)
  --workers=<n>     Set number of parallel workers (default: 2)
  --reporter=<type> Set reporter type (html, json, list, etc.)
  --help, -h        Show this help message

Examples:
  node scripts/test-runner.js                 # Run all tests
  node scripts/test-runner.js --headed        # Run with visible browser
  node scripts/test-runner.js --ui            # Open UI mode
  node scripts/test-runner.js --timeout=30000 # Set 30s timeout
`);
    process.exit(0);
}

// Run the test runner
const runner = new TestRunner();
runner.main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});