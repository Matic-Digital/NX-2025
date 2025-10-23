#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Audit security suppressions and provide recommendations
 */
function auditSecuritySuppressions() {
  console.log('🔍 SECURITY SUPPRESSION AUDIT');
  console.log('==============================\n');

  const suppressionCategories = {
    'security/detect-object-injection': {
      severity: 'CRITICAL',
      description: 'Dynamic object property access - potential code injection',
      recommendation: 'Use Object.hasOwnProperty.call() or Object.entries() instead'
    },
    'security/detect-non-literal-regexp': {
      severity: 'HIGH', 
      description: 'Dynamic RegExp construction - potential ReDoS attacks',
      recommendation: 'Use literal regex patterns or validate input'
    },
    'security/detect-unsafe-regex': {
      severity: 'HIGH',
      description: 'Potentially unsafe regex patterns - ReDoS vulnerability',
      recommendation: 'Review regex for exponential backtracking'
    },
    'react/no-danger': {
      severity: 'MEDIUM',
      description: 'dangerouslySetInnerHTML usage - XSS risk',
      recommendation: 'Sanitize HTML content or use safer alternatives'
    }
  };

  console.log('🚨 CRITICAL SECURITY SUPPRESSIONS TO REVIEW');
  console.log('─────────────────────────────────────────────');
  
  // Files with critical security suppressions that need immediate review
  const criticalFiles = [
    {
      file: 'src/app/[...segments]/page.tsx:309',
      issue: 'security/detect-object-injection',
      context: 'Dynamic routing parameter access',
      action: 'REVIEW - Validate if route params are from trusted source'
    },
    {
      file: 'src/app/api/enable-draft/[contentType]/route.ts:300,308',
      issue: 'security/detect-object-injection', 
      context: 'API route parameter access',
      action: 'REVIEW - Validate contentType parameter against allowlist'
    },
    {
      file: 'src/components/Forms/HubspotForm/HubspotForm.tsx:156',
      issue: 'security/detect-object-injection',
      context: 'Form field access',
      action: 'ALREADY FIXED - We implemented secure property access'
    },
    {
      file: 'src/components/Region/RegionsMap.tsx (multiple lines)',
      issue: 'security/detect-object-injection',
      context: 'Map data access',
      action: 'REVIEW - Validate map data structure'
    },
    {
      file: 'src/lib/static-routing.ts:60,62',
      issue: 'security/detect-object-injection',
      context: 'Route mapping',
      action: 'JUSTIFIED - Static route mapping from config'
    }
  ];

  criticalFiles.forEach(item => {
    console.log(`\n📁 ${item.file}`);
    console.log(`   Issue: ${item.issue}`);
    console.log(`   Context: ${item.context}`);
    console.log(`   Action: ${item.action}`);
  });

  console.log('\n\n📋 SUPPRESSION REVIEW CHECKLIST');
  console.log('────────────────────────────────');
  console.log('For each suppression, verify:');
  console.log('✅ 1. Is the suppression actually necessary?');
  console.log('✅ 2. Is the data source trusted/validated?');
  console.log('✅ 3. Can we use a safer alternative?');
  console.log('✅ 4. Is there proper justification comment?');
  console.log('✅ 5. Is the risk acceptable for the use case?');

  console.log('\n\n🔧 RECOMMENDED ACTIONS');
  console.log('─────────────────────');
  console.log('1. **IMMEDIATE**: Review all security/detect-object-injection suppressions');
  console.log('2. **HIGH PRIORITY**: Add justification comments to all suppressions');
  console.log('3. **MEDIUM PRIORITY**: Fix TypeScript any/unsafe suppressions');
  console.log('4. **ONGOING**: Establish suppression review process');

  console.log('\n\n📝 SUPPRESSION COMMENT TEMPLATE');
  console.log('──────────────────────────────');
  console.log('// eslint-disable-next-line security/detect-object-injection');
  console.log('// JUSTIFICATION: [Reason why this is safe - e.g., "Static config object", "Validated input", etc.]');
  console.log('// RISK: [Low/Medium/High] - [Brief risk assessment]');
  console.log('// ALTERNATIVE: [If any safer alternative was considered]');

  console.log('\n\n═══════════════════════════════════════');
  console.log('🔒 Security suppression audit completed');
  console.log('═══════════════════════════════════════');
}

// Run the audit
auditSecuritySuppressions();
