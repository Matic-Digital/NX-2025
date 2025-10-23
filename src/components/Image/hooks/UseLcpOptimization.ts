'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to automatically detect and optimize LCP (Largest Contentful Paint) images
 * This helps identify which images should be prioritized for faster loading
 */
export const useLCPOptimization = () => {
  const [lcpElements, setLcpElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Use Intersection Observer to detect images in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.src || img.getAttribute('data-src');
            if (src) {
              setLcpElements(prev => new Set(prev).add(src));
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    // Observe all images on the page
    const images = document.querySelectorAll('img');
    images.forEach(img => observer.observe(img));

    // Use Performance Observer to detect actual LCP elements
    if ('PerformanceObserver' in window) {
      try {
        const perfObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            element?: HTMLElement;
          };
          
          if (lastEntry?.element?.tagName === 'IMG') {
            const imgElement = lastEntry.element as HTMLImageElement;
            const src = imgElement.src ?? imgElement.getAttribute('data-src');
            if (src) {
              setLcpElements(prev => new Set(prev).add(src));
            }
          }
        });

        perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        return () => {
          perfObserver.disconnect();
          observer.disconnect();
        };
      } catch {
        // Fallback if PerformanceObserver is not supported
        return () => observer.disconnect();
      }
    }

    return () => observer.disconnect();
  }, []);

  const isLCPCandidate = (src: string): boolean => {
    return lcpElements.has(src);
  };

  return { isLCPCandidate, lcpElements };
};

/**
 * Utility to determine if an image should be prioritized based on its position and context
 * @param index - Position of the image in a list/grid
 * @param isAboveFold - Whether the image is likely above the fold
 * @param isHeroImage - Whether this is a hero/banner image
 * @returns boolean indicating if the image should be prioritized
 */
export const shouldPrioritizeImage = (
  index?: number,
  isAboveFold?: boolean,
  isHeroImage?: boolean
): boolean => {
  // Always prioritize hero images
  if (isHeroImage) return true;
  
  // Prioritize images above the fold
  if (isAboveFold) return true;
  
  // Prioritize first few images in a list/grid (likely above fold)
  if (typeof index === 'number' && index < 2) return true;
  
  return false;
};
