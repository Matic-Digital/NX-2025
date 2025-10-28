#!/usr/bin/env node

/**
 * Security Test Report Generator
 * Processes k6 test results and generates comprehensive security reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityReportGenerator {
  constructor() {
    this.templatePath = path.join(__dirname, '../templates/SECURITY_TEST_REPORT_TEMPLATE.md');
    this.outputDir = path.join(__dirname, '../reports');
    this.timestamp = new Date().toISOString();
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate report from k6 JSON output
   * @param {string} k6JsonPath - Path to k6 JSON results file
   * @param {string} profileName - Load profile name used
   */
  async generateReport(k6JsonPath, profileName = 'unknown') {
    try {
      console.log('🔄 Generating security test report...');
      
      // Load k6 results
      const k6Results = this.loadK6Results(k6JsonPath);
      
      // Load report template
      const template = fs.readFileSync(this.templatePath, 'utf8');
      
      // Process results and populate template
      const reportData = this.processResults(k6Results, profileName);
      const populatedReport = this.populateTemplate(template, reportData);
      
      // Generate output filename
      const reportFilename = `security-test-report-${profileName}-${this.formatTimestamp()}.md`;
      const outputPath = path.join(this.outputDir, reportFilename);
      
      // Write report
      fs.writeFileSync(outputPath, populatedReport);
      
      console.log(`✅ Report generated: ${outputPath}`);
      console.log(`📊 Summary: ${reportData.OVERALL_STATUS}`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      throw error;
    }
  }

  /**
   * Load and parse k6 JSON results
   */
  loadK6Results(jsonPath) {
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`K6 results file not found: ${jsonPath}`);
    }
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(rawData);
  }

  /**
   * Process k6 results into report data
   */
  processResults(k6Results, profileName) {
    const metrics = k6Results.metrics || {};
    const checks = k6Results.checks || {};
    
    // Calculate overall metrics
    const httpReqDuration = metrics.http_req_duration || {};
    const httpReqFailed = metrics.http_req_failed || {};
    const checksTotal = metrics.checks || {};
    
    // Security-specific analysis
    const securityChecks = this.analyzeSecurityChecks(checks);
    const performanceMetrics = this.analyzePerformance(metrics);
    const vulnerabilities = this.identifyVulnerabilities(checks);
    
    return {
      // Header information
      TIMESTAMP: this.timestamp,
      TOTAL_DURATION: this.formatDuration(k6Results.state?.testRunDurationMs || 0),
      PROFILES_RUN: profileName,
      OVERALL_STATUS: this.determineOverallStatus(securityChecks, performanceMetrics),
      
      // Key metrics
      SECURITY_PASS_RATE: securityChecks.passRate.toFixed(1),
      AUTH_SUCCESS_RATE: securityChecks.authSuccessRate.toFixed(1),
      INJECTION_BLOCK_RATE: securityChecks.injectionBlockRate.toFixed(1),
      AVAILABILITY_RATE: performanceMetrics.availabilityRate.toFixed(1),
      
      // Status indicators
      SECURITY_STATUS: this.getStatusIcon(securityChecks.passRate >= 85),
      AUTH_STATUS: this.getStatusIcon(securityChecks.authSuccessRate >= 95),
      INJECTION_STATUS: this.getStatusIcon(securityChecks.injectionBlockRate >= 95),
      AVAILABILITY_STATUS: this.getStatusIcon(performanceMetrics.availabilityRate >= 95),
      
      // Performance metrics
      NO_LOAD_P95: this.formatMetric(httpReqDuration.p95, 'ms'),
      BASE_LOAD_P95: this.formatMetric(httpReqDuration.p95, 'ms'),
      PEAK_LOAD_P95: this.formatMetric(httpReqDuration.p95, 'ms'),
      
      // Error rates
      NO_LOAD_ERROR_RATE: this.formatMetric(httpReqFailed.rate * 100, '%'),
      BASE_LOAD_ERROR_RATE: this.formatMetric(httpReqFailed.rate * 100, '%'),
      PEAK_LOAD_ERROR_RATE: this.formatMetric(httpReqFailed.rate * 100, '%'),
      
      // Security test results
      T1_OVERALL_STATUS: securityChecks.t1Status,
      T2_OVERALL_STATUS: securityChecks.t2Status,
      T4_OVERALL_STATUS: securityChecks.t4Status,
      T5_OVERALL_STATUS: securityChecks.t5Status,
      T10_OVERALL_STATUS: securityChecks.t10Status,
      
      // Findings
      CRITICAL_ISSUES_LIST: this.formatIssuesList(vulnerabilities.critical),
      VALIDATED_CONTROLS_LIST: this.formatControlsList(securityChecks.validatedControls),
      
      // Recommendations
      SECURITY_RECOMMENDATIONS: this.generateSecurityRecommendations(vulnerabilities),
      PERFORMANCE_RECOMMENDATIONS: this.generatePerformanceRecommendations(performanceMetrics),
      IMMEDIATE_ACTIONS: this.generateImmediateActions(vulnerabilities, performanceMetrics),
      
      // System info
      OS_VERSION: process.platform,
      NODE_VERSION: process.version,
      SYSTEM_MEMORY: Math.round(require('os').totalmem() / (1024 * 1024 * 1024)),
      CPU_CORES: require('os').cpus().length,
    };
  }

  /**
   * Analyze security check results
   */
  analyzeSecurityChecks(checks) {
    const securityChecks = Object.entries(checks).filter(([name]) => 
      name.includes('T1:') || name.includes('T2:') || name.includes('T4:') || 
      name.includes('T5:') || name.includes('T10:')
    );
    
    const totalChecks = securityChecks.length;
    const passedChecks = securityChecks.filter(([, result]) => result.passes > 0).length;
    
    const authChecks = securityChecks.filter(([name]) => name.includes('T1:') || name.includes('T4:'));
    const injectionChecks = securityChecks.filter(([name]) => name.includes('T5:'));
    
    return {
      passRate: totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0,
      authSuccessRate: this.calculateCheckSuccessRate(authChecks),
      injectionBlockRate: this.calculateCheckSuccessRate(injectionChecks),
      t1Status: this.getTestStatus(checks, 'T1:'),
      t2Status: this.getTestStatus(checks, 'T2:'),
      t4Status: this.getTestStatus(checks, 'T4:'),
      t5Status: this.getTestStatus(checks, 'T5:'),
      t10Status: this.getTestStatus(checks, 'T10:'),
      validatedControls: this.extractValidatedControls(checks)
    };
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformance(metrics) {
    const httpReqFailed = metrics.http_req_failed || { rate: 0 };
    const httpReqDuration = metrics.http_req_duration || {};
    
    return {
      availabilityRate: (1 - httpReqFailed.rate) * 100,
      avgResponseTime: httpReqDuration.avg || 0,
      p95ResponseTime: httpReqDuration.p95 || 0,
      errorRate: httpReqFailed.rate * 100
    };
  }

  /**
   * Identify security vulnerabilities from check results
   */
  identifyVulnerabilities(checks) {
    const vulnerabilities = {
      critical: [],
      high: [],
      medium: []
    };
    
    Object.entries(checks).forEach(([checkName, result]) => {
      if (result.fails > 0) {
        if (checkName.includes('SQL injection') || checkName.includes('Authentication')) {
          vulnerabilities.critical.push({
            name: checkName,
            failures: result.fails,
            severity: 'Critical'
          });
        } else if (checkName.includes('XSS') || checkName.includes('API key')) {
          vulnerabilities.high.push({
            name: checkName,
            failures: result.fails,
            severity: 'High'
          });
        } else {
          vulnerabilities.medium.push({
            name: checkName,
            failures: result.fails,
            severity: 'Medium'
          });
        }
      }
    });
    
    return vulnerabilities;
  }

  /**
   * Populate template with processed data
   */
  populateTemplate(template, data) {
    let populated = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      populated = populated.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Replace any remaining placeholders with "N/A"
    populated = populated.replace(/{[^}]+}/g, 'N/A');
    
    return populated;
  }

  /**
   * Helper methods
   */
  formatTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  formatMetric(value, unit) {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(1)}${unit}`;
  }

  getStatusIcon(isSuccess) {
    return isSuccess ? '✅ PASS' : '❌ FAIL';
  }

  calculateCheckSuccessRate(checks) {
    if (checks.length === 0) return 100;
    const totalPasses = checks.reduce((sum, [, result]) => sum + result.passes, 0);
    const totalChecks = checks.reduce((sum, [, result]) => sum + result.passes + result.fails, 0);
    return totalChecks > 0 ? (totalPasses / totalChecks) * 100 : 0;
  }

  getTestStatus(checks, testPrefix) {
    const testChecks = Object.entries(checks).filter(([name]) => name.includes(testPrefix));
    const allPassed = testChecks.every(([, result]) => result.fails === 0);
    return allPassed ? '✅ PASS' : '❌ FAIL';
  }

  determineOverallStatus(securityChecks, performanceMetrics) {
    if (securityChecks.passRate >= 85 && performanceMetrics.availabilityRate >= 95) {
      return '✅ PASS - All security and performance criteria met';
    } else if (securityChecks.passRate >= 70) {
      return '⚠️ CONDITIONAL PASS - Some issues identified, review required';
    } else {
      return '❌ FAIL - Critical security or performance issues detected';
    }
  }

  extractValidatedControls(checks) {
    const validatedControls = [];
    Object.entries(checks).forEach(([checkName, result]) => {
      if (result.passes > 0) {
        validatedControls.push(`- ${checkName}`);
      }
    });
    return validatedControls.join('\n');
  }

  formatIssuesList(issues) {
    if (issues.length === 0) return '- No critical issues identified ✅';
    return issues.map(issue => `- **${issue.severity}**: ${issue.name} (${issue.failures} failures)`).join('\n');
  }

  formatControlsList(controls) {
    return controls || '- Security controls validation in progress';
  }

  generateSecurityRecommendations(vulnerabilities) {
    const recommendations = [];
    
    if (vulnerabilities.critical.length > 0) {
      recommendations.push('1. **IMMEDIATE**: Address critical security vulnerabilities');
      recommendations.push('2. **HIGH PRIORITY**: Review and strengthen input validation');
    }
    
    if (vulnerabilities.high.length > 0) {
      recommendations.push('3. **HIGH PRIORITY**: Implement additional XSS protection measures');
      recommendations.push('4. **MEDIUM PRIORITY**: Review API security configurations');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- All security controls are functioning effectively ✅');
    }
    
    return recommendations.join('\n');
  }

  generatePerformanceRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.p95ResponseTime > 2000) {
      recommendations.push('1. **Optimize response times** - Consider caching strategies');
    }
    
    if (metrics.errorRate > 10) {
      recommendations.push('2. **Reduce error rates** - Review error handling and system capacity');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- Performance metrics are within acceptable ranges ✅');
    }
    
    return recommendations.join('\n');
  }

  generateImmediateActions(vulnerabilities, metrics) {
    const actions = [];
    
    if (vulnerabilities.critical.length > 0) {
      actions.push('🚨 **CRITICAL**: Fix security vulnerabilities before production deployment');
    }
    
    if (metrics.availabilityRate < 90) {
      actions.push('⚠️ **HIGH**: Investigate system stability issues');
    }
    
    if (actions.length === 0) {
      actions.push('✅ No immediate actions required - system is performing within acceptable parameters');
    }
    
    return actions.join('\n');
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SecurityReportGenerator();
  const k6JsonPath = process.argv[2];
  const profileName = process.argv[3] || 'manual';
  
  if (!k6JsonPath) {
    console.error('Usage: node generate-report.js <k6-json-file> [profile-name]');
    process.exit(1);
  }
  
  generator.generateReport(k6JsonPath, profileName)
    .then(reportPath => {
      console.log(`\n📋 Security Test Report Generated:`);
      console.log(`   File: ${reportPath}`);
      console.log(`   Profile: ${profileName}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
    })
    .catch(error => {
      console.error('Failed to generate report:', error.message);
      process.exit(1);
    });
}

export default SecurityReportGenerator;
