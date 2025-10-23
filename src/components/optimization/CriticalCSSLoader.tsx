'use client';

import { useEffect } from 'react';
import { deferCSS, CRITICAL_RESOURCE_HINTS } from '@/lib/critical-css';

interface CriticalCSSLoaderProps {
  children: React.ReactNode;
}

/**
 * Component that optimizes CSS loading for better LCP performance
 * - Inlines critical CSS
 * - Defers non-critical CSS
 * - Adds resource hints
 */
export function CriticalCSSLoader({ children }: CriticalCSSLoaderProps) {
  useEffect(() => {
    // Add resource hints for better performance
    CRITICAL_RESOURCE_HINTS.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if ('crossOrigin' in hint && hint.crossOrigin) {
        link.crossOrigin = hint.crossOrigin as 'anonymous' | 'use-credentials';
      }
      document.head.appendChild(link);
    });

    // Inject critical CSS safely via DOM manipulation
    const criticalStyles = `
      /* Critical layout styles - prevent layout shifts */
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      /* Header critical styles - fixed positioning */
      .header-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        height: 80px;
      }
      
      header {
        position: relative;
        z-index: 100;
        height: 80px;
      }
    `;

    // Create and inject style element safely
    const styleElement = document.createElement('style');
    styleElement.textContent = criticalStyles;
    document.head.appendChild(styleElement);

    // Defer non-critical CSS chunks
    const deferredStyles = [
      '/_next/static/chunks/src_styles_layout_6ec1b365.css',
      // Add other non-critical CSS files here
    ];

    deferredStyles.forEach(styleUrl => {
      deferCSS(styleUrl);
    });

    // Cleanup function
    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  return <>{children}</>;
}

/**
 * Head component for critical resource optimization
 * Use this in your app layout or _document.tsx
 */
export function CriticalResourcesHead() {
  return (
    <>
      {/* Resource hints */}
      {CRITICAL_RESOURCE_HINTS.map((hint, index) => (
        <link
          key={index}
          rel={hint.rel}
          href={hint.href}
          {...('crossOrigin' in hint && hint.crossOrigin && { 
            crossOrigin: hint.crossOrigin as 'anonymous' | 'use-credentials' 
          })}
        />
      ))}
      
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}
