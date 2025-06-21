# Test Results Processing

This folder contains scripts for processing and uploading Playwright test results.

## Files

- `create-test-result-json.js` - Converts Playwright's JSON report into our custom format
- `upload-test-result.js` - Uploads test results to the backend API

## Usage

The scripts expect test artifacts to be in the `test-results` folder:

```bash
# Run tests (creates test-results/playwright-report.json)
npx playwright test

# Create result JSON (saves to test-results/my-test-result.json)
node reporting/create-test-result-json.js test-results/playwright-report.json test-results/my-test-result.json

# Upload results
node reporting/upload-test-result.js test-results/my-test-result.json
```

## Output Format

The generated JSON includes:
- Test run status (passed/failed)
- Start and end times in both ISO and human-readable formats
- Duration in milliseconds and human-readable format
- Test results summary
