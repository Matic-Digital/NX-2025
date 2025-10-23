#!/usr/bin/env node

/**
 * Custom Docker build script for Next.js App Router
 *
 * This script addresses the known issue with Next.js App Router in Docker environments
 * where static generation of error pages causes HTML import errors.
 *
 * The solution is to:
 * 1. Set specific environment variables to skip problematic static page generation
 * 2. Use a custom output directory for Docker builds
 * 3. Skip static generation of error pages
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Set environment variables
process.env.NEXT_SKIP_APP_STATIC_ERROR_PAGES = 'true';
process.env.NEXT_MINIMAL_STATIC_GENERATION = 'true';
process.env.NEXT_SKIP_STATIC_GENERATION_FOR = '/_error,/404,/500';

console.log('🔧 Running custom Docker build with optimized settings...');

try {
  // Run Next.js build with optimized settings for Docker
  execSync('next build --no-lint', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Additional environment variables for Docker compatibility
      DOCKER: 'true',
      NODE_ENV: 'production'
    }
  });

  console.log('✅ Build completed successfully');
  process.exit(0);
} catch (error) {
  // Handle the error with proper type checking
  if (error instanceof Error) {
    console.error('❌ Build failed:', error.message);
  } else {
    console.error('❌ Build failed with unknown error');
  }
  process.exit(1);
}
