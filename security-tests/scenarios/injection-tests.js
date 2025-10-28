// Input Validation & Injection Security Tests
// Tests: T2, T5, T10 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';
// Import malicious inputs as JavaScript object since k6 can't import JSON
const maliciousInputs = {
  "xssPayloads": [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "';alert('XSS');//",
    "\"><script>alert('XSS')</script>",
    "<iframe src=javascript:alert('XSS')></iframe>",
    "<body onload=alert('XSS')>",
    "<input onfocus=alert('XSS') autofocus>",
    "<<SCRIPT>alert('XSS')<</SCRIPT>"
  ],
  
  "sqlInjectionPayloads": [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "admin'/*",
    "' OR 1=1#",
    "' OR 'a'='a",
    "') OR ('1'='1",
    "' OR 1=1 LIMIT 1 --",
    "1' AND (SELECT COUNT(*) FROM users) > 0 --"
  ],
  
  "bufferOverflowPayloads": [
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  ],
  
  "formFieldPayloads": {
    "email": [
      "test@test.com<script>alert('XSS')</script>",
      "'; DROP TABLE users; --@test.com",
      "test+<script>@test.com",
      "../../../etc/passwd@test.com",
      "test@test.com\r\nBcc: admin@company.com"
    ],
    "name": [
      "<script>alert('XSS')</script>",
      "'; DROP TABLE users; --",
      "../../../etc/passwd",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "Robert'); DROP TABLE students; --"
    ],
    "message": [
      "<iframe src=javascript:alert('XSS')></iframe>",
      "'; UPDATE users SET password='hacked' WHERE id=1; --",
      "{{7*7}}",
      "${7*7}",
      "<%=7*7%>"
    ]
  }
};

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export default function () {
  const baseUrl = config.baseUrl;
  
  // T2: HubSpot API Key Exposure Tests
  testHubSpotAPIKeySecurity(baseUrl);
  
  // T5: Form Submission Validation Tests
  testFormSubmissionSecurity(baseUrl);
  
  // T10: Content Security Policy Tests
  testCSPBypass(baseUrl);
  
  sleep(1); // Rate limiting
}

/**
 * T2: HubSpot API Key Exposure
 * Target: /api/hubspot/form/[formId] and submit endpoints
 * Method: Analyze response headers and body for API keys
 * Expected: No API keys in client-accessible responses
 */
function testHubSpotAPIKeySecurity(baseUrl) {
  console.log('Running T2: HubSpot API Key Exposure Tests');
  
  // Test HubSpot form endpoint for API key leakage
  const formResponse = http.get(`${baseUrl}${endpoints.dynamic.hubspotFormById('test-form-id')}`, {
    tags: { test: 'T2-hubspot-form-api-key' },
  });
  
  check(formResponse, {
    'T2: No API key in response body': (r) => {
      const body = r.body.toLowerCase();
      return !body.includes('api_key') && 
             !body.includes('apikey') && 
             !body.includes('bearer') &&
             !body.includes('authorization');
    },
    'T2: No API key in response headers': (r) => {
      const headers = JSON.stringify(r.headers).toLowerCase();
      return !headers.includes('api_key') && 
             !headers.includes('apikey') &&
             !headers.includes('bearer');
    },
    'T2: No sensitive tokens exposed': (r) => {
      const body = r.body.toLowerCase();
      return !body.includes('token') || 
             !body.includes('secret') ||
             !body.includes('key');
    },
  });

  // Test HubSpot form submission with malicious payloads
  const maliciousFormData = {
    email: maliciousInputs.formFieldPayloads.email[0],
    name: maliciousInputs.xssPayloads[0],
    message: maliciousInputs.sqlInjectionPayloads[0],
  };

  const submitResponse = http.post(
    `${baseUrl}${endpoints.dynamic.hubspotSubmitById('test-form-id')}`,
    JSON.stringify(maliciousFormData),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test: 'T2-hubspot-submit-malicious' },
    }
  );

  check(submitResponse, {
    'T2: Malicious form data handled safely': (r) => 
      r.status !== 500, // Should not crash
    'T2: No API key leaked in error response': (r) => {
      const body = r.body.toLowerCase();
      return !body.includes('api_key') && !body.includes('bearer');
    },
  });
}

/**
 * T5: Form Submission Validation
 * Target: /api/hubspot/form/[formId]/submit
 * Method: Submit malicious payloads, oversized data, invalid formats
 * Expected: Proper input sanitization and validation
 */
function testFormSubmissionSecurity(baseUrl) {
  console.log('Running T5: Form Submission Validation Tests');
  
  // Test XSS payloads in form fields
  maliciousInputs.xssPayloads.forEach((payload, index) => {
    const xssFormData = {
      email: `test${index}@test.com`,
      name: payload,
      message: `Test message ${index}`,
    };

    const xssResponse = http.post(
      `${baseUrl}${endpoints.dynamic.hubspotSubmitById('test-form')}`,
      JSON.stringify(xssFormData),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { test: `T5-xss-payload-${index}` },
      }
    );

    check(xssResponse, {
      [`T5: XSS payload ${index} sanitized`]: (r) => {
        const body = r.body;
        return !body.includes('<script>') && 
               !body.includes('javascript:') &&
               !body.includes('onerror=');
      },
      [`T5: XSS payload ${index} not executed`]: (r) => 
        r.status !== 500 && !r.body.includes('alert('),
    });
  });

  // Test SQL injection payloads
  maliciousInputs.sqlInjectionPayloads.forEach((payload, index) => {
    const sqlFormData = {
      email: `test${index}@test.com`,
      name: `Test User ${index}`,
      message: payload,
    };

    const sqlResponse = http.post(
      `${baseUrl}${endpoints.dynamic.hubspotSubmitById('test-form')}`,
      JSON.stringify(sqlFormData),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { test: `T5-sql-payload-${index}` },
      }
    );

    check(sqlResponse, {
      [`T5: SQL injection ${index} prevented`]: (r) => 
        r.status !== 500 && !r.body.includes('SQL') && !r.body.includes('database'),
      [`T5: SQL injection ${index} no data leak`]: (r) => 
        !r.body.includes('users') && !r.body.includes('table'),
    });
  });

  // Test oversized payloads
  const oversizedData = {
    email: 'test@test.com',
    name: maliciousInputs.bufferOverflowPayloads[1], // Large payload
    message: 'Test message',
  };

  const oversizedResponse = http.post(
    `${baseUrl}${endpoints.dynamic.hubspotSubmitById('test-form')}`,
    JSON.stringify(oversizedData),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test: 'T5-oversized-payload' },
    }
  );

  check(oversizedResponse, {
    'T5: Oversized payload handled': (r) => 
      r.status === 400 || r.status === 413 || r.status === 422,
    'T5: Oversized payload no crash': (r) => 
      r.status !== 500,
  });

  // Test malformed JSON
  const malformedResponse = http.post(
    `${baseUrl}${endpoints.dynamic.hubspotSubmitById('test-form')}`,
    '{"malformed": json}', // Invalid JSON
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test: 'T5-malformed-json' },
    }
  );

  check(malformedResponse, {
    'T5: Malformed JSON handled': (r) => 
      r.status === 400 || r.status === 422,
    'T5: Malformed JSON no crash': (r) => 
      r.status !== 500,
  });
}

/**
 * T10: Content Security Policy Bypass
 * Target: All pages with dynamic content
 * Method: Test inline script injection, external resource loading
 * Expected: Proper CSP enforcement
 */
function testCSPBypass(baseUrl) {
  console.log('Running T10: Content Security Policy Tests');
  
  // Test CSP headers on main pages
  const pages = [
    endpoints.pages.home,
    endpoints.pages.company,
    endpoints.pages.companyLatinAmerica,
  ];

  pages.forEach((page) => {
    const pageResponse = http.get(`${baseUrl}${page}`, {
      tags: { test: `T10-csp-${page.replace('/', '-')}` },
    });

    check(pageResponse, {
      [`T10: CSP header present on ${page}`]: (r) => 
        r.headers['Content-Security-Policy'] || r.headers['content-security-policy'],
      [`T10: X-Frame-Options header on ${page}`]: (r) => 
        r.headers['X-Frame-Options'] || r.headers['x-frame-options'],
      [`T10: X-Content-Type-Options header on ${page}`]: (r) => 
        r.headers['X-Content-Type-Options'] || r.headers['x-content-type-options'],
    });
  });

  // Test XSS via query parameters
  maliciousInputs.xssPayloads.slice(0, 3).forEach((payload, index) => {
    const xssUrl = `${baseUrl}${endpoints.pages.home}?search=${encodeURIComponent(payload)}`;
    
    const xssResponse = http.get(xssUrl, {
      tags: { test: `T10-xss-query-${index}` },
    });

    check(xssResponse, {
      [`T10: XSS via query param ${index} blocked`]: (r) => {
        const body = r.body;
        return !body.includes('<script>') && 
               !body.includes('javascript:') &&
               !body.includes(payload);
      },
    });
  });

  // Test inline script injection via headers
  const inlineScriptResponse = http.get(`${baseUrl}${endpoints.pages.home}`, {
    headers: {
      'X-Forwarded-For': '<script>alert("XSS")</script>',
      'User-Agent': 'Mozilla/5.0 <script>alert("XSS")</script>',
    },
    tags: { test: 'T10-inline-script-headers' },
  });

  check(inlineScriptResponse, {
    'T10: Inline script via headers blocked': (r) => 
      !r.body.includes('<script>') && !r.body.includes('alert('),
  });
}

// Export individual test functions for modular testing
export { testHubSpotAPIKeySecurity, testFormSubmissionSecurity, testCSPBypass };
