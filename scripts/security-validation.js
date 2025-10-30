#!/usr/bin/env node

/**
 * Security Validation Script
 * Tests the security fixes implemented in the application
 */

import { validateInput, containsXSS, containsSQLInjection } from '../src/lib/security.js';

console.log('🔒 Running Security Validation Tests...\n');

// Test cases for XSS detection
const xssTestCases = [
  '<script>alert("xss")</script>',
  'javascript:alert(1)',
  '<img src="x" onerror="alert(1)">',
  '<iframe src="javascript:alert(1)"></iframe>',
  'onload="alert(1)"',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox("XSS")',
  '<object data="javascript:alert(1)">',
  '<embed src="javascript:alert(1)">',
  '<link rel="stylesheet" href="javascript:alert(1)">'
];

// Test cases for SQL injection detection
const sqlTestCases = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "admin'--",
  "1' UNION SELECT * FROM users--",
  "'; INSERT INTO users VALUES ('hacker', 'password'); --",
  "1' AND 1=1--",
  "1' OR 1=1#",
  "'; EXEC xp_cmdshell('dir'); --",
  "1' UNION ALL SELECT NULL,NULL,NULL--",
  "admin' OR '1'='1' /*"
];

// Test cases for safe inputs
const safeTestCases = [
  'hello world',
  'user@example.com',
  'Product Name 123',
  'This is a normal description.',
  'https://example.com/page',
  'Category: Technology',
  'Price: $99.99',
  'Date: 2024-01-01'
];

let passedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${testName}`);
      passedTests++;
    } else {
      console.log(`❌ ${testName}`);
    }
  } catch (error) {
    console.log(`❌ ${testName} - Error: ${error.message}`);
  }
}

console.log('🕵️  Testing XSS Detection...');
xssTestCases.forEach((testCase, index) => {
  runTest(`XSS Test ${index + 1}: Should detect XSS in "${testCase.substring(0, 30)}..."`, () => {
    return containsXSS(testCase);
  });
});

console.log('\n🛡️  Testing SQL Injection Detection...');
sqlTestCases.forEach((testCase, index) => {
  runTest(`SQL Test ${index + 1}: Should detect SQL injection in "${testCase.substring(0, 30)}..."`, () => {
    return containsSQLInjection(testCase);
  });
});

console.log('\n✅ Testing Safe Inputs...');
safeTestCases.forEach((testCase, index) => {
  runTest(`Safe Test ${index + 1}: Should allow safe input "${testCase}"`, () => {
    return !containsXSS(testCase) && !containsSQLInjection(testCase);
  });
});

console.log('\n🧪 Testing Input Validation...');
runTest('Should validate normal input', () => {
  const result = validateInput('Hello World', 100);
  return result.isValid && result.errors.length === 0;
});

runTest('Should reject oversized input', () => {
  const result = validateInput('a'.repeat(1001), 100);
  return !result.isValid && result.errors.some(e => e.includes('maximum length'));
});

runTest('Should reject XSS input', () => {
  const result = validateInput('<script>alert(1)</script>', 100);
  return !result.isValid && result.errors.some(e => e.includes('malicious script'));
});

runTest('Should reject SQL injection input', () => {
  const result = validateInput("'; DROP TABLE users; --", 100);
  return !result.isValid && result.errors.some(e => e.includes('malicious SQL'));
});

runTest('Should sanitize input', () => {
  const result = validateInput('<script>alert(1)</script>', 100);
  return result.sanitized.includes('&lt;script&gt;') && !result.sanitized.includes('<script>');
});

console.log('\n📊 Security Validation Results:');
console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log('\n🎉 All security tests passed! Your application is well protected.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some security tests failed. Please review the implementation.');
  process.exit(1);
}
