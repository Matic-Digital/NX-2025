'use client';

import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
}

/**
 * Image skeleton component that matches the design system
 * Provides consistent loading states for images across the application
 */
export function ImageSkeleton({ 
  width, 
  height, 
  className, 
  aspectRatio = 'auto' 
}: ImageSkeletonProps) {
  // Generate aspect ratio classes
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'auto':
      default:
        return '';
    }
  };

  const aspectRatioClasses = getAspectRatioClasses();

  // Create inline styles for specific dimensions
  const inlineStyles = (width && height) ? { 
    width, 
    height,
    maxWidth: width,
    maxHeight: height,
    minWidth: width,
    minHeight: height
  } : undefined;

  return (
    <div
      className={cn(
        // Base skeleton styles matching the design system
        'animate-pulse rounded bg-gray-300',
        // Default sizing if no specific dimensions and no aspect ratio
        !inlineStyles && !aspectRatioClasses && 'h-64 w-full',
        // Aspect ratio classes (only when no specific dimensions)
        !inlineStyles && aspectRatioClasses,
        // When we have specific dimensions, behave like an image element
        inlineStyles && 'block',
        // When using responsive classes without fixed dimensions, ensure proper containment
        !inlineStyles && className && (className.includes('w-full') || className.includes('h-full')) && 'max-w-full max-h-full',
        // Custom className (includes object-fit and positioning classes)
        className
      )}
      style={inlineStyles}
      role="img"
      aria-label="Loading image..."
    >
      {/* Optional loading indicator */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          {/* Simple loading icon using CSS */}
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight image skeleton without loading indicator
 * For cases where you just need the skeleton shape
 */
export function ImageSkeletonSimple({ 
  width, 
  height, 
  className, 
  aspectRatio = 'auto' 
}: ImageSkeletonProps) {
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'auto':
      default:
        return '';
    }
  };

  const aspectRatioClasses = getAspectRatioClasses();
  const inlineStyles = (width && height) ? { 
    width, 
    height,
    maxWidth: width,
    maxHeight: height,
    minWidth: width,
    minHeight: height
  } : undefined;

  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gray-300',
        !inlineStyles && !aspectRatioClasses && 'h-64 w-full',
        !inlineStyles && aspectRatioClasses,
        inlineStyles && 'block',
        !inlineStyles && className && (className.includes('w-full') || className.includes('h-full')) && 'max-w-full max-h-full',
        className
      )}
      style={inlineStyles}
      role="img"
      aria-label="Loading image..."
    />
  );
}
