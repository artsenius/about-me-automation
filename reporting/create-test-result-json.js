// create-test-result-json.js
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let inputFile = 'test-results/results.json';
let outputFile = 'test-results/playwright-report.json';
let projectName = 'Playwright';
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
