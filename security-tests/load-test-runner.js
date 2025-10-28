// Load Test Runner - Configurable load testing with different profiles
// Usage: k6 run -e LOAD_PROFILE=noLoad security-tests/load-test-runner.js

import http from 'k6/http';
import { check } from 'k6';
import { config } from './config/test-config.js';
import { endpoints } from './config/endpoints.js';
import { getSelectedProfile, listProfiles } from './config/load-profiles.js';

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

// Import new security test scenarios
import { testSessionManagement } from './scenarios/session-tests.js';
import { testAccessControl } from './scenarios/access-control-tests.js';
import { testCryptographicValidation } from './scenarios/crypto-tests.js';
import { testBusinessLogicFlaws } from './scenarios/business-logic-tests.js';
import { testFileUploadSecurity } from './scenarios/file-upload-tests.js';

// Get the selected load profile
const selectedProfile = getSelectedProfile();

// Configure k6 options with the selected profile
export const options = {
  stages: selectedProfile.stages,
  thresholds: selectedProfile.thresholds,
  
  // Additional k6 options
  discardResponseBodies: false, // Keep response bodies for security validation
  maxRedirects: 4,
  batch: 10,
  batchPerHost: 5,
  
  // Tags for better reporting
  tags: {
    testType: 'security-load',
    profile: __ENV.LOAD_PROFILE || 'baseLoad'
  }
};

// Validate environment before running tests
config.validateEnvironment();

// Display test configuration
console.log(`🚀 Starting Security Load Tests`);
console.log(`📊 Load Profile: ${__ENV.LOAD_PROFILE || 'baseLoad'}`);
console.log(`📝 Description: ${selectedProfile.description}`);
console.log(`👥 Max Users: ${Math.max(...selectedProfile.stages.map(s => s.target))}`);
console.log(`⏱️  Total Duration: ${selectedProfile.stages.reduce((sum, stage) => {
  const duration = stage.duration;
  const minutes = duration.includes('m') ? parseInt(duration) : 0;
  const seconds = duration.includes('s') ? parseInt(duration.split('s')[0].split('m')[1] || duration) : 0;
  return sum + minutes * 60 + seconds;
}, 0)}s`);

export default function() {
  const baseUrl = config.baseUrl;
  const currentProfile = __ENV.LOAD_PROFILE || 'baseLoad';
  
  // Phase 1: Authentication & Authorization Security
  console.log('📊 Phase 1: Authentication & Authorization Security');
  
  console.log('Running T1: API Authentication Bypass Tests');
  testApiAuthenticationBypass(baseUrl);
  
  console.log('Running T3: Session Management Tests');
  testSessionManagement(baseUrl);
  
  console.log('Running T4: Content Preview Token Abuse Tests');
  testPreviewTokenAbuse(baseUrl);
  
  // Phase 2: Access Control & Authorization
  console.log('📊 Phase 2: Access Control & Authorization');
  
  console.log('Running T6: Access Control Tests');
  testAccessControl(baseUrl);
  
  // Phase 3: Input Validation & Injection Security
  console.log('📊 Phase 3: Input Validation & Injection Security');
  
  console.log('Running T2: HubSpot API Key Exposure Tests');
  testHubSpotAPIKeySecurity(baseUrl);
  
  console.log('Running T5: Form Submission Validation Tests');
  testFormSubmissionSecurity(baseUrl);
  
  console.log('Running T10: Content Security Policy Tests');
  testCSPBypass(baseUrl);
  
  // Phase 4: Cryptographic & File Security (Reduced under high load)
  if (currentProfile === 'noLoad' || currentProfile === 'baseLoad' || currentProfile === 'soakLoad') {
    console.log('📊 Phase 4: Cryptographic & File Security');
    
    console.log('Running T7: Cryptographic Validation Tests');
    testCryptographicValidation(baseUrl);
    
    console.log('Running T9: File Upload Security Tests');
    testFileUploadSecurity(baseUrl);
  }
  
  // Phase 5: Business Logic Security
  console.log('📊 Phase 5: Business Logic Security');
  
  if (currentProfile === 'spikeLoad') {
    console.log('Running T8: Business Logic Tests (Critical Only)');
    // Only run critical business logic tests under spike load
  } else {
    console.log('Running T8: Business Logic Tests (Full Suite)');
  }
  testBusinessLogicFlaws(baseUrl);
  
  // Phase 6: Performance Under Load (adjusted based on profile)
  if (currentProfile === 'noLoad') {
    // Skip intensive performance tests for no-load profile
    console.log('📊 Phase 6: Basic Performance Validation (No Load)');
    // Just test basic API responsiveness
    testAPIPerformance(baseUrl);
  } else {
    console.log('📊 Phase 6: Performance & Load Testing');
    testAPIPerformance(baseUrl);
    testContentRenderingPerformance(baseUrl);
    
    if (currentProfile === 'peakLoad' || currentProfile === 'spikeLoad') {
      // Only run resource-intensive tests under high load
      testGeographicPerformance(baseUrl);
      testResourceUsage(baseUrl);
    }
  }
}

// Setup function - runs once before all tests
export function setup() {
  console.log('🔧 Test Setup Phase');
  
  // Display available profiles if requested
  if (__ENV.LIST_PROFILES) {
    listProfiles();
    return;
  }
  
  // Validate the target server is running
  const healthCheck = http.get(`${config.baseUrl}/api/locales`);
  if (healthCheck.status !== 200) {
    throw new Error(`❌ Server not responding at ${config.baseUrl}. Status: ${healthCheck.status}`);
  }
  
  console.log(`✅ Server health check passed`);
  console.log(`🎯 Target: ${config.baseUrl}`);
  
  return {
    startTime: Date.now(),
    profile: __ENV.LOAD_PROFILE || 'baseLoad'
  };
}

// Teardown function - runs once after all tests
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🏁 Test completed in ${duration}s using ${data.profile} profile`);
  
  // Log final recommendations based on profile used
  const profile = __ENV.LOAD_PROFILE || 'baseLoad';
  
  switch(profile) {
    case 'noLoad':
      console.log('💡 Recommendation: Run baseLoad profile next to test under normal traffic');
      break;
    case 'baseLoad':
      console.log('💡 Recommendation: If tests pass, consider running peakLoad profile');
      break;
    case 'peakLoad':
      console.log('💡 Recommendation: Monitor production metrics and consider capacity planning');
      break;
    case 'spikeLoad':
      console.log('💡 Recommendation: Review auto-scaling configuration and rate limiting');
      break;
  }
}
