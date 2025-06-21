// upload-test-result.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DEFAULT_API_URL = 'https://about-me-automation-backend.azurewebsites.net/api/test-runs';
const DEFAULT_FILE_PATH = 'test-results/playwright-report.json';

// Parse command line arguments
const args = process.argv.slice(2);
let filePath = DEFAULT_FILE_PATH;
let apiUrl = DEFAULT_API_URL;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length) {
        filePath = args[i + 1];
        i++;
    } else if (args[i] === '--api-url' && i + 1 < args.length) {
        apiUrl = args[i + 1];
        i++;
    }
}

async function uploadResult(resultPath, apiEndpoint) {
    if (!fs.existsSync(resultPath)) {
        console.error(`Test result file not found: ${resultPath}`);
        process.exit(1);
    }

    try {
        const absPath = path.resolve(resultPath);
        const data = JSON.parse(fs.readFileSync(absPath, 'utf-8'));

        console.log(`Uploading test results to ${apiEndpoint}:`, JSON.stringify(data, null, 2));

        const response = await axios.post(apiEndpoint, data, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // 60 seconds
        });
        console.log('Upload successful:', response.data);
        return true;
    } catch (err) {
        if (err.response) {
            console.error('Upload failed:', err.response.data);
            console.error('Status:', err.response.status);
        } else if (err.request) {
            console.error('No response received:', err.message);
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    console.log(`Using test results file: ${filePath}`);
    console.log(`Using API endpoint: ${apiUrl}`);
    uploadResult(filePath, apiUrl);
}
