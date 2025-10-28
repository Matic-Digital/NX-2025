// Business Logic Security Tests
// Tests: T8 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export default function () {
  const baseUrl = config.baseUrl;
  
  // T8: Business Logic Tests
  testBusinessLogicFlaws(baseUrl);
  
  sleep(1); // Rate limiting
}

/**
 * T8: Business Logic Flaws
 * Target: Application workflow and business rules
 * Method: Test workflow bypass, race conditions, business rule circumvention
 */
export function testBusinessLogicFlaws(baseUrl) {
  console.log('🏢 T8: Business Logic Flaw Tests');
  
  // Test 1: Workflow Bypass
  testWorkflowBypass(baseUrl);
  
  // Test 2: Race Conditions
  testRaceConditions(baseUrl);
  
  // Test 3: Business Rule Circumvention
  testBusinessRuleCircumvention(baseUrl);
  
  // Test 4: Rate Limiting Effectiveness
  testRateLimiting(baseUrl);
}

function testWorkflowBypass(baseUrl) {
  console.log('Testing workflow bypass attempts...');
  
  // Test skipping required steps in multi-step processes
  const workflowSteps = [
    { step: 1, endpoint: '/api/checkout/step1', data: { items: ['item1'] } },
    { step: 2, endpoint: '/api/checkout/step2', data: { shipping: 'standard' } },
    { step: 3, endpoint: '/api/checkout/step3', data: { payment: 'card' } },
    { step: 4, endpoint: '/api/checkout/complete', data: { confirm: true } }
  ];
  
  // Try to skip to final step without completing previous steps
  const bypassResponse = http.post(`${baseUrl}${workflowSteps[3].endpoint}`, 
    JSON.stringify(workflowSteps[3].data), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Type': 'workflow-bypass'
    },
    tags: { test: 'T8-workflow-bypass' }
  });
  
  check(bypassResponse, {
    'T8: Workflow bypass prevented': (r) => r.status === 400 || r.status === 403 || r.status === 422,
    'T8: Proper workflow validation': (r) => {
      const body = r.body || '';
      return body.includes('step') || body.includes('required') || body.includes('invalid');
    }
  });
  
  // Test parameter manipulation to skip steps
  const manipulationResponse = http.post(`${baseUrl}/api/checkout/complete`, 
    JSON.stringify({ step: 4, bypass: true, admin: true }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Type': 'parameter-manipulation'
    },
    tags: { test: 'T8-parameter-manipulation' }
  });
  
  check(manipulationResponse, {
    'T8: Parameter manipulation blocked': (r) => r.status !== 200,
    'T8: Admin parameter ignored': (r) => {
      const body = r.body || '';
      return !body.includes('admin') || body.includes('error');
    }
  });
}

function testRaceConditions(baseUrl) {
  console.log('Testing race condition vulnerabilities...');
  
  // Test concurrent requests that could cause race conditions
  const concurrentRequests = [];
  const testData = { action: 'withdraw', amount: 100 };
  
  // Send multiple concurrent requests
  for (let i = 0; i < 5; i++) {
    const request = http.asyncRequest('POST', `${baseUrl}/api/account/transaction`, 
      JSON.stringify(testData), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token',
        'X-Test-Type': 'race-condition',
        'X-Request-ID': i.toString()
      },
      tags: { test: 'T8-race-condition' }
    });
    concurrentRequests.push(request);
  }
  
  // Wait for all requests to complete
  const responses = concurrentRequests.map(req => req.response);
  
  check(responses[0], {
    'T8: Race condition prevented': () => {
      const successfulRequests = responses.filter(r => r && r.status === 200).length;
      // Should not allow all concurrent requests to succeed
      return successfulRequests <= 1;
    },
    'T8: Proper concurrency control': () => {
      const errorResponses = responses.filter(r => r && r.status === 409).length;
      // Should have conflict responses for concurrent requests
      return errorResponses > 0;
    }
  });
}

function testBusinessRuleCircumvention(baseUrl) {
  console.log('Testing business rule circumvention...');
  
  // Test 1: Negative quantity/amount handling
  const negativeAmountResponse = http.post(`${baseUrl}/api/cart/add`, 
    JSON.stringify({ productId: 'item1', quantity: -5 }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Type': 'negative-quantity'
    },
    tags: { test: 'T8-negative-quantity' }
  });
  
  check(negativeAmountResponse, {
    'T8: Negative quantities rejected': (r) => r.status === 400 || r.status === 422,
    'T8: Proper validation message': (r) => {
      const body = r.body || '';
      return body.includes('quantity') || body.includes('invalid') || body.includes('positive');
    }
  });
  
  // Test 2: Price manipulation
  const priceManipulationResponse = http.post(`${baseUrl}/api/checkout/calculate`, 
    JSON.stringify({ 
      items: [{ id: 'item1', price: 0.01, originalPrice: 99.99 }] 
    }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Type': 'price-manipulation'
    },
    tags: { test: 'T8-price-manipulation' }
  });
  
  check(priceManipulationResponse, {
    'T8: Price manipulation prevented': (r) => {
      if (r.status === 200) {
        const body = r.body || '';
        // Should use server-side pricing, not client-provided prices
        return !body.includes('0.01') || body.includes('99.99');
      }
      return r.status === 400 || r.status === 422;
    }
  });
  
  // Test 3: Discount/coupon abuse
  const discountAbuseResponse = http.post(`${baseUrl}/api/checkout/apply-coupon`, 
    JSON.stringify({ 
      coupon: 'SAVE50',
      applyMultiple: true,
      discount: 100 
    }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Type': 'discount-abuse'
    },
    tags: { test: 'T8-discount-abuse' }
  });
  
  check(discountAbuseResponse, {
    'T8: Discount abuse prevented': (r) => {
      const body = r.body || '';
      // Should not allow 100% discount or multiple coupon applications
      return !body.includes('100%') && !body.includes('total: 0');
    }
  });
}

function testRateLimiting(baseUrl) {
  console.log('Testing rate limiting effectiveness...');
  
  // Test API rate limiting
  const responses = [];
  
  // Send rapid requests to test rate limiting
  for (let i = 0; i < 20; i++) {
    const response = http.get(`${baseUrl}/api/search?q=test${i}`, {
      headers: {
        'X-Test-Type': 'rate-limiting',
        'X-Request-Number': i.toString()
      },
      tags: { test: 'T8-rate-limiting' }
    });
    responses.push(response);
    
    // Very short delay to simulate rapid requests
    sleep(0.1);
  }
  
  const rateLimitedResponses = responses.filter(r => r.status === 429).length;
  const successfulResponses = responses.filter(r => r.status === 200).length;
  
  check(responses[0], {
    'T8: Rate limiting active': () => rateLimitedResponses > 0,
    'T8: Some requests allowed': () => successfulResponses > 0,
    'T8: Proper rate limit headers': () => {
      const rateLimitedResponse = responses.find(r => r.status === 429);
      if (rateLimitedResponse) {
        const headers = rateLimitedResponse.headers || {};
        return headers['retry-after'] || headers['x-ratelimit-remaining'];
      }
      return true; // If no rate limiting, that's also valid
    }
  });
  
  // Test login attempt rate limiting
  const loginAttempts = [];
  
  for (let i = 0; i < 10; i++) {
    const loginResponse = http.post(`${baseUrl}/api/auth/login`, 
      JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }), {
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Type': 'login-rate-limiting'
      },
      tags: { test: 'T8-login-rate-limiting' }
    });
    loginAttempts.push(loginResponse);
    sleep(0.2);
  }
  
  const blockedLogins = loginAttempts.filter(r => r.status === 429 || r.status === 423).length;
  
  check(loginAttempts[0], {
    'T8: Login rate limiting enforced': () => blockedLogins > 0,
    'T8: Account lockout mechanism': () => {
      const lockedResponse = loginAttempts.find(r => r.status === 423);
      if (lockedResponse) {
        const body = lockedResponse.body || '';
        return body.includes('locked') || body.includes('blocked');
      }
      return true;
    }
  });
}

export { testBusinessLogicFlaws };
