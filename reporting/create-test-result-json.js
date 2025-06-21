// create-test-result-json.js
const fs = require('fs');
const path = require('path');

// Default paths in test-results folder
const defaultInputFile = path.join('test-results', 'results.json');
const defaultOutputFile = path.join('test-results', 'playwright-report.json');

// Parse command line arguments
const args = process.argv.slice(2);
const inputFile = args[0] || defaultInputFile;
const outputFile = args[1] || defaultOutputFile;

// Get optional parameters from command line
const projectArg = args.indexOf('--project');
const statusArg = args.indexOf('--status');

const projectName = projectArg !== -1 ? args[projectArg + 1] : 'About Me Website';
const forcedStatus = statusArg !== -1 ? args[statusArg + 1] : null;

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

    rawData.suites.forEach(mainSuite => {
        mainSuite.suites.forEach(suite => {
            suite.specs.forEach(spec => {
                spec.tests.forEach(test => {
                    const result = test.results[0]; // Take first result
                    if (result.status === 'passed') passed++;
                    else if (result.status === 'failed') failed++;
                    else if (result.status === 'skipped') skipped++;

                    testResults.push({
                        title: spec.title,
                        suite: suite.title,
                        file: mainSuite.file,
                        browser: test.projectName,
                        status: result.status,
                        duration: result.duration,
                        error: result.errors.length > 0 ? result.errors[0] : null
                    });
                });
            });
        });
    });

    return {
        project: projectName,
        status: getStatus({ failed, passed, skipped }),
        startedAt: startTime,
        finishedAt: endTime,
        duration: rawData.stats.duration,
        results: {
            passed,
            failed,
            skipped,
            tests: testResults
        }
    };
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
} catch (error) {
    console.error('Error processing test results:', error);
    process.exit(1);
}
