import security from 'eslint-plugin-security';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // Main security configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'security': security,
      'react': react,
      'react-hooks': reactHooks
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // Security-specific rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      
      // Additional security patterns
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Prevent dangerous HTML
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      
      // Environment variable security
      'no-process-env': 'warn', // Warn about direct process.env usage
      
      // Console statements (potential info leakage)
      'no-console': 'warn'
    }
  },

  // Allow console in scripts and development files
  {
    files: ['scripts/**/*', '*.config.*', 'vitest.config.*'],
    rules: {
      'no-console': 'off',
      'no-process-env': 'off'
    }
  },

  // Allow process.env in specific files
  {
    files: ['src/lib/env.ts', 'src/env.js'],
    rules: {
      'no-process-env': 'off'
    }
  }
];
