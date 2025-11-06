/// <reference types="vitest" />
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['./src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/src/constants/**',
        '**/src/types/**',
        '**/*.d.ts',
        '**/vitest.config.ts',
        '**/coverage/**',
        '**/src/__tests__/**',
        '**/*.test.{ts,tsx}',
        // Config files in root folder
        '**/next.config.js',
        '**/.eslintrc.mjs',
        '**/postcss.config.js',
        '**/tailwind.config.ts',
        '**/prettier.config.js',
        '**/tsconfig.json',
        // Next.js app pages and layouts
        '**/src/app/**/*.tsx',
        '**/src/app/layout.tsx',
        '**/src/app/page.tsx',
        '**/src/app/error.tsx',
        '**/src/app/not-found.tsx',
        '**/src/app/providers.tsx'
      ]
    },
    reporters: ['default'],
    outputFile: {
      json: './test-results.json'
    },
    silent: false,
    slowTestThreshold: 500, // Mark tests as slow if they take more than 500ms
    sequence: {
      shuffle: false,
      concurrent: false // Run tests sequentially for more predictable output
    },
    testTimeout: 10000 // 10 seconds timeout for tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
