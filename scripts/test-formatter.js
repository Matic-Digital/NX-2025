#!/usr/bin/env node

/**
 * Test Output Formatter
 *
 * This script filters and formats the output of Vitest to make it more readable
 * by removing unnecessary console logs, warnings, and error stacks.
 *
 * Usage:
 * npm run test:coverage | node scripts/test-formatter.js
 */
import { createInterface } from 'readline';

// Create a readline interface to read from stdin
const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Patterns to filter out
const filterPatterns = [
  /^Box props:/,
  /^Generated classes:/,
  /^Warning:/,
  /^stderr \|/,
  /at\s+/, // Stack trace lines
  /^\s+at\s+/, // Indented stack trace lines
  /^\s{2,}\w+/ // Deeply nested object properties
];

// Patterns to highlight
const highlightPatterns = [
  { pattern: /✓ .+ \(\d+ tests?\)/, color: '\x1b[32m' }, // Green for passed tests
  { pattern: /⨯ .+ \(\d+ tests?\)/, color: '\x1b[31m' }, // Red for failed tests
  { pattern: /Test Files\s+\d+ passed/, color: '\x1b[32m' }, // Green for test summary
  { pattern: /Duration/, color: '\x1b[36m' }, // Cyan for duration
  { pattern: /Coverage report/, color: '\x1b[35m' }, // Magenta for coverage
  { pattern: /All files/, color: '\x1b[33m' } // Yellow for coverage summary
];

// Reset color code
const resetColor = '\x1b[0m';

// Keep track of test file being processed
let currentTestFile = '';
let inStackTrace = false;
let skipNextLines = 0;

// Process each line
readline.on('line', (line) => {
  // Skip lines if counter is active
  if (skipNextLines > 0) {
    skipNextLines--;
    return;
  }

  // Check if this is a new test file
  const testFileMatch = line.match(/^(✓|⨯) (.+) \((\d+) tests?\)/);
  if (testFileMatch && testFileMatch[2]) {
    currentTestFile = testFileMatch[2];
    inStackTrace = false;

    // Apply color highlighting
    for (const { pattern, color } of highlightPatterns) {
      if (pattern.test(line)) {
        console.log(`${color}${line}${resetColor}`);
        return;
      }
    }

    console.log(line);
    return;
  }

  // Check if this line should be filtered out
  for (const pattern of filterPatterns) {
    if (pattern.test(line)) {
      return; // Skip this line
    }
  }

  // If we detect an error message, we're entering a stack trace
  if (line.includes('Error:')) {
    inStackTrace = true;
    console.log(`\x1b[31m${line}\x1b[0m`); // Print error in red
    skipNextLines = 3; // Skip the next few lines of stack trace
    return;
  }

  // If we're in a stack trace and find an empty line, we're exiting the stack trace
  if (inStackTrace && line.trim() === '') {
    inStackTrace = false;
  }

  // Skip stack trace lines
  if (inStackTrace) {
    return;
  }

  // Apply color highlighting for special lines
  for (const { pattern, color } of highlightPatterns) {
    if (pattern.test(line)) {
      console.log(`${color}${line}${resetColor}`);
      return;
    }
  }

  // Print other lines normally
  console.log(line);
});

// Handle end of input
readline.on('close', () => {
  // Final output when done
  console.log('\n\x1b[32m✓ Test output formatting complete\x1b[0m');
});
