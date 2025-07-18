#!/bin/bash

# Run Tests Script - About Me Website Automation
# This script provides different testing options with proper configuration

set -e

echo "🎭 About Me Website - Test Automation Runner"
echo "============================================="

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  --all              Run all tests (Chromium only, skips WebKit)"
    echo "  --chromium         Run Chromium tests only"
    echo "  --accessibility    Run accessibility tests only"
    echo "  --mobile           Attempt Mobile Safari tests (may timeout)"
    echo "  --single FILE      Run specific test file"
    echo "  --debug            Run tests in debug mode"
    echo "  --headed           Run tests in headed mode"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --all                                    # Run all stable tests"
    echo "  $0 --single tests/about-page.spec.js       # Run specific test"
    echo "  $0 --accessibility                         # Run accessibility tests"
    echo "  $0 --debug --headed                        # Debug mode with browser"
}

# Default options
RUN_ALL=false
RUN_CHROMIUM=false
RUN_ACCESSIBILITY=false
RUN_MOBILE=false
DEBUG_MODE=false
HEADED_MODE=false
SINGLE_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            RUN_ALL=true
            shift
            ;;
        --chromium)
            RUN_CHROMIUM=true
            shift
            ;;
        --accessibility)
            RUN_ACCESSIBILITY=true
            shift
            ;;
        --mobile)
            RUN_MOBILE=true
            shift
            ;;
        --single)
            SINGLE_FILE="$2"
            shift 2
            ;;
        --debug)
            DEBUG_MODE=true
            shift
            ;;
        --headed)
            HEADED_MODE=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Build command options
CMD_OPTIONS=""

if [ "$DEBUG_MODE" = true ]; then
    CMD_OPTIONS="$CMD_OPTIONS --debug"
fi

if [ "$HEADED_MODE" = true ]; then
    CMD_OPTIONS="$CMD_OPTIONS --headed"
fi

# Set environment variables
export SKIP_WEBKIT=true

# Run tests based on options
if [ "$RUN_ALL" = true ]; then
    echo "🚀 Running all stable tests (Chromium + Accessibility)..."
    npx playwright test --project=chromium --project=accessibility $CMD_OPTIONS
    
elif [ "$RUN_CHROMIUM" = true ]; then
    echo "🌐 Running Chromium tests only..."
    npx playwright test --project=chromium $CMD_OPTIONS
    
elif [ "$RUN_ACCESSIBILITY" = true ]; then
    echo "♿ Running accessibility tests..."
    npx playwright test --project=accessibility $CMD_OPTIONS
    
elif [ "$RUN_MOBILE" = true ]; then
    echo "📱 Attempting Mobile Safari tests (may timeout in some environments)..."
    unset SKIP_WEBKIT
    npx playwright test --project="Mobile Safari" --timeout=120000 $CMD_OPTIONS
    
elif [ -n "$SINGLE_FILE" ]; then
    echo "📄 Running single test file: $SINGLE_FILE"
    npx playwright test "$SINGLE_FILE" --project=chromium $CMD_OPTIONS
    
else
    echo "⚠️  No test option specified. Use --help for usage information."
    echo "Running default: Chromium tests only..."
    npx playwright test --project=chromium $CMD_OPTIONS
fi

echo ""
echo "✅ Test execution completed!"
echo "📊 View HTML report: npx playwright show-report"
echo "📁 Test artifacts saved in: test-results/"