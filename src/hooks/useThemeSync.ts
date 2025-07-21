'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

/**
 * A custom hook that ensures theme changes are properly applied to both
 * the HTML and body elements, and that CSS variables are correctly updated.
 */
export function useThemeSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;

    // Function to apply theme class
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    // Apply theme based on resolvedTheme
    if (resolvedTheme === 'dark') {
      applyTheme(true);
    } else {
      applyTheme(false);
    }

    // Create a mutation observer to ensure the dark class stays applied
    // This helps with frameworks that might manipulate the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          (mutation.target === document.documentElement || mutation.target === document.body)
        ) {
          // Re-apply theme if classes were changed externally
          if (resolvedTheme === 'dark' && !document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.add('dark');
          } else if (
            resolvedTheme === 'light' &&
            document.documentElement.classList.contains('dark')
          ) {
            document.documentElement.classList.remove('dark');
          }

          // Ensure body has the same class
          if (
            document.documentElement.classList.contains('dark') !==
            document.body.classList.contains('dark')
          ) {
            if (document.documentElement.classList.contains('dark')) {
              document.body.classList.add('dark');
            } else {
              document.body.classList.remove('dark');
            }
          }
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [resolvedTheme]);

  return { theme, resolvedTheme };
}
