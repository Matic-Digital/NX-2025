'use client';

import { useEffect, useState } from 'react';

/**
 * Simple breakpoint hook that prevents forced reflows
 * Uses matchMedia for better performance than window.innerWidth
 */
export function useBreakpoint(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Common breakpoints
export const useIsDesktop = () => useBreakpoint('(min-width: 1280px)');
export const useIsTablet = () => useBreakpoint('(min-width: 768px)');
