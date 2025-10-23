/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  plugins: ['@typescript-eslint', '@eslint-react', 'security', 'react'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked'
  ],
  rules: {
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
    // Security rules - set to warn in main config, error in security config
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn', 
    'security/detect-unsafe-regex': 'warn',
    'react/no-danger': 'warn',
    // Console rules
    'no-console': 'warn'
  },
  overrides: [
    // https://eslint-react.xyz/docs/installation
    // directories in components
    {
      files: ['src/components/**'],
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'kebab-case']
      }
    },
    // Matic Design System components
    {
      files: ['src/components/global/matic-ds/*.{ts,tsx}'],
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'kebab-case']
      }
    },
    // custom components (excluding matic-ds)
    {
      files: ['src/components/**/*.{ts,tsx}'],
      excludedFiles: ['src/components/global/matic-ds/*.{ts,tsx}'],
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'PascalCase']
      }
    },
    // shadcn components installed via CLI
    {
      files: ['src/components/ui/*.{ts,tsx}'],
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'kebab-case']
      }
    },
    // hooks
    {
      files: ['src/hooks/**/use*.{ts,tsx}'],
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'camelCase']
      }
    },
    // shadcn hooks
    {
      files: ['src/hooks/**/use-*.{ts,tsx}'],
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'kebab-case']
      }
    },
    // Utility files - allow lowercase naming
    {
      files: [
        '**/types.ts',
        '**/validation.ts', 
        '**/index.ts',
        '**/utils/**/*.ts',
        '**/lib/**/*.ts'
      ],
      rules: {
        '@eslint-react/naming-convention/filename': 'off'
      }
    },
    // Test files - disable type-related rules
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
  ]
};
module.exports = config;
