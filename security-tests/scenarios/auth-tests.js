// Authentication & Authorization Security Tests
// Tests: T1, T4 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';
import { testData } from '../data/test-tokens.js';

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export default function () {
  const baseUrl = config.baseUrl;
  
  // T1: API Authentication Bypass Tests
  testApiAuthenticationBypass(baseUrl);
  
  // T4: Content Preview Token Abuse Tests  
  testPreviewTokenAbuse(baseUrl);
  
  sleep(1); // Rate limiting
}

/**
 * T1: API Authentication Bypass
 * Target: All /api/* endpoints
 * Method: Send requests without required tokens/secrets
 * Expected: 401/403 responses with no data leakage
 */
function testApiAuthenticationBypass(baseUrl) {
  console.log('Running T1: API Authentication Bypass Tests');
  
  // Test revalidate endpoint without secret
  const revalidateResponse = http.post(`${baseUrl}${endpoints.api.revalidate}`, 
    JSON.stringify({ test: 'unauthorized' }), 
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test: 'T1-revalidate-no-auth' },
    }
  );
  
  check(revalidateResponse, {
    'T1: Revalidate returns 401 without auth': (r) => r.status === 401,
    'T1: Revalidate no sensitive data in error': (r) => 
      !r.body.includes('secret') && 
      !r.body.includes('token') && 
      !r.body.includes('key'),
    'T1: Revalidate proper error message': (r) => 
      r.json('message') === 'Invalid token',
  });

  // Test HubSpot endpoints without authentication
  const hubspotResponse = http.get(`${baseUrl}${endpoints.dynamic.hubspotFormById('test-form')}`, {
    tags: { test: 'T1-hubspot-no-auth' },
  });
  
  check(hubspotResponse, {
    'T1: HubSpot endpoint handles missing auth': (r) => 
      r.status === 401 || r.status === 403 || r.status === 400,
    'T1: HubSpot no API key exposure': (r) => 
      !r.body.toLowerCase().includes('api') ||
      !r.body.toLowerCase().includes('key'),
  });

  // Test enable-draft endpoints without proper tokens
  const draftResponse = http.post(`${baseUrl}${endpoints.dynamic.enableDraftByType('page')}`, 
    JSON.stringify({ id: 'test-id' }), 
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test: 'T1-draft-no-auth' },
    }
  );
  
  check(draftResponse, {
    'T1: Draft endpoint requires auth': (r) => 
      r.status === 401 || r.status === 403,
    'T1: Draft endpoint no token leakage': (r) => 
      !r.body.includes('preview') && 
      !r.body.includes('access_token'),
  });
}

/**
 * T4: Content Preview Token Abuse
 * Target: Preview mode endpoints
 * Method: Test token reuse, privilege escalation, unauthorized access
 * Expected: Proper token validation and scope limitation
 */
function testPreviewTokenAbuse(baseUrl) {
  console.log('Running T4: Content Preview Token Abuse Tests');
  
  // Test with invalid preview tokens
  const invalidTokens = testData.invalidTokens;
  
  invalidTokens.forEach((token, index) => {
    const previewResponse = http.get(`${baseUrl}${endpoints.api.preview}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      tags: { test: `T4-invalid-token-${index}` },
    });
    
    check(previewResponse, {
      [`T4: Invalid token ${index} rejected`]: (r) => 
        r.status === 401 || r.status === 403,
      [`T4: Invalid token ${index} no content leak`]: (r) => 
        !r.body.includes('draft') && 
        !r.body.includes('preview'),
    });
  });

  // Test token privilege escalation
  const limitedToken = testData.limitedPreviewToken;
  if (limitedToken) {
    const escalationResponse = http.post(`${baseUrl}${endpoints.api.revalidate}`, 
      JSON.stringify({ path: '/' }), 
      {
        headers: {
          'Authorization': `Bearer ${limitedToken}`,
          'Content-Type': 'application/json',
        },
        tags: { test: 'T4-privilege-escalation' },
      }
    );
    
    check(escalationResponse, {
      'T4: Preview token cannot revalidate': (r) => 
        r.status === 401 || r.status === 403,
      'T4: No privilege escalation': (r) => 
        !r.json('revalidated'),
    });
  }

  // Test preview session isolation
  const previewSessionResponse = http.get(`${baseUrl}${endpoints.api.preview}?slug=test`, {
    headers: {
      'Cookie': 'invalid-preview-session=malicious-value',
    },
    tags: { test: 'T4-session-isolation' },
  });
  
  check(previewSessionResponse, {
    'T4: Invalid preview session handled': (r) => 
      r.status !== 500, // Should not crash
    'T4: Session isolation maintained': (r) => 
      !r.body.includes('malicious-value'),
  });
}

// Export individual test functions for modular testing
export { testApiAuthenticationBypass, testPreviewTokenAbuse };
