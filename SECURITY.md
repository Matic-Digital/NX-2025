# Security Testing Guide

This document outlines the security testing tools and procedures implemented in this Next.js application to prepare for SecurityScorecard evaluation.

## 🛡️ Automated Security Tools

### Quick Security Check
```bash
npm run security
```
Runs dependency scanning and secret detection - the essential security checks.

### Comprehensive Security Assessment
```bash
npm run security:scorecard
```
Runs all security checks and generates a comprehensive report suitable for SecurityScorecard preparation.

## 🔍 Individual Security Tools

### 1. Dependency Vulnerability Scanning
```bash
npm run security:deps        # Enhanced dependency audit
npm run security:audit       # Standard npm audit
```

**What it checks:**
- Known vulnerabilities in npm packages
- Outdated dependencies with security issues
- Transitive dependency vulnerabilities

### 2. Secret Detection & Pattern Analysis
```bash
npm run security:secrets
```

**What it scans for:**
- API keys and tokens (Stripe, Google, AWS, etc.)
- Database connection strings
- Hardcoded passwords
- Dangerous JavaScript patterns (`eval`, `innerHTML`, etc.)
- Configuration security issues

### 3. Security-Focused Linting
```bash
npm run security:lint
```

**Security rules enforced:**
- Object injection prevention
- Unsafe regex detection
- Process execution restrictions
- XSS prevention patterns
- CSRF protection checks

### 4. Security Headers Validation
```bash
npm run security:headers
```

**Headers checked:**
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing prevention)
- Referrer Policy
- Strict Transport Security (HSTS)

## 🎯 SecurityScorecard Preparation

### Pre-Deployment Checklist

Run this command to get a comprehensive security assessment:
```bash
npm run security:scorecard
```

This generates a detailed report covering:
- ✅ Dependency vulnerabilities
- ✅ Secret exposure risks
- ✅ Code security patterns
- ✅ Security header configuration
- ✅ Overall security score

### Critical Security Issues

The security scanner will **fail the build** if it finds:
- High severity vulnerabilities in dependencies
- Exposed API keys or secrets
- Critical security misconfigurations

### Medium/Low Severity Issues

These are flagged but don't fail the build:
- `dangerouslySetInnerHTML` usage (necessary for rich content)
- Console statements (development artifacts)
- Direct `location.href` assignments (controlled redirects)

## 🔧 Security Configuration Files

### `.eslintrc.security.cjs`
Extended ESLint configuration with security-focused rules:
- Object injection detection
- Unsafe pattern identification
- Process environment restrictions

### Security Scripts
- `scripts/security-scan.ts` - Custom secret and pattern scanner
- `scripts/check-security-headers.ts` - HTTP security headers validator
- `scripts/security-summary.ts` - Comprehensive security reporter

## 📊 Security Metrics

The security system provides:
- **Security Score**: Overall percentage based on passed checks
- **Critical Issues**: Must be resolved before deployment
- **Risk Assessment**: Categorized by severity level
- **Remediation Guidance**: Specific steps to fix issues

## 🚨 Common Security Issues & Solutions

### 1. Exposed Secrets
**Issue**: API keys in source code
**Solution**: Use environment variables and `.env` files

### 2. Missing Security Headers
**Issue**: No CSP or security headers
**Solution**: Configure in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
        }
      ]
    }
  ];
}
```

### 3. Vulnerable Dependencies
**Issue**: Outdated packages with known vulnerabilities
**Solution**: Regular updates and monitoring

```bash
npm audit fix
npm update
```

### 4. XSS Vulnerabilities
**Issue**: Unsafe HTML rendering
**Solution**: Sanitize user input and use safe React patterns

## 🔄 Continuous Security

### Regular Monitoring
- Run security checks weekly: `npm run security`
- Monitor for new vulnerabilities
- Keep dependencies updated
- Review security headers regularly

### CI/CD Integration
Add to your CI pipeline:
```yaml
- name: Security Check
  run: npm run security
```

### SecurityScorecard Readiness
Before SecurityScorecard evaluation:
1. Run `npm run security:scorecard`
2. Address all critical issues
3. Document any accepted risks
4. Ensure security headers are configured
5. Verify HTTPS enforcement in production

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [SecurityScorecard Platform](https://securityscorecard.com/)
- [npm Security Best Practices](https://docs.npmjs.com/security)

## 🆘 Security Support

For security concerns or questions:
1. Review this documentation
2. Run the security tools
3. Check the generated reports
4. Consult the OWASP guidelines
