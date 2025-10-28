#!/usr/bin/env node

/**
 * Enhanced Security Test Runner with Automatic Report Generation
 * Runs k6 tests and generates comprehensive security reports
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SecurityReportGenerator from './scripts/generate-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityTestRunner {
  constructor() {
    this.outputDir = path.join(__dirname, 'results');
    this.reportsDir = path.join(__dirname, 'reports');
    
    // Ensure directories exist
    [this.outputDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Run security tests with specified load profile
   */
  async runTests(loadProfile = 'baseLoad') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputFile = path.join(this.outputDir, `k6-results-${loadProfile}-${timestamp}.json`);
    
    console.log('🚀 Starting Security Test Suite');
    console.log(`📊 Load Profile: ${loadProfile}`);
    console.log(`📁 Results will be saved to: ${outputFile}`);
    console.log('─'.repeat(60));
    
    try {
      // Run k6 test with JSON output
      await this.executeK6Test(loadProfile, outputFile);
      
      // Generate comprehensive report
      console.log('\n📋 Generating Security Report...');
      const reportGenerator = new SecurityReportGenerator();
      const reportPath = await reportGenerator.generateReport(outputFile, loadProfile);
      
      // Display summary
      this.displayTestSummary(outputFile, reportPath, loadProfile);
      
      return { outputFile, reportPath };
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute k6 test with specified parameters
   */
  executeK6Test(loadProfile, outputFile) {
    return new Promise((resolve, reject) => {
      const k6Args = [
        'run',
        '--out', `json=${outputFile}`,
        '-e', `LOAD_PROFILE=${loadProfile}`,
        path.join(__dirname, 'load-test-runner.js')
      ];

      console.log(`🔄 Executing: k6 ${k6Args.join(' ')}`);
      
      const k6Process = spawn('k6', k6Args, {
        stdio: 'inherit',
        cwd: __dirname
      });

      k6Process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ K6 test execution completed successfully');
          resolve();
        } else {
          reject(new Error(`K6 process exited with code ${code}`));
        }
      });

      k6Process.on('error', (error) => {
        reject(new Error(`Failed to start k6: ${error.message}`));
      });
    });
  }

  /**
   * Display test execution summary
   */
  displayTestSummary(outputFile, reportPath, loadProfile) {
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 SECURITY TEST EXECUTION COMPLETE');
    console.log('═'.repeat(60));
    
    try {
      // Read and parse k6 results for quick summary
      const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      const metrics = results.metrics || {};
      
      const httpReqDuration = metrics.http_req_duration || {};
      const httpReqFailed = metrics.http_req_failed || {};
      const checks = metrics.checks || {};
      
      console.log(`📊 Load Profile: ${loadProfile.toUpperCase()}`);
      console.log(`⏱️  Test Duration: ${this.formatDuration(results.state?.testRunDurationMs || 0)}`);
      console.log(`📈 Total Requests: ${metrics.http_reqs?.count || 0}`);
      console.log(`⚡ Avg Response Time: ${(httpReqDuration.avg || 0).toFixed(0)}ms`);
      console.log(`🎯 Success Rate: ${((1 - (httpReqFailed.rate || 0)) * 100).toFixed(1)}%`);
      console.log(`✅ Security Checks: ${((checks.rate || 0) * 100).toFixed(1)}% passed`);
      
      console.log('\n📁 Generated Files:');
      console.log(`   📊 Raw Results: ${path.basename(outputFile)}`);
      console.log(`   📋 Security Report: ${path.basename(reportPath)}`);
      
      console.log('\n🔍 Next Steps:');
      console.log('   1. Review the security report for detailed findings');
      console.log('   2. Address any critical or high-risk vulnerabilities');
      console.log('   3. Share report with IT/Security team');
      console.log('   4. Plan remediation for identified issues');
      
    } catch (error) {
      console.log(`📁 Results saved to: ${outputFile}`);
      console.log(`📋 Report generated: ${reportPath}`);
    }
    
    console.log('═'.repeat(60));
  }

  /**
   * Format duration from milliseconds to human readable
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Run multiple test profiles in sequence
   */
  async runTestSuite(profiles = ['noLoad', 'baseLoad']) {
    console.log('🔄 Running Complete Security Test Suite');
    console.log(`📋 Profiles: ${profiles.join(', ')}`);
    
    const results = [];
    
    for (const profile of profiles) {
      console.log(`\n${'─'.repeat(40)}`);
      console.log(`🎯 Starting ${profile} tests...`);
      console.log(`${'─'.repeat(40)}`);
      
      try {
        const result = await this.runTests(profile);
        results.push({ profile, ...result });
        
        // Brief pause between tests
        if (profiles.indexOf(profile) < profiles.length - 1) {
          console.log('\n⏸️  Pausing 30 seconds before next test...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to run ${profile} tests:`, error.message);
        results.push({ profile, error: error.message });
      }
    }
    
    // Generate summary report
    this.generateSuiteReport(results);
    
    return results;
  }

  /**
   * Generate summary report for test suite
   */
  generateSuiteReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const summaryPath = path.join(this.reportsDir, `test-suite-summary-${timestamp}.md`);
    
    let summary = '# Security Test Suite Summary\n\n';
    summary += `**Execution Date**: ${new Date().toISOString()}\n`;
    summary += `**Profiles Executed**: ${results.length}\n\n`;
    
    summary += '## Test Results Overview\n\n';
    summary += '| Profile | Status | Report | Notes |\n';
    summary += '|---------|--------|-----------|-------|\n';
    
    results.forEach(result => {
      const status = result.error ? '❌ FAILED' : '✅ COMPLETED';
      const report = result.reportPath ? `[View Report](${path.basename(result.reportPath)})` : 'N/A';
      const notes = result.error || 'Test completed successfully';
      
      summary += `| ${result.profile} | ${status} | ${report} | ${notes} |\n`;
    });
    
    summary += '\n## Recommendations\n\n';
    summary += '1. Review individual test reports for detailed findings\n';
    summary += '2. Prioritize remediation based on risk levels\n';
    summary += '3. Schedule follow-up testing after fixes\n';
    summary += '4. Update security documentation and procedures\n';
    
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`\n📋 Test Suite Summary: ${summaryPath}`);
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new SecurityTestRunner();
  const command = process.argv[2];
  const profile = process.argv[3];

  switch (command) {
    case 'single':
      if (!profile) {
        console.error('Usage: node run-with-report.js single <profile>');
        console.error('Available profiles: noLoad, baseLoad, peakLoad, spikeLoad, soakLoad, extremeLoad');
        process.exit(1);
      }
      runner.runTests(profile).catch(error => {
        console.error('Test execution failed:', error.message);
        process.exit(1);
      });
      break;

    case 'suite':
      const profiles = process.argv.slice(3);
      const defaultProfiles = profiles.length > 0 ? profiles : ['noLoad', 'baseLoad'];
      
      runner.runTestSuite(defaultProfiles).catch(error => {
        console.error('Test suite execution failed:', error.message);
        process.exit(1);
      });
      break;

    default:
      console.log('🔒 Security Test Runner with Automated Reporting');
      console.log('');
      console.log('Usage:');
      console.log('  node run-with-report.js single <profile>     # Run single test profile');
      console.log('  node run-with-report.js suite [profiles...]  # Run multiple profiles');
      console.log('');
      console.log('Available Profiles:');
      console.log('  noLoad     - Functional testing (1 user)');
      console.log('  baseLoad   - Normal traffic (5-15 users)');
      console.log('  peakLoad   - High traffic (1k-30k users)');
      console.log('  spikeLoad  - Traffic bursts (5-100 users)');
      console.log('  soakLoad   - Extended testing (10-20 users)');
      console.log('  extremeLoad - Ultra-high traffic (5k-75k users)');
      console.log('');
      console.log('Examples:');
      console.log('  node run-with-report.js single baseLoad');
      console.log('  node run-with-report.js suite noLoad baseLoad');
      console.log('  node run-with-report.js suite noLoad baseLoad peakLoad');
      break;
  }
}

export default SecurityTestRunner;
