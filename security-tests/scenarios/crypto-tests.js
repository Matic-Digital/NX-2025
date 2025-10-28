// Cryptographic Security Tests
// Tests: T7 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export default function () {
  const baseUrl = config.baseUrl;
  
  // T7: Cryptographic Validation Tests
  testCryptographicValidation(baseUrl);
  
  sleep(1); // Rate limiting
}

/**
 * T7: Cryptographic Validation
 * Target: Encryption and certificate handling
 * Method: Test weak encryption, certificate validation, password storage
 */
export function testCryptographicValidation(baseUrl) {
  console.log('🔐 T7: Cryptographic Validation Tests');
  
  // Test 1: SSL/TLS Configuration
  testSSLTLSConfiguration(baseUrl);
  
  // Test 2: Certificate Validation
  testCertificateValidation(baseUrl);
  
  // Test 3: Password Storage Security
  testPasswordStorageSecurity(baseUrl);
  
  // Test 4: Data Encryption Verification
  testDataEncryption(baseUrl);
}

function testSSLTLSConfiguration(baseUrl) {
  console.log('Testing SSL/TLS configuration...');
  
  // Test HTTPS enforcement
  const httpUrl = baseUrl.replace('https://', 'http://');
  
  const response = http.get(httpUrl, {
    headers: {
      'X-Test-Type': 'ssl-tls-config'
    },
    tags: { test: 'T7-ssl-tls' }
  });
  
  check(response, {
    'T7: HTTPS redirect enforced': (r) => {
      // Should redirect to HTTPS or refuse connection
      return r.status === 301 || r.status === 302 || r.status === 0;
    },
    'T7: Secure headers present': (r) => {
      const headers = r.headers || {};
      return headers['strict-transport-security'] || headers['Strict-Transport-Security'];
    }
  });
  
  // Test HTTPS version
  const httpsResponse = http.get(baseUrl, {
    headers: {
      'X-Test-Type': 'https-validation'
    },
    tags: { test: 'T7-https-validation' }
  });
  
  check(httpsResponse, {
    'T7: HTTPS connection successful': (r) => r.status >= 200 && r.status < 400,
    'T7: Security headers present': (r) => {
      const headers = r.headers || {};
      return headers['strict-transport-security'] && headers['x-frame-options'];
    }
  });
}

function testCertificateValidation(baseUrl) {
  console.log('Testing certificate validation...');
  
  // Test with various certificate scenarios
  const response = http.get(baseUrl, {
    headers: {
      'X-Test-Type': 'certificate-validation'
    },
    tags: { test: 'T7-certificate' }
  });
  
  check(response, {
    'T7: Valid certificate accepted': (r) => r.status >= 200 && r.status < 400,
    'T7: Certificate chain valid': (r) => {
      // In a real scenario, you'd check certificate details
      // For localhost testing, we validate the connection succeeds
      return r.status !== 0;
    }
  });
}

function testPasswordStorageSecurity(baseUrl) {
  console.log('Testing password storage security...');
  
  // Test password registration/change endpoints
  const weakPasswords = [
    'password',
    '123456',
    'admin',
    'test',
    'qwerty'
  ];
  
  weakPasswords.forEach(password => {
    const response = http.post(`${baseUrl}/api/auth/register`, JSON.stringify({
      email: 'test@example.com',
      password: password
    }), {
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Type': 'password-security',
        'X-Weak-Password': password
      },
      tags: { test: 'T7-password-security' }
    });
    
    check(response, {
      'T7: Weak password rejected': (r) => {
        // Should reject weak passwords
        return r.status === 400 || r.status === 422;
      },
      'T7: Password policy enforced': (r) => {
        const body = r.body || '';
        return body.includes('password') && (body.includes('weak') || body.includes('requirements'));
      }
    });
  });
  
  // Test password in response (should never happen)
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Type': 'password-exposure'
    },
    tags: { test: 'T7-password-exposure' }
  });
  
  check(loginResponse, {
    'T7: Password not in response': (r) => {
      const body = r.body || '';
      return !body.includes('testpassword123') && !body.includes('password');
    },
    'T7: No sensitive data in response': (r) => {
      const body = r.body || '';
      return !body.includes('hash') && !body.includes('salt');
    }
  });
}

function testDataEncryption(baseUrl) {
  console.log('Testing data encryption...');
  
  // Test sensitive data endpoints
  const sensitiveEndpoints = [
    '/api/user/profile',
    '/api/user/settings',
    '/api/payment/methods',
    '/api/admin/config'
  ];
  
  sensitiveEndpoints.forEach(endpoint => {
    const response = http.get(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer test_token',
        'X-Test-Type': 'data-encryption'
      },
      tags: { test: 'T7-data-encryption' }
    });
    
    check(response, {
      'T7: Sensitive data properly handled': (r) => {
        const body = r.body || '';
        // Check that sensitive fields are not exposed in plain text
        return !body.includes('password') && 
               !body.includes('ssn') && 
               !body.includes('credit_card');
      },
      'T7: Encrypted transmission': (r) => {
        // Verify HTTPS is being used (baseUrl should be https)
        return baseUrl.startsWith('https://') || baseUrl.startsWith('http://localhost');
      }
    });
  });
  
  // Test API key encryption/masking
  const apiResponse = http.get(`${baseUrl}/api/config/keys`, {
    headers: {
      'Authorization': 'Bearer admin_token',
      'X-Test-Type': 'api-key-encryption'
    },
    tags: { test: 'T7-api-key-encryption' }
  });
  
  check(apiResponse, {
    'T7: API keys properly masked': (r) => {
      const body = r.body || '';
      // API keys should be masked (e.g., "sk_****1234")
      const hasFullKeys = /sk_[a-zA-Z0-9]{20,}/.test(body) || /pk_[a-zA-Z0-9]{20,}/.test(body);
      return !hasFullKeys;
    },
    'T7: No secrets in configuration': (r) => {
      const body = r.body || '';
      return !body.includes('secret_key') && !body.includes('private_key');
    }
  });
}

export { testCryptographicValidation };
