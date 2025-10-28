// Main Security Test Suite Runner
// Executes all security and performance tests according to the protocol

import { check } from 'k6';
import { config } from './config/test-config.js';
import { endpoints } from './config/endpoints.js';

// Import test scenarios
import { 
  testApiAuthenticationBypass, 
  testPreviewTokenAbuse 
} from './scenarios/auth-tests.js';

import { 
  testHubSpotAPIKeySecurity, 
  testFormSubmissionSecurity, 
  testCSPBypass 
} from './scenarios/injection-tests.js';

import { 
  testAPIPerformance, 
  testContentRenderingPerformance, 
  testGeographicPerformance, 
  testResourceUsage 
} from './scenarios/performance-tests.js';

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.security;

export function setup() {
  console.log('🔒 Starting Nextracker Security Test Suite');
  console.log('📋 Protocol: Application Security Assessment using k6');
  console.log('🎯 Target: localhost only (NO Vercel testing)');
  console.log('⏱️  Duration: Security testing with moderate load');
  console.log('');
  
  // Verify localhost connectivity
  const baseUrl = config.baseUrl;
  console.log(`🌐 Testing connectivity to: ${baseUrl}`);
  
  return { baseUrl };
}

export default function (data) {
  const { baseUrl } = data;
  
  // Phase 1: Authentication & Authorization Tests (T1, T4)
  console.log('📊 Phase 1: Authentication & Authorization Security');
  testApiAuthenticationBypass(baseUrl);
  testPreviewTokenAbuse(baseUrl);
  
  // Phase 2: Input Validation & Injection Tests (T2, T5, T10)
  console.log('📊 Phase 2: Input Validation & Injection Security');
  testHubSpotAPIKeySecurity(baseUrl);
  testFormSubmissionSecurity(baseUrl);
  testCSPBypass(baseUrl);
  
  // Phase 3: Performance Testing (P1-P4)
  console.log('📊 Phase 3: Application Performance Testing');
  testAPIPerformance(baseUrl);
  testContentRenderingPerformance(baseUrl);
  testGeographicPerformance(baseUrl);
  testResourceUsage(baseUrl);
}

export function teardown(data) {
  console.log('');
  console.log('✅ Security Test Suite Completed');
  console.log('📊 Check the results above for any security issues');
  console.log('📋 Review failed checks and address vulnerabilities');
  console.log('🔒 Remember: This tested localhost only, not production');
}
