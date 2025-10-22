/**
 * Schema Debugger Component
 * 
 * Development-only component that adds schema validation to the browser console
 * and provides easy access to validation tools
 */

'use client';

import { useEffect } from 'react';
import { validatePageSchemas, logValidationUrls } from '@/lib/schema-validator';

interface SchemaDebuggerProps {
  enabled?: boolean;
}

/**
 * Component that adds schema debugging capabilities in development
 * Add this to your layout or pages during development
 */
export function SchemaDebugger({ enabled = process.env.NODE_ENV === 'development' }: SchemaDebuggerProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Add global validation functions to window for easy console access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (window as any).validateSchemas = validatePageSchemas;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (window as any).getValidationUrls = logValidationUrls;

    // Log validation URLs on page load
    console.log('🔍 Schema Debugger loaded. Use these commands in console:');
    console.log('  validateSchemas() - Validate all schemas on current page');
    console.log('  getValidationUrls() - Get validation tool URLs for current page');
    
    // Auto-validate schemas after a short delay to ensure they're loaded
    const timer = setTimeout(() => {
      validatePageSchemas();
      logValidationUrls();
    }, 1000);

    return () => clearTimeout(timer);
  }, [enabled]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for programmatic schema validation
 */
export function useSchemaValidation() {
  const validateCurrentPage = () => {
    if (typeof window !== 'undefined') {
      validatePageSchemas();
    }
  };

  const getValidationUrls = (url?: string) => {
    if (typeof window !== 'undefined') {
      logValidationUrls(url);
    }
  };

  return {
    validateCurrentPage,
    getValidationUrls
  };
}
