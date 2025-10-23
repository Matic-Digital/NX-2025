#!/usr/bin/env tsx

/**
 * Pa11y runner that reads URLs from JSON file and runs accessibility tests
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPa11y() {
  try {
    // Read URLs from the generated JSON file
    const urlsPath = path.join(__dirname, '..', 'pa11y-urls.json');

    if (!fs.existsSync(urlsPath)) {
      console.error('URLs file not found. Run the sitemap generator first.');
      process.exit(1);
    }

    const urls: string[] = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));

    // Filter out malformed URLs
    const validUrls = urls.filter((url) => {
      // Remove URLs with double slashes (except after protocol)
      if (url.includes('//') && !url.match(/^https?:\/\//)) {
        return false;
      }
      // Remove empty or invalid URLs
      if (!url || url === 'http://localhost:3000//' || url.endsWith('//')) {
        return false;
      }
      return true;
    });

    console.log(`Running Pa11y on ${validUrls.length} URLs...`);

    // Create a temporary config file with the URLs
    const tempConfigPath = path.join(__dirname, '..', '.pa11yci-temp.json');
    const configContent = {
      defaults: {
        standard: 'WCAG2AA',
        timeout: 30000,
        wait: 2000,
        chromeLaunchConfig: {
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        },
        ignore: [
          'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
          'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.EmptyNoId'
        ],
        hideElements: '.pa11y-ignore',
        includeNotices: false,
        includeWarnings: false,
        reporter: 'cli',
        level: 'error'
      },
      urls: validUrls
    };

    fs.writeFileSync(tempConfigPath, JSON.stringify(configContent, null, 2));

    // Run pa11y-ci with the temporary config
    const pa11yArgs = ['pa11y-ci', '--config', tempConfigPath];

    const child = spawn('npx', pa11yArgs, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    child.on('close', (code) => {
      // Clean up temp config file
      try {
        fs.unlinkSync(tempConfigPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      process.exit(code || 0);
    });

    child.on('error', (error) => {
      console.error('Failed to run Pa11y:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error running Pa11y:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPa11y();
}

export { runPa11y };
