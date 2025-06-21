# Test Result Processing

This folder contains scripts for processing and uploading test results.

## create-test-result-json.js

Converts Playwright JSON test results into a format compatible with our backend API.

### Usage

```bash
node create-test-result-json.js [input-json] [output-json] [--project "Project Name"] [--status "status"]
```

Default paths if no arguments provided:
- Input: test-results/results.json
- Output: test-results/playwright-report.json

### Optional Parameters

- `--project`: Project name (default: "About Me Website")
- `--status`: Force a specific status (default: derived from test results)

## upload-test-result.js

Uploads the formatted test results to the backend API.

### Usage

```bash
node upload-test-result.js --file <path-to-json> --api-url <api-endpoint>
```

Example:
```bash
node upload-test-result.js \
  --file test-results/playwright-report.json \
  --api-url "https://your-api.com/test-runs"
```

### Required Parameters

- `--file`: Path to the JSON file containing test results
- `--api-url`: Full URL of the API endpoint
