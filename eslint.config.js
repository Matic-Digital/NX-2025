import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import security from 'eslint-plugin-security';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '.vercel/**',
      '.env*',
      '*.config.js',
      '*.config.ts',
      'public/**',
      'coverage/**',
      '.nyc_output/**',
      'temp/**',
      'tmp/**',
      '**/*.min.js',
      'vendor/**',
      'lib/**/*.d.ts',
      'types/**/*.d.ts',
      '**/*.generated.*',
      'storybook-static/**',
      '.storybook/**',
      'docs/**',
      '*.log',
      'logs/**'
    ]
  },

  // Main configuration for all TypeScript and JavaScript files
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
      },
      globals: {
        // React globals
        React: 'readonly',
        JSX: 'readonly',
        
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        navigator: 'readonly',
        location: 'readonly'
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
      // TypeScript rules matching old config
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false
          }
        }
      ],

      // Security rules - set to warn in main config
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn', 
      'security/detect-unsafe-regex': 'warn',
      
      // React rules
      'react/no-danger': 'warn',
      'react/display-name': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      
      // Console rules - allow warn and error for debugging
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Turn off problematic rules that are causing errors
      'no-undef': 'off', // TypeScript handles this better
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-redeclare': 'off', // TypeScript handles this
      'no-empty': 'warn', // Downgrade to warning
      'no-useless-catch': 'warn', // Downgrade to warning
      'no-control-regex': 'warn', // Downgrade to warning
      
      // Disable rules that don't exist or are problematic
      'import/no-dynamic-require': 'off',
      '@next/next/no-img-element': 'off'
    }
  },

  // Test files
  {
    files: ['src/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/display-name': 'off'
    }
  }
];
