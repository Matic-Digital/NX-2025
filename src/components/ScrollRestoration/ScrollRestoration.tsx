'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollRestoration Component
 * 
 * Ensures that when users navigate using browser back/forward buttons or any navigation,
 * they are always taken to the top of the page instead of maintaining scroll position.
 * 
 * This overrides the browser's default scroll restoration behavior.
 */
export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Scroll to top whenever the pathname changes (navigation occurs)
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use 'instant' to avoid animation delay
      });
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
