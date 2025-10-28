// k6 Security Testing Configuration
// Target: localhost only - NEVER target Vercel infrastructure

export const config = {
  // Base configuration
  baseUrl: 'http://localhost:3000',
  
  // Test execution options
  options: {
    // Security testing - moderate load
    security: {
      stages: [
        { duration: '30s', target: 5 },   // Ramp up
        { duration: '2m', target: 10 },   // Steady state
        { duration: '30s', target: 0 },   // Ramp down
      ],
      thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
        http_req_failed: ['rate<0.05'],    // Less than 5% failures
      },
    },
    
    // Performance testing - higher load
    performance: {
      stages: [
        { duration: '1m', target: 10 },   // Warm up
        { duration: '2m', target: 25 },   // Load test
        { duration: '2m', target: 50 },   // Stress test
        { duration: '1m', target: 100 },  // Peak load
        { duration: '2m', target: 0 },    // Cool down
      ],
      thresholds: {
        http_req_duration: ['p(95)<3000'], // 95% under 3s
        http_req_failed: ['rate<0.1'],     // Less than 10% failures
        http_reqs: ['rate>50'],            // At least 50 req/s
      },
    },
    
    // Geographic simulation - light load
    geographic: {
      stages: [
        { duration: '30s', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '30s', target: 0 },
      ],
      thresholds: {
        http_req_duration: ['p(95)<5000'], // Allow for simulated latency
        http_req_failed: ['rate<0.05'],
      },
    },
  },
  
  // Test timeouts
  timeouts: {
    request: '30s',
    scenario: '10m',
  },
  
  // Rate limiting to avoid overwhelming localhost
  rps: 100, // Max 100 requests per second
  
  // User agent for testing
  userAgent: 'k6-security-test/1.0',
  
  // Test environment validation
  validateEnvironment: () => {
    if (!config.baseUrl.includes('localhost') && !config.baseUrl.includes('127.0.0.1')) {
      throw new Error('SECURITY: Tests must only target localhost!');
    }
    if (config.baseUrl.includes('vercel.app') || config.baseUrl.includes('production')) {
      throw new Error('SECURITY: Never target Vercel or production URLs!');
    }
  },
};

// Environment-specific overrides
export const environments = {
  development: {
    baseUrl: 'http://localhost:3000',
  },
  
  // NOTE: Never add production or Vercel URLs here
  // This is intentionally limited to localhost only
};

export default config;
