'use client';

import { useEffect, useState } from 'react';

/**
 * Font Loading Optimization Component
 * Prevents layout shifts caused by font loading
 */

export function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts are already loaded
    if (document.fonts && 'ready' in document.fonts) {
      void document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      // Fallback for browsers without Font Loading API
      const timer = setTimeout(() => {
        setFontsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Add font-loaded class to body when fonts are ready
  useEffect(() => {
    if (fontsLoaded) {
      document.body.classList.add('fonts-loaded');
    }
  }, [fontsLoaded]);

  return null;
}

/**
 * Font Display Optimization Styles
 * Add these to your global CSS or critical CSS
 */
export const FONT_OPTIMIZATION_CSS = `
  /* Font loading optimization */
  @font-face {
    font-family: 'Inter';
    font-display: swap; /* Prevents invisible text during font load */
    src: url('/fonts/inter-var.woff2') format('woff2');
  }
  
  /* Prevent layout shifts during font loading */
  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  
  /* Stable icon sizing */
  .icon {
    width: 1em;
    height: 1em;
    display: inline-block;
    vertical-align: -0.125em;
  }
  
  /* Prevent text reflow during font load */
  .fonts-loaded {
    /* Add any font-specific adjustments here */
  }
`;
