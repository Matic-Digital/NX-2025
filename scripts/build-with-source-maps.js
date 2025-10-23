#!/usr/bin/env node

/**
 * Build script with source map management
 * Usage:
 *   npm run build:with-maps     - Build with source maps (default)
 *   npm run build:no-maps       - Build without source maps
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Check command line arguments
const args = process.argv.slice(2);
const disableSourceMaps = args.includes('--no-maps') || process.env.DISABLE_SOURCE_MAPS === 'true';

// Set environment variables
const env = {
  ...process.env,
  DISABLE_SOURCE_MAPS: disableSourceMaps ? 'true' : 'false'
};

// Function to run a command and return a promise
/**
 * @param {string} command - The command to run
 * @param {string[]} args - Command arguments
 * @returns {Promise<void>}
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: projectRoot,
      env,
      stdio: 'inherit',
      shell: true
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code: ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Run build sequence
async function build() {
  try {
    // Step 1: Generate sitemap and routing
    await runCommand('npm', ['run', 'sitemap:routing']);
    
    // Step 2: Run Next.js build
    await runCommand('npx', ['next', 'build']);
    
  } catch (error) {
    console.error('❌ Build failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

build();
