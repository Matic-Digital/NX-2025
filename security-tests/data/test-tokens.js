// Test tokens and authentication data for security testing
// Direct JavaScript object to work with k6 imports

export const testData = {
  "description": "Test authentication tokens for security testing",
  "warning": "These are test tokens only - never use real tokens in security tests",
  
  "invalidTokens": [
    "invalid-token-123",
    "expired-token-456", 
    "malformed.jwt.token",
    "",
    "null",
    "undefined",
    "../../etc/passwd",
    "<script>alert('xss')</script>",
    "' OR 1=1 --",
    "Bearer fake-token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature"
  ],
  
  "limitedPreviewToken": "preview-token-limited-scope",
  
  "testContentfulTokens": {
    "validPreview": "test-preview-token",
    "validManagement": "test-management-token",
    "expiredPreview": "expired-preview-token-123",
    "invalidFormat": "not-a-real-token"
  },
  
  "testHubspotTokens": {
    "validApi": "test-hubspot-api-key",
    "invalidApi": "invalid-hubspot-key-123",
    "expiredApi": "expired-hubspot-key-456"
  },
  
  "revalidationSecrets": {
    "valid": "test-revalidation-secret",
    "invalid": "wrong-secret-123",
    "malformed": "../../../secret",
    "injection": "'; DROP TABLE secrets; --"
  },
  
  "testScenarios": {
    "tokenReuse": {
      "description": "Test if tokens can be reused across different contexts",
      "tokens": [
        "reuse-token-1",
        "reuse-token-2"
      ]
    },
    
    "privilegeEscalation": {
      "description": "Test if limited tokens can access admin functions",
      "limitedToken": "limited-access-token",
      "adminEndpoints": [
        "/api/revalidate",
        "/api/admin",
        "/api/management"
      ]
    },
    
    "sessionFixation": {
      "description": "Test session fixation vulnerabilities",
      "fixedSessionId": "fixed-session-123",
      "maliciousSessionId": "malicious-session-456"
    }
  }
};

// Helper functions for token testing
export const tokenHelpers = {
  // Get a random invalid token
  getRandomInvalidToken: () => {
    const tokens = testData.invalidTokens;
    return tokens[Math.floor(Math.random() * tokens.length)];
  },

  // Create malformed JWT token
  createMalformedJWT: () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: 'test', exp: Date.now() / 1000 - 3600 })); // Expired
    return `${header}.${payload}.invalid-signature`;
  },

  // Create token with SQL injection attempt
  createSQLInjectionToken: () => {
    return "'; DROP TABLE users; --";
  },

  // Create XSS attempt token
  createXSSToken: () => {
    return "<script>alert('XSS')</script>";
  },

  // Validate token format (basic check)
  isValidTokenFormat: (token) => {
    if (!token || typeof token !== 'string') return false;
    // Basic JWT format check
    const parts = token.split('.');
    return parts.length === 3;
  },
};

export default testData;
