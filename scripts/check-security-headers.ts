#!/usr/bin/env tsx

/**
 * Security Headers Checker
 * 
 * Tests the application for proper security headers when running locally.
 * This helps ensure security configurations are working before deployment.
 */

import { readFileSync } from 'fs';

interface SecurityHeader {
  name: string;
  required: boolean;
  description: string;
  expectedPattern?: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const SECURITY_HEADERS: SecurityHeader[] = [
  {
    name: 'Content-Security-Policy',
    required: true,
    description: 'Prevents XSS attacks by controlling resource loading',
    severity: 'critical'
  },
  {
    name: 'X-Frame-Options',
    required: true,
    description: 'Prevents clickjacking attacks',
    expectedPattern: /^(DENY|SAMEORIGIN)$/,
    severity: 'high'
  },
  {
    name: 'X-Content-Type-Options',
    required: true,
    description: 'Prevents MIME type sniffing',
    expectedPattern: /^nosniff$/,
    severity: 'high'
  },
  {
    name: 'Referrer-Policy',
    required: true,
    description: 'Controls referrer information sent with requests',
    severity: 'medium'
  },
  {
    name: 'Permissions-Policy',
    required: false,
    description: 'Controls browser features and APIs',
    severity: 'medium'
  },
  {
    name: 'Strict-Transport-Security',
    required: false, // Only for HTTPS
    description: 'Enforces HTTPS connections',
    severity: 'high'
  },
  {
    name: 'X-XSS-Protection',
    required: false, // Deprecated but still useful
    description: 'Legacy XSS protection (deprecated)',
    expectedPattern: /^1; mode=block$/,
    severity: 'low'
  }
];

class SecurityHeadersChecker {
  private async checkHeaders(url: string): Promise<void> {
    console.log(`🔍 Checking security headers for: ${url}\n`);

    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.analyzeHeaders(response.headers);
      
    } catch (error) {
      console.error(`❌ Failed to fetch headers: ${error}`);
      console.log('\n💡 Make sure your development server is running:');
      console.log('   npm run dev');
      process.exit(1);
    }
  }

  private analyzeHeaders(headers: Headers): void {
    const results: Array<{
      header: SecurityHeader;
      present: boolean;
      value?: string;
      valid?: boolean;
    }> = [];

    // Check each security header
    for (const header of SECURITY_HEADERS) {
      const value = headers.get(header.name);
      const present = value !== null;
      let valid = true;

      if (present && header.expectedPattern) {
        valid = header.expectedPattern.test(value!);
      }

      results.push({
        header,
        present,
        value: value || undefined,
        valid
      });
    }

    this.reportResults(results);
  }

  private reportResults(results: Array<{
    header: SecurityHeader;
    present: boolean;
    value?: string;
    valid?: boolean;
  }>): void {
    console.log('📊 Security Headers Analysis\n');
    console.log('=' .repeat(60));

    let criticalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    for (const result of results) {
      const { header, present, value, valid } = result;
      
      if (!present && header.required) {
        console.log(`❌ ${header.name} (${header.severity.toUpperCase()})`);
        console.log(`   Missing required header`);
        console.log(`   ${header.description}`);
        this.incrementIssueCount(header.severity);
      } else if (present && !valid) {
        console.log(`⚠️  ${header.name} (${header.severity.toUpperCase()})`);
        console.log(`   Invalid value: ${value}`);
        console.log(`   ${header.description}`);
        this.incrementIssueCount(header.severity);
      } else if (present) {
        console.log(`✅ ${header.name}`);
        console.log(`   ${value}`);
      } else {
        console.log(`ℹ️  ${header.name} (Optional)`);
        console.log(`   Not present - ${header.description}`);
      }
      console.log();
    }

    // Check for additional security headers
    this.checkAdditionalHeaders();

    console.log('=' .repeat(60));
    this.printSummary(criticalIssues, highIssues, mediumIssues, lowIssues);
  }

  private incrementIssueCount = (() => {
    let criticalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    return (severity: string) => {
      switch (severity) {
        case 'critical': criticalIssues++; break;
        case 'high': highIssues++; break;
        case 'medium': mediumIssues++; break;
        case 'low': lowIssues++; break;
      }
    };
  })();

  private checkAdditionalHeaders(): void {
    console.log('🔧 Additional Security Recommendations:\n');
    
    // Check Next.js config for security headers
    try {
      const nextConfig = readFileSync('next.config.js', 'utf-8');
      
      if (!nextConfig.includes('headers')) {
        console.log('💡 Consider adding security headers to next.config.js');
        console.log('   See: https://nextjs.org/docs/advanced-features/security-headers');
      }
      
      if (!nextConfig.includes('Content-Security-Policy')) {
        console.log('💡 Add Content Security Policy to prevent XSS attacks');
      }
      
    } catch (error) {
      console.log('⚠️  Could not read next.config.js');
    }
    
    console.log();
  }

  private printSummary(critical: number, high: number, medium: number, low: number): void {
    const total = critical + high + medium + low;
    
    if (total === 0) {
      console.log('🎉 Excellent! All security headers are properly configured.');
      return;
    }

    console.log(`📈 Security Headers Summary:`);
    if (critical > 0) console.log(`   🚨 Critical: ${critical}`);
    if (high > 0) console.log(`   ⚠️  High: ${high}`);
    if (medium > 0) console.log(`   📋 Medium: ${medium}`);
    if (low > 0) console.log(`   ℹ️  Low: ${low}`);
    
    console.log(`\nTotal issues: ${total}`);

    if (critical > 0 || high > 0) {
      console.log('\n❌ Critical or high severity issues found.');
      console.log('🔧 Recommended next.config.js security headers:');
      console.log(`
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
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ];
}
      `);
      
      process.exit(1);
    } else {
      console.log('\n✅ No critical security issues found.');
    }
  }

  async run(): Promise<void> {
    const url = process.argv[2] || 'http://localhost:3000';
    await this.checkHeaders(url);
  }
}

// Run the checker
const checker = new SecurityHeadersChecker();
checker.run().catch(console.error);
