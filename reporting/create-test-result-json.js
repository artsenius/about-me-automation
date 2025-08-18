// create-test-result-json.js
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let inputFile = 'test-results/results.json';
let outputFile = 'test-results/playwright-report.json';
let projectName = process.env.PROJECT_NAME || 'Playwright Local Run';
let forcedStatus = null;

// Parse named arguments first
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) {
        projectName = args[i + 1];
        i++; // Skip next argument
    } else if (args[i] === '--status' && i + 1 < args.length) {
        forcedStatus = args[i + 1];
        i++; // Skip next argument
    } else if (!args[i].startsWith('--')) {
        // If it's not a named argument, treat as positional
        if (inputFile === 'test-results/results.json') {
            inputFile = args[i];
        } else if (outputFile === 'test-results/playwright-report.json') {
            outputFile = args[i];
        }
    }
}

if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    console.error('Usage: node create-test-result-json.js [input-json] [output-json] [--project "Project Name"] [--status "status"]');
    console.error('Defaults: input=test-results/results.json, output=test-results/playwright-report.json');
    process.exit(1);
}

function getStatus(stats) {
    if (forcedStatus) return forcedStatus;
    if (stats.failed > 0) return 'failed';
    return 'passed';
}

function formatDate(date) {
    return date.toISOString();
}

function processTestResults(rawData) {
    const startTime = new Date(rawData.stats.startTime);
    const endTime = new Date(startTime.getTime() + rawData.stats.duration);

    // Process all test results across suites
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const testResults = [];

    // Track failed tests with details
    const failedTests = [];

    // Recursive function to process nested suites
    function processSuite(suite, file, parentSuiteTitle = '') {
        // Process specs in current suite
        if (suite.specs && suite.specs.length > 0) {
            suite.specs.forEach(spec => {
                spec.tests.forEach(test => {
                    const result = test.results[0]; // Take first result
                    const status = result.status === 'timedOut' ? 'failed' : result.status;

                    if (status === 'passed') passed++;
                    else if (status === 'failed') {
                        failed++;
                        failedTests.push({
                            title: spec.title,
                            suite: suite.title,
                            file: file,
                            error: result.errors[0]?.message || 'Unknown error'
                        });
                    }
                    else if (status === 'skipped') skipped++;

                    testResults.push({
                        title: spec.title,
                        suite: suite.title,
                        file: file,
                        browser: test.projectName,
                        status: status,
                        duration: result.duration,
                        error: result.errors.length > 0 ? {
                            message: result.errors[0].message,
                            stack: result.errors[0].stack
                        } : null
                    });
                });
            });
        }

        // Recursively process nested suites
        if (suite.suites && suite.suites.length > 0) {
            suite.suites.forEach(nestedSuite => {
                processSuite(nestedSuite, file, suite.title);
            });
        }
    }

    rawData.suites.forEach(mainSuite => {
        if (mainSuite.suites && mainSuite.suites.length > 0) {
            mainSuite.suites.forEach(suite => {
                processSuite(suite, mainSuite.file);
            });
        }
    });

    // Include detailed failure information
    const resultData = {
        project: projectName,
        status: getStatus({ failed, passed, skipped }),
        startedAt: formatDate(startTime),
        finishedAt: formatDate(endTime),
        duration: rawData.stats.duration,
        results: {
            passed,
            failed,
            skipped,
            tests: testResults
        }
    };

    if (failed > 0) {
        resultData.failures = failedTests;
    }

    return resultData;
}

try {
    // Read input file
    const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // Process the data
    const formattedData = processTestResults(rawData);

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the output file
    fs.writeFileSync(outputFile, JSON.stringify(formattedData, null, 2));
    console.log(`Test results successfully written to ${outputFile}`);
    console.log(`Project name for report: ${projectName}`);
} catch (error) {
    console.error('Error processing test results:', error);
    process.exit(1);
}
