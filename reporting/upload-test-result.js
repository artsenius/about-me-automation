// upload-test-result.js
// Usage: node reporting/upload-test-result.js <result-json-file>

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://about-me-automation-backend.azurewebsites.net/api/test-runs';

async function uploadResult(resultPath) {
    try {
        const absPath = path.resolve(resultPath);
        const data = JSON.parse(fs.readFileSync(absPath, 'utf-8'));
        // Remove display field before sending to backend
        const { display, ...payload } = data;

        console.log('Uploading test results:', JSON.stringify(payload, null, 2));

        const response = await axios.post(API_URL, payload, {
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
    const file = process.argv[2];
    if (!file) {
        console.error('Usage: node reporting/upload-test-result.js <result-json-file>');
        process.exit(1);
    }
    uploadResult(file);
}
