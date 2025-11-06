#!/usr/bin/env node

/**
 * Test script to verify the /api/revalidate route is working correctly
 * Usage: node scripts/test-revalidate.js [base-url] [secret]
 */

import https from 'https';
import http from 'http';

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const SECRET = process.argv[3] || process.env.CONTENTFUL_REVALIDATE_SECRET;

if (!SECRET) {
  console.error('❌ Error: CONTENTFUL_REVALIDATE_SECRET not provided');
  console.log('Usage: node scripts/test-revalidate.js [base-url] [secret]');
  console.log('Or set CONTENTFUL_REVALIDATE_SECRET environment variable');
  process.exit(1);
}

const httpModule = BASE_URL.startsWith('https') ? https : http;

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test GET request (manual testing)
 */
async function testGetRequest() {
  console.log('\n🧪 Testing GET request...');
  
  const url = new URL(`${BASE_URL}/api/revalidate`);
  url.searchParams.set('secret', SECRET);
  url.searchParams.set('path', '/');
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.revalidated) {
      console.log('✅ GET request test passed');
      return true;
    } else {
      console.log('❌ GET request test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ GET request error:', error.message);
    return false;
  }
}

/**
 * Test POST request with Bearer token
 */
async function testPostRequestWithBearer() {
  console.log('\n🧪 Testing POST request with Bearer token...');
  
  const url = new URL(`${BASE_URL}/api/revalidate`);
  
  // Simulate Contentful webhook payload
  const payload = {
    sys: {
      id: 'test-entry-id',
      type: 'Entry',
      contentType: {
        sys: {
          id: 'Page'
        }
      }
    },
    fields: {
      slug: {
        'en-US': 'test-page'
      },
      title: {
        'en-US': 'Test Page'
      }
    }
  };

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET}`,
      'Accept': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, payload);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.revalidated) {
      console.log('✅ POST request with Bearer test passed');
      return true;
    } else {
      console.log('❌ POST request with Bearer test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ POST request with Bearer error:', error.message);
    return false;
  }
}

/**
 * Test POST request with direct token (no Bearer)
 */
async function testPostRequestDirectToken() {
  console.log('\n🧪 Testing POST request with direct token (no Bearer)...');
  
  const url = new URL(`${BASE_URL}/api/revalidate`);
  
  // Simulate webhook payload (like Vercel might send)
  const payload = {
    sys: {
      id: 'test-entry-id-2',
      type: 'Entry',
      contentType: {
        sys: {
          id: 'Page'
        }
      }
    },
    fields: {
      slug: {
        'en-US': 'test-page-2'
      },
      title: {
        'en-US': 'Test Page 2'
      }
    }
  };

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': SECRET, // Direct token without Bearer
      'Accept': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, payload);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.revalidated) {
      console.log('✅ POST request with direct token test passed');
      return true;
    } else {
      console.log('❌ POST request with direct token test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ POST request with direct token error:', error.message);
    return false;
  }
}

/**
 * Test different content types
 */
async function testContentTypes() {
  console.log('\n🧪 Testing different content types...');
  
  const contentTypes = [
    { type: 'Page', slug: 'about' },
    { type: 'PageList', slug: 'products' },
    { type: 'Post', slug: 'test-post' },
    { type: 'Product', slug: 'test-product' },
    { type: 'Header', slug: 'main-header' }
  ];

  let allPassed = true;

  for (const { type, slug } of contentTypes) {
    console.log(`\n  Testing ${type} content type...`);
    
    const url = new URL(`${BASE_URL}/api/revalidate`);
    
    const payload = {
      sys: {
        id: `test-${type.toLowerCase()}-id`,
        type: 'Entry',
        contentType: {
          sys: {
            id: type
          }
        }
      },
      fields: {
        slug: {
          'en-US': slug
        }
      }
    };

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET}`,
        'Accept': 'application/json'
      }
    };

    try {
      const response = await makeRequest(options, payload);
      
      if (response.status === 200 && response.data.revalidated) {
        console.log(`  ✅ ${type} test passed`);
        console.log(`     Revalidated paths: ${response.data.paths?.join(', ') || 'none'}`);
        console.log(`     Revalidated tags: ${response.data.tags?.join(', ') || 'none'}`);
      } else {
        console.log(`  ❌ ${type} test failed`);
        console.log(`     Status: ${response.status}`);
        console.log(`     Response: ${JSON.stringify(response.data)}`);
        allPassed = false;
      }
    } catch (error) {
      console.error(`  ❌ ${type} test error:`, error.message);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test security (unauthorized requests)
 */
async function testSecurity() {
  console.log('\n🧪 Testing security (unauthorized requests)...');
  
  const url = new URL(`${BASE_URL}/api/revalidate`);
  
  const payload = {
    sys: {
      id: 'test-entry-id',
      type: 'Entry',
      contentType: {
        sys: {
          id: 'Page'
        }
      }
    }
  };

  // Test without secret
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, payload);
    
    if (response.status === 401) {
      console.log('✅ Security test passed - unauthorized request rejected');
      return true;
    } else {
      console.log('❌ Security test failed - unauthorized request was accepted');
      console.log(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Security test error:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting revalidation route tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Secret: ${SECRET ? '***' + SECRET.slice(-4) : 'NOT SET'}`);
  
  const results = [];
  
  // Run all tests
  results.push(await testGetRequest());
  results.push(await testPostRequestWithBearer());
  results.push(await testPostRequestDirectToken());
  results.push(await testContentTypes());
  results.push(await testSecurity());
  
  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Revalidation route is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the configuration and try again.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
