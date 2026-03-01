#!/bin/bash
# ดาวเทวา — Test runner
# Run this on your local machine after: npm install

set -e
cd "$(dirname "$0")/.."

echo "🌟 ดาวเทวา — Running test suite"
echo "================================"

# Run all engine tests
echo ""
echo "▶ Engine tests"
npx jest --testPathPattern="tests/engines" --verbose

# Run API tests
echo ""
echo "▶ API / Interpretation tests"
npx jest --testPathPattern="tests/api" --verbose

# Full suite summary
echo ""
echo "▶ Full suite"
npx jest --testPathPattern="tests/" --coverage --coverageReporters=text-summary

echo ""
echo "✅ All tests complete"
