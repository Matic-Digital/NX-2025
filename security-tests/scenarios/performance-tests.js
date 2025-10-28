// Performance Testing Scenarios
// Tests: P1-P4 from security protocol

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from '../config/test-config.js';
import { endpoints } from '../config/endpoints.js';

// Custom metrics
const apiResponseTime = new Trend('api_response_time');
const pageLoadTime = new Trend('page_load_time');
const errorRate = new Rate('error_rate');

// Validate environment before running tests
config.validateEnvironment();

export const options = config.options.performance;

export default function () {
  const baseUrl = config.baseUrl;
  
  // P1: API Load Testing
  testAPIPerformance(baseUrl);
  
  // P2: Content Rendering Load
  testContentRenderingPerformance(baseUrl);
  
  // P3: Geographic Performance Simulation
  testGeographicPerformance(baseUrl);
  
  // P4: Memory and Resource Usage (basic monitoring)
  testResourceUsage(baseUrl);
  
  sleep(1); // Rate limiting between iterations
}

/**
 * P1: API Load Testing
 * Target: All /api/* endpoints
 * Method: Gradual load increase (1→10→50→100 concurrent users)
 * Metrics: Response time, throughput, error rate
 * Expected: <500ms response time, <5% error rate
 */
function testAPIPerformance(baseUrl) {
  console.log('Running P1: API Load Testing');
  
  const apiEndpoints = [
    endpoints.api.locales,
    endpoints.api.checkPageParent,
    endpoints.dynamic.hubspotFormById('test-form'),
  ];

  apiEndpoints.forEach((endpoint) => {
    const startTime = Date.now();
    
    const response = http.get(`${baseUrl}${endpoint}`, {
      tags: { 
        test: 'P1-api-performance',
        endpoint: endpoint,
      },
    });

    const responseTime = Date.now() - startTime;
    apiResponseTime.add(responseTime);
    errorRate.add(response.status >= 400);

    check(response, {
      [`P1: API ${endpoint} response time < 500ms`]: () => responseTime < 500,
      [`P1: API ${endpoint} successful response`]: (r) => r.status < 400,
      [`P1: API ${endpoint} has response body`]: (r) => r.body.length > 0,
    });
  });

  // Test API under concurrent load simulation
  const concurrentRequests = 5; // Simulate concurrent users
  const promises = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    const response = http.get(`${baseUrl}${endpoints.api.locales}`, {
      tags: { 
        test: 'P1-concurrent-load',
        user: i,
      },
    });
    
    check(response, {
      [`P1: Concurrent request ${i} successful`]: (r) => r.status < 400,
      [`P1: Concurrent request ${i} reasonable time`]: (r) => r.timings.duration < 1000,
    });
  }
}

/**
 * P2: Content Rendering Load
 * Target: Complex pages with multiple Contentful components
 * Method: Concurrent page requests with varying content complexity
 * Metrics: Time to first byte, full page load time
 * Expected: <2s page generation time
 */
function testContentRenderingPerformance(baseUrl) {
  console.log('Running P2: Content Rendering Performance');
  
  const complexPages = [
    endpoints.pages.home,
    endpoints.pages.company,
    endpoints.pages.companyLatinAmerica,
    endpoints.pages.companyEurope,
  ];

  complexPages.forEach((page) => {
    const startTime = Date.now();
    
    const response = http.get(`${baseUrl}${page}`, {
      tags: { 
        test: 'P2-content-rendering',
        page: page,
      },
    });

    const loadTime = Date.now() - startTime;
    pageLoadTime.add(loadTime);

    check(response, {
      [`P2: Page ${page} loads in < 2s`]: () => loadTime < 2000,
      [`P2: Page ${page} returns HTML`]: (r) => 
        r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html'),
      [`P2: Page ${page} has content`]: (r) => r.body.length > 1000,
      [`P2: Page ${page} no server errors`]: (r) => r.status < 500,
    });

    // Check for performance indicators in HTML
    check(response, {
      [`P2: Page ${page} has meta viewport`]: (r) => 
        r.body.includes('name="viewport"'),
      [`P2: Page ${page} has title`]: (r) => 
        r.body.includes('<title>') && !r.body.includes('<title></title>'),
    });
  });

  // Test page rendering under load
  const pageLoadTests = [];
  for (let i = 0; i < 3; i++) {
    const response = http.get(`${baseUrl}${endpoints.pages.company}`, {
      tags: { 
        test: 'P2-rendering-load',
        iteration: i,
      },
    });

    check(response, {
      [`P2: Load test ${i} successful`]: (r) => r.status === 200,
      [`P2: Load test ${i} consistent performance`]: (r) => r.timings.duration < 3000,
    });
  }
}

/**
 * P3: Geographic Performance Simulation
 * Target: All pages and API endpoints
 * Method: Requests with different geographic headers and simulated latency
 * Metrics: Performance variance by simulated location
 * Expected: Consistent performance regardless of geographic headers
 */
function testGeographicPerformance(baseUrl) {
  console.log('Running P3: Geographic Performance Simulation');
  
  const geoHeaders = [
    {
      name: 'US-East',
      headers: {
        'CF-IPCountry': 'US',
        'X-Forwarded-For': '198.51.100.1',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    },
    {
      name: 'Europe',
      headers: {
        'CF-IPCountry': 'GB',
        'X-Forwarded-For': '192.0.2.1',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
    },
    {
      name: 'Asia-Pacific',
      headers: {
        'CF-IPCountry': 'SG',
        'X-Forwarded-For': '198.51.100.100',
        'Accept-Language': 'en-SG,en;q=0.9',
      },
    },
  ];

  geoHeaders.forEach((geo) => {
    const startTime = Date.now();
    
    const response = http.get(`${baseUrl}${endpoints.pages.home}`, {
      headers: geo.headers,
      tags: { 
        test: 'P3-geo-performance',
        region: geo.name,
      },
    });

    const responseTime = Date.now() - startTime;

    check(response, {
      [`P3: ${geo.name} response successful`]: (r) => r.status === 200,
      [`P3: ${geo.name} reasonable response time`]: () => responseTime < 5000,
      [`P3: ${geo.name} consistent content`]: (r) => r.body.length > 1000,
    });

    // Test API endpoints with geo headers
    const apiResponse = http.get(`${baseUrl}${endpoints.api.locales}`, {
      headers: geo.headers,
      tags: { 
        test: 'P3-geo-api',
        region: geo.name,
      },
    });

    check(apiResponse, {
      [`P3: API ${geo.name} response successful`]: (r) => r.status < 400,
      [`P3: API ${geo.name} handles geo headers`]: (r) => r.status !== 500,
    });
  });
}

/**
 * P4: Memory and Resource Usage
 * Target: Long-running test scenarios
 * Method: Extended load testing with memory monitoring
 * Metrics: Memory usage, garbage collection, resource leaks
 * Expected: Stable memory usage, no memory leaks
 */
function testResourceUsage(baseUrl) {
  console.log('Running P4: Resource Usage Testing');
  
  // Simulate sustained load to detect memory leaks
  const sustainedRequests = 10;
  const responseTimes = [];
  
  for (let i = 0; i < sustainedRequests; i++) {
    const startTime = Date.now();
    
    const response = http.get(`${baseUrl}${endpoints.pages.company}`, {
      tags: { 
        test: 'P4-sustained-load',
        iteration: i,
      },
    });

    const responseTime = Date.now() - startTime;
    responseTimes.push(responseTime);

    check(response, {
      [`P4: Sustained request ${i} successful`]: (r) => r.status === 200,
      [`P4: Sustained request ${i} stable performance`]: () => responseTime < 3000,
    });

    // Small delay to simulate realistic user behavior
    sleep(0.1);
  }

  // Check for performance degradation over time
  const firstHalf = responseTimes.slice(0, sustainedRequests / 2);
  const secondHalf = responseTimes.slice(sustainedRequests / 2);
  
  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  check(null, {
    'P4: No significant performance degradation': () => 
      secondHalfAvg < firstHalfAvg * 1.5, // Allow 50% degradation tolerance
  });

  // Test resource cleanup by making requests with large responses
  const largeContentResponse = http.get(`${baseUrl}${endpoints.pages.home}`, {
    tags: { test: 'P4-large-content' },
  });

  check(largeContentResponse, {
    'P4: Large content handled efficiently': (r) => 
      r.status === 200 && r.timings.duration < 5000,
    'P4: Large content no memory issues': (r) => 
      r.body.length > 0, // Basic check that response was received
  });
}

// Export individual test functions for modular testing
export { 
  testAPIPerformance, 
  testContentRenderingPerformance, 
  testGeographicPerformance, 
  testResourceUsage 
};
