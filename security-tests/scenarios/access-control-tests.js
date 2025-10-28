// Access Control Security Tests
// Tests: T6 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export default function () {
  const baseUrl = config.baseUrl;
  
  // T6: Access Control Tests
  testAccessControl(baseUrl);
  
  sleep(1); // Rate limiting
}

/**
 * T6: Access Control
 * Target: Authorization mechanisms
 * Method: Test privilege escalation and direct object references
 */
export function testAccessControl(baseUrl) {
  console.log('🔒 T6: Access Control Tests');
  
  // Test 1: Horizontal Privilege Escalation
  testHorizontalPrivilegeEscalation(baseUrl);
  
  // Test 2: Vertical Privilege Escalation
  testVerticalPrivilegeEscalation(baseUrl);
  
  // Test 3: Direct Object Reference
  testDirectObjectReference(baseUrl);
  
  // Test 4: Role-Based Access Control
  testRoleBasedAccess(baseUrl);
}

function testHorizontalPrivilegeEscalation(baseUrl) {
  console.log('Testing horizontal privilege escalation...');
  
  // Attempt to access another user's data
  const userIds = ['user1', 'user2', 'admin', '123', '999'];
  
  userIds.forEach(userId => {
    const response = http.get(`${baseUrl}/api/user/${userId}/profile`, {
      headers: {
        'Authorization': 'Bearer fake_user_token',
        'X-Test-Type': 'horizontal-privilege-escalation',
        'X-Target-User': userId
      },
      tags: { test: 'T6-horizontal-escalation' }
    });
    
    check(response, {
      'T6: Horizontal escalation blocked': (r) => r.status === 401 || r.status === 403,
      'T6: No sensitive data leaked': (r) => {
        const body = r.body || '';
        return !body.includes('email') && !body.includes('password') && !body.includes('token');
      }
    });
  });
}

function testVerticalPrivilegeEscalation(baseUrl) {
  console.log('Testing vertical privilege escalation...');
  
  // Attempt to access admin endpoints with regular user token
  const adminEndpoints = [
    '/api/admin/users',
    '/api/admin/settings',
    '/api/admin/logs',
    '/api/admin/system',
    '/api/admin/backup'
  ];
  
  adminEndpoints.forEach(endpoint => {
    const response = http.get(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer regular_user_token',
        'X-Test-Type': 'vertical-privilege-escalation'
      },
      tags: { test: 'T6-vertical-escalation' }
    });
    
    check(response, {
      'T6: Admin endpoint access denied': (r) => r.status === 401 || r.status === 403,
      'T6: No admin data exposed': (r) => {
        const body = r.body || '';
        return !body.includes('admin') && !body.includes('system') && !body.includes('config');
      }
    });
  });
}

function testDirectObjectReference(baseUrl) {
  console.log('Testing direct object reference attacks...');
  
  // Test direct access to objects by ID manipulation
  const objectIds = ['1', '2', '100', '999', '../admin', 'null', 'undefined'];
  const endpoints = [
    '/api/documents/',
    '/api/files/',
    '/api/reports/',
    '/api/content/'
  ];
  
  endpoints.forEach(endpoint => {
    objectIds.forEach(id => {
      const response = http.get(`${baseUrl}${endpoint}${id}`, {
        headers: {
          'Authorization': 'Bearer test_token',
          'X-Test-Type': 'direct-object-reference',
          'X-Object-ID': id
        },
        tags: { test: 'T6-direct-object-reference' }
      });
      
      check(response, {
        'T6: Direct object access controlled': (r) => {
          // Should either be authorized (200) or properly denied (401/403/404)
          return [200, 401, 403, 404].includes(r.status);
        },
        'T6: No unauthorized data access': (r) => {
          if (r.status === 200) {
            // If access is allowed, ensure it's legitimate
            const body = r.body || '';
            return !body.includes('unauthorized') && !body.includes('error');
          }
          return true;
        }
      });
    });
  });
}

function testRoleBasedAccess(baseUrl) {
  console.log('Testing role-based access control...');
  
  // Test different role scenarios
  const roleTests = [
    { role: 'guest', token: 'guest_token', expectedStatus: [401, 403] },
    { role: 'user', token: 'user_token', expectedStatus: [200, 401, 403] },
    { role: 'admin', token: 'admin_token', expectedStatus: [200] }
  ];
  
  const protectedEndpoints = [
    '/api/user/profile',
    '/api/user/settings',
    '/api/content/create',
    '/api/admin/users'
  ];
  
  roleTests.forEach(roleTest => {
    protectedEndpoints.forEach(endpoint => {
      const response = http.get(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${roleTest.token}`,
          'X-Test-Type': 'role-based-access',
          'X-User-Role': roleTest.role
        },
        tags: { test: 'T6-role-based-access' }
      });
      
      check(response, {
        [`T6: ${roleTest.role} role access properly controlled`]: (r) => {
          return roleTest.expectedStatus.includes(r.status);
        },
        'T6: Consistent error responses': (r) => {
          if ([401, 403].includes(r.status)) {
            const body = r.body || '';
            return body.includes('unauthorized') || body.includes('forbidden') || body.includes('access denied');
          }
          return true;
        }
      });
    });
  });
}

export { testAccessControl };
