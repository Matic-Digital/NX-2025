/**
 * Image optimization utilities for better LCP performance
 */

/**
 * Determines if an image should be preloaded based on its position and context
 * @param options Configuration options for priority determination
 * @returns boolean indicating if the image should be prioritized
 */
export const shouldPreloadImage = (options: {
  index?: number;
  isHeroImage?: boolean;
  isAboveFold?: boolean;
  isBannerImage?: boolean;
  isFirstInGrid?: boolean;
  viewport?: 'mobile' | 'tablet' | 'desktop';
}): boolean => {
  const { 
    index, 
    isHeroImage, 
    isAboveFold, 
    isBannerImage, 
    isFirstInGrid,
    viewport = 'desktop' 
  } = options;

  // Always prioritize hero and banner images
  if (isHeroImage || isBannerImage) return true;
  
  // Prioritize images explicitly marked as above fold
  if (isAboveFold) return true;
  
  // Prioritize first image in grids/lists
  if (isFirstInGrid) return true;
  
  // Prioritize based on position and viewport
  if (typeof index === 'number') {
    switch (viewport) {
      case 'mobile':
        return index === 0; // Only first image on mobile
      case 'tablet':
        return index < 2; // First 2 images on tablet
      case 'desktop':
        return index < 3; // First 3 images on desktop
      default:
        return index < 2;
    }
  }
  
  return false;
};

/**
 * Gets optimized image dimensions based on common breakpoints
 * @param originalWidth Original image width
 * @param originalHeight Original image height
 * @param maxWidth Maximum width for the context
 * @returns Optimized dimensions
 */
export const getOptimizedDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth = 1200
): { width: number; height: number } => {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio)
  };
};

/**
 * Common image contexts for priority determination
 */
export const ImageContext = {
  HERO: { isHeroImage: true, isAboveFold: true },
  BANNER: { isBannerImage: true, isAboveFold: true },
  FIRST_IN_GRID: { isFirstInGrid: true, index: 0 },
  ABOVE_FOLD: { isAboveFold: true },
  CARD_IMAGE: { isAboveFold: false },
  CONTENT_IMAGE: { isAboveFold: false }
} as const;

/**
 * Responsive breakpoints for image sizing
 */
export const ResponsiveBreakpoints = {
  MOBILE: { maxWidth: 480, descriptor: '480w' },
  TABLET: { maxWidth: 768, descriptor: '768w' },
  DESKTOP: { maxWidth: 1200, descriptor: '1200w' },
  LARGE: { maxWidth: 1920, descriptor: '1920w' }
} as const;
