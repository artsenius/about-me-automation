// create-test-result-json.js
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const inputFile = args[0];
const outputFile = args[1];

// Get optional parameters from command line
const projectArg = args.indexOf('--project');
const statusArg = args.indexOf('--status');

const projectName = projectArg !== -1 ? args[projectArg + 1] : 'About Me Website';
const forcedStatus = statusArg !== -1 ? args[statusArg + 1] : null;

if (!inputFile || !outputFile) {
    console.error('Usage: node create-test-result-json.js <input-json> <output-json> [--project "Project Name"] [--status "status"]');
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
        title: spec.title,
        tests: spec.tests.map(test => ({
            projectName: test.projectName,
            results: test.results.map(result => ({
                status: result.status
            }))
        }))
    }));
}

function getResults(report) {
    let passed = 0;
    let failed = 0;
    const suites = [];

    // Process each test suite
    for (const reportSuite of report.suites || []) {
        const suite = {
            title: reportSuite.suites[0].title,
            specs: []
        };

        // Process specs in the suite
        for (const spec of reportSuite.suites[0].specs) {
            const specResult = {
                title: spec.title,
                tests: spec.tests.map(test => {
                    // Count results while processing
                    test.results.forEach(result => {
                        if (result.status === 'passed') passed++;
                        else if (result.status === 'failed') failed++;
                    });

                    return {
                        projectName: test.projectName,
                        results: test.results.map(r => ({ status: r.status }))
                    };
                })
            };
            suite.specs.push(specResult);
        }
        suites.push(suite);
    }

    return { passed, failed, suites };
}

function main() {
    const [, , reportFile, outputFile] = process.argv;
    if (!reportFile || !outputFile) {
        console.error('Usage: node reporting/create-test-result-json.js <playwright-json-report> <output-json-file>');
        process.exit(1);
    }
    // If the reportFile is not an absolute path, look for it in test-results/
    let absReport = path.resolve(reportFile);
    if (!fs.existsSync(absReport)) {
        absReport = path.resolve('test-results', reportFile);
        if (!fs.existsSync(absReport)) {
            console.error('Report file not found:', reportFile);
            process.exit(1);
        }
    }
    const report = JSON.parse(fs.readFileSync(absReport, 'utf-8'));
    const project = 'Playwright';
    const status = getStatus(report.stats);
    const { startedAt, finishedAt, duration, display } = getTime(report.stats);
    const results = getResults(report);
    const result = {
        project,
        status,
        startedAt,
        finishedAt,
        duration,
        results,
        display // additional field for human readability
    };
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log('Test result JSON created:', outputFile);
}

if (require.main === module) main();
