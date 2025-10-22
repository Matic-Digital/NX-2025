#!/usr/bin/env tsx

/**
 * Security Summary Script
 * 
 * Runs all security checks and provides a comprehensive security report
 * suitable for SecurityScorecard preparation.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface SecurityCheck {
  name: string;
  command: string;
  description: string;
  critical: boolean;
}

const SECURITY_CHECKS: SecurityCheck[] = [
  {
    name: 'Dependency Vulnerabilities',
    command: 'npm audit --audit-level moderate --json',
    description: 'Checks for known vulnerabilities in dependencies',
    critical: true
  },
  {
    name: 'Better Audit',
    command: 'npx better-npm-audit audit --json',
    description: 'Enhanced dependency vulnerability scanning',
    critical: true
  },
  {
    name: 'Secret Detection',
    command: 'npx tsx scripts/security-scan.ts',
    description: 'Scans for exposed secrets and dangerous patterns',
    critical: true
  },
  {
    name: 'Security Headers',
    command: 'npx tsx scripts/check-security-headers.ts http://localhost:3000',
    description: 'Validates security headers configuration',
    critical: false
  }
];

class SecuritySummary {
  private results: Map<string, { success: boolean; output: string; error?: string }> = new Map();

  async runAllChecks(): Promise<void> {
    console.log('🛡️  Comprehensive Security Assessment\n');
    console.log('=' .repeat(60));
    console.log('Preparing for SecurityScorecard evaluation...\n');

    for (const check of SECURITY_CHECKS) {
      await this.runCheck(check);
    }

    this.generateReport();
  }

  private async runCheck(check: SecurityCheck): Promise<void> {
    console.log(`🔍 Running: ${check.name}`);
    
    try {
      const output = execSync(check.command, { 
        encoding: 'utf-8',
        timeout: 60000, // 1 minute timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      this.results.set(check.name, { success: true, output });
      console.log(`✅ ${check.name}: PASSED\n`);
      
    } catch (error: any) {
      const errorOutput = error.stdout || error.stderr || error.message;
      this.results.set(check.name, { 
        success: false, 
        output: errorOutput,
        error: error.message 
      });
      
      if (check.critical) {
        console.log(`❌ ${check.name}: FAILED (Critical)\n`);
      } else {
        console.log(`⚠️  ${check.name}: FAILED (Non-critical)\n`);
      }
    }
  }

  private generateReport(): void {
    console.log('📊 Security Assessment Report\n');
    console.log('=' .repeat(60));

    let criticalFailures = 0;
    let totalChecks = 0;
    let passedChecks = 0;

    for (const check of SECURITY_CHECKS) {
      const result = this.results.get(check.name);
      totalChecks++;

      if (result?.success) {
        passedChecks++;
        console.log(`✅ ${check.name}`);
        console.log(`   ${check.description}`);
      } else {
        if (check.critical) {
          criticalFailures++;
          console.log(`❌ ${check.name} (CRITICAL)`);
        } else {
          console.log(`⚠️  ${check.name} (Warning)`);
        }
        console.log(`   ${check.description}`);
        if (result?.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
      console.log();
    }

    // Additional security recommendations
    this.checkAdditionalSecurity();

    // Summary
    console.log('=' .repeat(60));
    console.log('📈 Security Score Summary:');
    console.log(`   Total Checks: ${totalChecks}`);
    console.log(`   Passed: ${passedChecks}`);
    console.log(`   Failed: ${totalChecks - passedChecks}`);
    console.log(`   Critical Failures: ${criticalFailures}`);
    
    const score = Math.round((passedChecks / totalChecks) * 100);
    console.log(`   Security Score: ${score}%`);

    if (criticalFailures === 0) {
      console.log('\n🎉 No critical security issues found!');
      console.log('✅ Ready for SecurityScorecard evaluation.');
    } else {
      console.log(`\n🚨 ${criticalFailures} critical security issues found.`);
      console.log('❌ Address these issues before SecurityScorecard evaluation.');
    }

    this.generateRecommendations();
  }

  private checkAdditionalSecurity(): void {
    console.log('🔧 Additional Security Checks:\n');

    // Check for .env files in git
    try {
      const gitignore = readFileSync('.gitignore', 'utf-8');
      if (gitignore.includes('.env')) {
        console.log('✅ Environment files properly ignored in git');
      } else {
        console.log('⚠️  .env files may not be properly ignored');
      }
    } catch {
      console.log('⚠️  No .gitignore found');
    }

    // Check Next.js config for security headers
    try {
      const nextConfig = readFileSync('next.config.js', 'utf-8');
      if (nextConfig.includes('headers') && nextConfig.includes('Content-Security-Policy')) {
        console.log('✅ Security headers configured in Next.js');
      } else {
        console.log('⚠️  Security headers not found in Next.js config');
      }
    } catch {
      console.log('⚠️  Could not check Next.js configuration');
    }

    // Check for HTTPS enforcement
    console.log('ℹ️  Ensure HTTPS is enforced in production');
    console.log('ℹ️  Verify CSP policies are restrictive enough');
    console.log('ℹ️  Check that API routes have proper authentication');
    console.log();
  }

  private generateRecommendations(): void {
    console.log('\n🎯 SecurityScorecard Preparation Checklist:\n');
    
    const recommendations = [
      '□ Run security scan regularly (weekly)',
      '□ Keep dependencies updated',
      '□ Implement proper CSP headers',
      '□ Use HTTPS everywhere',
      '□ Validate all user inputs',
      '□ Implement proper authentication',
      '□ Use secure session management',
      '□ Regular security audits',
      '□ Monitor for new vulnerabilities',
      '□ Implement proper error handling'
    ];

    recommendations.forEach(rec => console.log(rec));

    console.log('\n📚 Additional Resources:');
    console.log('• OWASP Top 10: https://owasp.org/www-project-top-ten/');
    console.log('• Next.js Security: https://nextjs.org/docs/advanced-features/security-headers');
    console.log('• SecurityScorecard: https://securityscorecard.com/');
  }
}

// Run the security summary
const summary = new SecuritySummary();
summary.runAllChecks().catch(console.error);
