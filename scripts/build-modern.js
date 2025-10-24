#!/usr/bin/env node

/**
 * Modern build script that optimizes for current browsers
 * Reduces polyfills and transforms for better performance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for modern browsers...');

// Check if we should analyze the bundle
const shouldAnalyze = process.argv.includes('--analyze');

// Prepare environment variables for the build
const buildEnv = {
  ...process.env,
  BROWSERSLIST_ENV: 'modern',
  NODE_ENV: 'production'
};

if (shouldAnalyze) {
  // @ts-ignore - Adding dynamic environment variable
  buildEnv.ANALYZE = 'true';
}

try {
  // Run the build
  console.log('📦 Starting Next.js build...');
  execSync('next build', { 
    stdio: 'inherit',
    // @ts-ignore - Environment object is compatible at runtime
    env: buildEnv
  });

  // Check bundle size
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    console.log('✅ Modern build completed successfully!');
    console.log('📊 Bundle optimized for browsers with native ES2022 support');
    console.log('🎯 Reduced polyfills for: Array.at, Array.flat, Object.fromEntries, etc.');
  }

} catch (error) {
  console.error('❌ Build failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
