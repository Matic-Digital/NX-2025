# Nextracker Security Testing Suite

Comprehensive security and performance testing for the Nextracker Next.js application using k6.

## ⚠️ CRITICAL SAFETY NOTICE

**LOCALHOST TESTING ONLY** - These tests are configured to target `localhost:3000` exclusively. Never modify the configuration to target Vercel or production URLs.

## 📋 Test Coverage

### Security Tests (T1-T10)
- **T1**: API Authentication Bypass
- **T2**: HubSpot API Key Exposure  
- **T4**: Content Preview Token Abuse
- **T5**: Form Submission Validation
- **T10**: Content Security Policy Bypass

### Performance Tests (P1-P4)
- **P1**: API Load Testing
- **P2**: Content Rendering Performance
- **P3**: Geographic Performance Simulation
- **P4**: Memory and Resource Usage

## 🚀 Prerequisites

1. **k6 Installation**:
   ```bash
   # macOS
   brew install k6
   
   # Or download from https://k6.io/docs/getting-started/installation/
   ```

2. **Local Development Server**:
   ```bash
   # Start your Next.js app on localhost:3000
   npm run dev
   ```

## 🔧 Running Tests

### Full Security Test Suite
```bash
# Run all security and performance tests
k6 run security-tests/main-security-test.js
```

### Individual Test Categories
```bash
# Authentication tests only
k6 run security-tests/scenarios/auth-tests.js

# Injection/validation tests only  
k6 run security-tests/scenarios/injection-tests.js

# Performance tests only
k6 run security-tests/scenarios/performance-tests.js
```

### Custom Test Configuration
```bash
# Run with custom VU (Virtual Users) and duration
k6 run --vus 10 --duration 30s security-tests/main-security-test.js

# Run with specific test tags
k6 run --tag testType=security security-tests/main-security-test.js
```

## 📊 Test Results

### Success Criteria
- **Security**: All authentication bypasses blocked (401/403 responses)
- **Performance**: API responses < 500ms, Page loads < 2s
- **Validation**: All malicious inputs properly sanitized
- **Headers**: Security headers present (CSP, X-Frame-Options)

### Failure Investigation
1. Check k6 output for failed checks
2. Review response times and error rates
3. Investigate any exposed API keys or tokens
4. Verify input validation is working

## 🗂️ Test Structure

```
security-tests/
├── config/
│   ├── test-config.js          # Test execution configuration
│   ├── endpoints.js            # API endpoint definitions
│   └── geo-locations.js        # Geographic test data
├── scenarios/
│   ├── auth-tests.js           # Authentication security tests
│   ├── injection-tests.js      # Input validation tests
│   └── performance-tests.js    # Performance benchmarks
├── data/
│   ├── test-tokens.json        # Test authentication data
│   ├── test-tokens.js          # Token helper functions
│   └── malicious-inputs.json   # Security test payloads
├── main-security-test.js       # Main test runner
└── README.md                   # This file
```

## 🔒 Security Test Details

### Authentication Tests
- Invalid token handling
- API endpoint authorization
- Preview mode security
- Session management

### Input Validation Tests  
- XSS payload injection
- SQL injection attempts
- Command injection tests
- Buffer overflow simulation
- Form field validation

### Performance Tests
- API response times under load
- Content rendering performance
- Geographic header simulation
- Resource usage monitoring

## 📈 Interpreting Results

### k6 Metrics
- **http_reqs**: Total HTTP requests made
- **http_req_duration**: Request response times
- **http_req_failed**: Failed request rate
- **checks**: Test assertion pass/fail rate

### Custom Metrics
- **api_response_time**: API-specific response times
- **page_load_time**: Page rendering times  
- **error_rate**: Application error frequency

## 🛠️ Customization

### Adding New Tests
1. Create test function in appropriate scenario file
2. Add test to main runner
3. Update endpoint configuration if needed
4. Add test data to data files

### Modifying Test Load
Edit `security-tests/config/test-config.js`:
```javascript
options: {
  security: {
    stages: [
      { duration: '30s', target: 5 },   // Adjust load here
      { duration: '2m', target: 10 },
      { duration: '30s', target: 0 },
    ],
  },
}
```

## ⚡ Performance Tuning

### For Faster Tests
- Reduce VU count in config
- Shorten test duration
- Skip performance tests: run only security scenarios

### For More Thorough Testing
- Increase VU count and duration
- Add more malicious payloads
- Test additional endpoints

## 🚨 Troubleshooting

### Common Issues
1. **Connection Refused**: Ensure localhost:3000 is running
2. **k6 Not Found**: Install k6 using package manager
3. **Test Timeouts**: Check if local server is responsive
4. **Import Errors**: Verify file paths in test files

### Environment Validation
The tests include automatic environment validation to prevent accidental production testing.

## 📝 Reporting

Test results are output to console with:
- ✅ Passed security checks
- ❌ Failed security checks  
- 📊 Performance metrics
- ⚠️ Warnings and recommendations

For detailed reporting, consider integrating with k6 Cloud or InfluxDB + Grafana.

## 🔐 Security Best Practices

1. **Never test production**: Always use localhost
2. **Review test data**: Ensure no real credentials in test files
3. **Monitor results**: Address all failed security checks
4. **Regular testing**: Run tests before deployments
5. **Update payloads**: Keep malicious input tests current

---

**Remember**: This testing suite validates your application's security posture. Address any failures before deploying to production.
