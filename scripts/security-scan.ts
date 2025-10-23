#!/usr/bin/env tsx

/**
 * Security Scanner
 *
 * Scans the codebase for potential security vulnerabilities:
 * - Exposed secrets and API keys
 * - Dangerous patterns
 * - Insecure dependencies
 * - Configuration issues
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { glob } from 'glob';

interface SecurityIssue {
  file: string;
  line: number;
  type: 'secret' | 'pattern' | 'config';
  severity: 'high' | 'medium' | 'low';
  message: string;
  content: string;
}

class SecurityScanner {
  private issues: SecurityIssue[] = [];
  private readonly secretPatterns = [
    // API Keys and tokens
    { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'API Key' },
    { pattern: /(?:secret[_-]?key|secretkey)\s*[:=]\s*['"][^'"]{10,}['"]/gi, type: 'Secret Key' },
    {
      pattern: /(?:access[_-]?token|accesstoken)\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      type: 'Access Token'
    },
    { pattern: /(?:bearer\s+)[a-zA-Z0-9\-._~+/]+=*/gi, type: 'Bearer Token' },

    // Specific services
    { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, type: 'Stripe Live Key' },
    { pattern: /pk_live_[a-zA-Z0-9]{24,}/g, type: 'Stripe Publishable Key' },
    { pattern: /AIza[0-9A-Za-z\\-_]{35}/g, type: 'Google API Key' },
    { pattern: /AKIA[0-9A-Z]{16}/g, type: 'AWS Access Key' },
    {
      pattern: /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
      type: 'Amazon MWS Key'
    },

    // Database URLs
    { pattern: /mongodb(\+srv)?:\/\/[^\s'"]+/gi, type: 'MongoDB Connection String' },
    { pattern: /postgres(?:ql)?:\/\/[^\s'"]+/gi, type: 'PostgreSQL Connection String' },
    { pattern: /mysql:\/\/[^\s'"]+/gi, type: 'MySQL Connection String' },

    // Generic patterns
    { pattern: /password\s*[:=]\s*['"][^'"]{3,}['"]/gi, type: 'Hardcoded Password' },
    { pattern: /token\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi, type: 'Generic Token' }
  ];

  private readonly dangerousPatterns = [
    { pattern: /eval\s*\(/gi, type: 'eval() usage', severity: 'high' as const },
    { pattern: /innerHTML\s*=/gi, type: 'innerHTML assignment', severity: 'medium' as const },
    {
      pattern: /dangerouslySetInnerHTML/gi,
      type: 'dangerouslySetInnerHTML usage',
      severity: 'medium' as const
    },
    {
      pattern: /document\.write\s*\(/gi,
      type: 'document.write usage',
      severity: 'medium' as const
    },
    { pattern: /window\.open\s*\(/gi, type: 'window.open usage', severity: 'low' as const },
    {
      pattern: /location\.href\s*=/gi,
      type: 'Direct location.href assignment',
      severity: 'low' as const
    }
  ];

  async scan(): Promise<void> {
    console.log('🔍 Starting security scan...\n');

    // Scan source files
    const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
      ignore: ['node_modules/**', '.next/**']
    });

    for (const file of files) {
      await this.scanFile(file);
    }

    // Scan config files
    const configFiles = ['next.config.js', '.env.example', 'package.json', 'docker-compose.yml'];

    for (const file of configFiles) {
      try {
        await this.scanFile(file);
      } catch (error) {
        // File might not exist, skip
      }
    }

    this.reportResults();
  }

  private async scanFile(filePath: string): Promise<void> {
    try {
      // Validate file path to prevent directory traversal
      const normalizedPath = filePath.replace(/\.\./g, '');
      const content = readFileSync(normalizedPath, 'utf-8');
      const lines = content.split('\n');

      // Skip if file is too large (> 1MB)
      if (content.length > 1024 * 1024) {
        return;
      }

      // Scan for secrets
      this.scanForSecrets(filePath, content, lines);

      // Scan for dangerous patterns
      this.scanForDangerousPatterns(filePath, content, lines);

      // Scan for config issues
      this.scanForConfigIssues(filePath, content, lines);
    } catch (error) {
      console.warn(`⚠️  Could not scan ${filePath}: ${error}`);
    }
  }

  private scanForSecrets(filePath: string, content: string, lines: string[]): void {
    for (const { pattern, type } of this.secretPatterns) {
      const matches = content.matchAll(pattern);

      for (const match of matches) {
        if (match.index !== undefined) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = lines[lineNumber - 1] || '';

          // Skip if it's in a comment or example
          if (this.isInComment(line) || this.isExample(line, filePath)) {
            continue;
          }

          this.issues.push({
            file: filePath,
            line: lineNumber,
            type: 'secret',
            severity: 'high',
            message: `Potential ${type} detected`,
            content: line.trim()
          });
        }
      }
    }
  }

  private scanForDangerousPatterns(filePath: string, content: string, lines: string[]): void {
    for (const { pattern, type, severity } of this.dangerousPatterns) {
      const matches = content.matchAll(pattern);

      for (const match of matches) {
        if (match.index !== undefined) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = lines[lineNumber - 1] || '';

          // Skip comments
          if (this.isInComment(line)) {
            continue;
          }

          this.issues.push({
            file: filePath,
            line: lineNumber,
            type: 'pattern',
            severity,
            message: `Dangerous pattern: ${type}`,
            content: line.trim()
          });
        }
      }
    }
  }

  private scanForConfigIssues(filePath: string, content: string, lines: string[]): void {
    // Check for missing security headers in Next.js config
    if (filePath.includes('next.config')) {
      if (!content.includes('Content-Security-Policy') && !content.includes('X-Frame-Options')) {
        this.issues.push({
          file: filePath,
          line: 1,
          type: 'config',
          severity: 'medium',
          message: 'Missing security headers configuration',
          content: 'Consider adding CSP and security headers'
        });
      }
    }

    // Check for exposed environment variables
    if (filePath.includes('.env') && !filePath.includes('.example')) {
      this.issues.push({
        file: filePath,
        line: 1,
        type: 'config',
        severity: 'high',
        message: 'Environment file should not be committed',
        content: 'Add to .gitignore'
      });
    }
  }

  private isInComment(line: string): boolean {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('#')
    );
  }

  private isExample(line: string, filePath: string): boolean {
    const lowerLine = line.toLowerCase();
    const lowerPath = filePath.toLowerCase();

    return (
      lowerLine.includes('example') ||
      lowerLine.includes('placeholder') ||
      lowerLine.includes('your_') ||
      lowerLine.includes('xxx') ||
      lowerPath.includes('example') ||
      lowerPath.includes('test') ||
      lowerPath.includes('mock')
    );
  }

  private reportResults(): void {
    console.log('📊 Security Scan Results\n');
    console.log('='.repeat(50));

    if (this.issues.length === 0) {
      console.log('✅ No security issues found!');
      return;
    }

    // Group by severity
    const high = this.issues.filter((i) => i.severity === 'high');
    const medium = this.issues.filter((i) => i.severity === 'medium');
    const low = this.issues.filter((i) => i.severity === 'low');

    if (high.length > 0) {
      console.log(`🚨 HIGH SEVERITY (${high.length} issues):`);
      high.forEach((issue) => this.printIssue(issue));
      console.log();
    }

    if (medium.length > 0) {
      console.log(`⚠️  MEDIUM SEVERITY (${medium.length} issues):`);
      medium.forEach((issue) => this.printIssue(issue));
      console.log();
    }

    if (low.length > 0) {
      console.log(`ℹ️  LOW SEVERITY (${low.length} issues):`);
      low.forEach((issue) => this.printIssue(issue));
      console.log();
    }

    console.log('='.repeat(50));
    console.log(`Total issues found: ${this.issues.length}`);

    if (high.length > 0) {
      console.log('\n❌ Security scan failed due to high severity issues.');
      process.exit(1);
    } else {
      console.log('\n✅ No high severity issues found.');
    }
  }

  private printIssue(issue: SecurityIssue): void {
    console.log(`  📁 ${issue.file}:${issue.line}`);
    console.log(`     ${issue.message}`);
    console.log(`     ${issue.content}`);
    console.log();
  }
}

// Run the scanner
const scanner = new SecurityScanner();
scanner.scan().catch(console.error);
