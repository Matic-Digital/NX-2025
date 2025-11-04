'use client';

import { useEffect } from 'react';
import { ContentfulLivePreview } from '@contentful/live-preview';

/**
 * Client component that initializes the Contentful Live Preview SDK
 * This ensures the SDK is initialized before any components try to use it
 */
export function ContentfulLivePreviewInitializer() {
  useEffect(() => {
    // Only initialize on the client side
    if (typeof window !== 'undefined') {
      try {
        // Check if already initialized to avoid duplicate initialization
        if (!ContentfulLivePreview.initialized) {
          // Use an async IIFE to avoid unbound method issues
          void (async () => {
            try {
              await ContentfulLivePreview.init({
                locale: 'en-US',
                enableInspectorMode: true,
                enableLiveUpdates: true,
                debugMode: true
              });
            } catch {
              // Ignore errors when initializing live preview
            }
          })();
        } else {
          // Non-preview mode - no initialization needed
        }
      } catch {
        // Ignore errors when checking preview environment
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
}
