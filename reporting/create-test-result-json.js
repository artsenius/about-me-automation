// create-test-result-json.js
// Usage: node reporting/create-test-result-json.js <playwright-json-report> <output-json-file>

const fs = require('fs');
const path = require('path');

function getStatus(stats) {
    if (stats.failed > 0) return 'failed';
    return 'passed';
}

function formatDate(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
}

function getTime(stats) {
    const start = new Date(stats.startTime);
    const end = new Date(start.getTime() + stats.duration);
    return {
        startedAt: start, // Date object for MongoDB
        finishedAt: end, // Date object for MongoDB
        duration: stats.duration, // number in ms
        display: { // for human readability
            startedAt: formatDate(start),
            finishedAt: formatDate(end),
            duration: formatDuration(stats.duration)
        }
    };
}

function processSpecs(specs) {
    return specs.map(spec => ({
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
