'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { getImageById } from '@/components/Image/ImageApi';
import { ImageSkeleton } from '@/components/Image/ImageSkeleton';
import { shouldPreloadImage as _shouldPreloadImage } from '@/components/Image/utils/imageOptimization';

import type { AirImage as AirImageType } from '@/components/Image/ImageSchema';

/**
 * Extracts width and height from Air imgix URLs
 * @param url - Air imgix URL (e.g., https://air-prod.imgix.net/image.jpg?w=2880&h=1560&...)
 * @returns Object with width and height, or null if not found
 */
const extractDimensionsFromAirUrl = (url: string): { width: number; height: number } | null => {
  if (!url.includes('air-prod.imgix.net')) {
    return null; // Not an Air imgix URL
  }

  try {
    const urlObj = new URL(url);
    const width = urlObj.searchParams.get('w');
    const height = urlObj.searchParams.get('h');

    if (width && height) {
      return {
        width: parseInt(width, 10),
        height: parseInt(height, 10)
      };
    }
  } catch {}

  return null;
};

/**
 * Optimizes Air imgix URLs for better performance
 * @param url - Original Air imgix URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
const optimizeAirImage = (
  url: string,
  width?: number,
  height?: number,
  quality = 60 // Reduced from 75 for better compression
): string => {
  if (!url.includes('air-prod.imgix.net')) {
    return url; // Not an Air imgix URL
  }

  try {
    const urlObj = new URL(url);

    // Optimize for better compression and performance
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());

    // Enhanced compression settings
    urlObj.searchParams.set('auto', 'compress,format'); // Auto-optimize format and compression
    urlObj.searchParams.set('q', quality.toString()); // Aggressive compression for mobile
    urlObj.searchParams.set('fit', 'crop'); // Better cropping for responsive images
    urlObj.searchParams.set('crop', 'smart'); // Smart cropping to focus on important content

    return urlObj.toString();
  } catch {
    return url;
  }
};

/**
 * Optimizes Contentful image URLs for better quality and performance
 * @param url - Original Contentful image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
const optimizeContentfulImage = (
  url: string,
  width?: number,
  height?: number,
  quality = 60 // Reduced from 75 for better compression
): string => {
  if (!url.includes('images.ctfassets.net') && !url.includes('assets.ctfassets.net')) {
    return url; // Not a Contentful image, return as-is
  }

  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('fm', 'webp'); // Use WebP format for better compression
  params.set('q', quality.toString()); // Aggressive compression for mobile
  params.set('fit', 'fill'); // Ensure image fills the dimensions

  return `${url}?${params.toString()}`;
};

/**
 * Generates responsive image srcset for different screen sizes
 * @param baseUrl - Base image URL
 * @param width - Base width
 * @param height - Base height
 * @param className - CSS classes to determine optimal sizes
 * @returns srcset string for responsive images
 */
const generateSrcSet = (
  baseUrl: string,
  width: number,
  height: number,
  className?: string
): string => {
  const isAirImage = baseUrl.includes('air-prod.imgix.net');
  const isContentfulImage =
    baseUrl.includes('images.ctfassets.net') ?? baseUrl.includes('assets.ctfassets.net');

  if (!isAirImage && !isContentfulImage) {
    return '';
  }

  // Generate sizes based on actual render dimensions, not fixed breakpoints
  const hasFullWidth = className?.includes('w-full');
  const isHero = className?.includes('hero') ?? className?.includes('banner');

  let sizes: { w: number; descriptor: string }[];

  if (hasFullWidth || isHero) {
    // Full-width images: generate sizes for common viewport widths
    sizes = [
      { w: 480, descriptor: '480w' }, // Mobile
      { w: 768, descriptor: '768w' }, // Tablet
      { w: 1024, descriptor: '1024w' }, // Small desktop
      { w: 1280, descriptor: '1280w' }, // Medium desktop
      { w: 1440, descriptor: '1440w' }, // Large desktop
      { w: 1920, descriptor: '1920w' } // Extra large
    ];
  } else {
    // Content images: generate sizes based on actual dimensions
    const baseWidth = Math.min(width, 1200); // Cap at reasonable size
    sizes = [
      { w: Math.round(baseWidth * 0.4), descriptor: `${Math.round(baseWidth * 0.4)}w` },
      { w: Math.round(baseWidth * 0.6), descriptor: `${Math.round(baseWidth * 0.6)}w` },
      { w: Math.round(baseWidth * 0.8), descriptor: `${Math.round(baseWidth * 0.8)}w` },
      { w: baseWidth, descriptor: `${baseWidth}w` },
      { w: Math.round(baseWidth * 1.2), descriptor: `${Math.round(baseWidth * 1.2)}w` }
    ];
  }

  // Filter out duplicate sizes and sort
  const uniqueSizes = sizes
    .filter((size, index, arr) => arr.findIndex((s) => s.w === size.w) === index)
    .sort((a, b) => a.w - b.w);

  return uniqueSizes
    .map(({ w, descriptor }) => {
      const h = Math.round((height * w) / width);
      // Use higher quality for smaller images, lower for larger
      const quality = w <= 768 ? 85 : w <= 1280 ? 75 : 65;
      const optimizedUrl = isAirImage
        ? optimizeAirImage(baseUrl, w, h, quality)
        : optimizeContentfulImage(baseUrl, w, h, quality);
      return `${optimizedUrl} ${descriptor}`;
    })
    .join(', ');
};

/**
 * Calculates optimal intrinsic dimensions based on CSS context to match rendered size
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param className - CSS classes that affect sizing
 * @returns Object with optimized width and height
 */
const calculateIntrinsicDimensions = (
  originalWidth: number,
  originalHeight: number,
  className?: string
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  // Parse specific height constraints from Tailwind classes
  const heightMatch = className?.match(/h-\[([0-9.]+)rem\]/);
  if (heightMatch?.[1]) {
    const heightRem = parseFloat(heightMatch[1]);
    const heightPx = heightRem * 16; // Convert rem to pixels (assuming 16px base)
    return {
      width: Math.round(heightPx * aspectRatio),
      height: Math.round(heightPx)
    };
  }

  // Check for fixed height classes
  const fixedHeightMap: Record<string, number> = {
    'h-64': 256, // 16rem
    'h-72': 288, // 18rem
    'h-80': 320, // 20rem
    'h-96': 384, // 24rem
    'h-full': 800 // Assume reasonable default for h-full
  };

  // Also check for max-height classes that might constrain the image
  const maxHeightMatch = className?.match(/max-h-\[([0-9.]+)rem\]/);
  if (maxHeightMatch?.[1]) {
    const maxHeightRem = parseFloat(maxHeightMatch[1]);
    const maxHeightPx = maxHeightRem * 16;
    const constrainedHeight = Math.min(originalHeight, maxHeightPx);
    return {
      width: Math.round(constrainedHeight * aspectRatio),
      height: constrainedHeight
    };
  }

  for (const [heightClass, heightPx] of Object.entries(fixedHeightMap)) {
    if (className?.includes(heightClass)) {
      return {
        width: Math.round(heightPx * aspectRatio),
        height: heightPx
      };
    }
  }

  // For full-width images, calculate based on common container widths
  const hasFullWidth = className?.includes('w-full');
  const isAbsolute = className?.includes('absolute');
  const isInset = className?.includes('inset-0');

  if (hasFullWidth || (isAbsolute && isInset)) {
    // Assume container max-width of 1440px for full-width images
    const containerWidth = 1440;
    const containerHeight = Math.round(containerWidth / aspectRatio);

    // Cap at reasonable dimensions to avoid oversized images
    return {
      width: Math.min(containerWidth, originalWidth),
      height: Math.min(containerHeight, originalHeight)
    };
  }

  // For content images, use responsive sizing based on typical usage
  const maxContentWidth = 800;
  if (originalWidth > maxContentWidth) {
    return {
      width: maxContentWidth,
      height: Math.round(maxContentWidth / aspectRatio)
    };
  }

  // Use original dimensions if they're already reasonable
  return {
    width: originalWidth,
    height: originalHeight
  };
};

/**
 * Generates responsive sizes attribute based on className usage patterns
 * @param className - CSS classes applied to the image
 * @param priority - Whether this is a priority image
 * @param intrinsicWidth - The calculated intrinsic width
 * @returns sizes string for responsive images
 */
const generateSizes = (className?: string, priority?: boolean, intrinsicWidth?: number): string => {
  const hasFullWidth = className?.includes('w-full');
  const hasFullHeight = className?.includes('h-full');
  const isAbsolute = className?.includes('absolute');
  const isObjectCover = className?.includes('object-cover');
  const isHero = className?.includes('hero') ?? className?.includes('banner');

  // Check for specific height constraints
  const heightMatch = className?.match(/h-\[([0-9.]+)rem\]/);
  if (heightMatch?.[1]) {
    const heightRem = parseFloat(heightMatch[1]);
    const heightPx = heightRem * 16;
    // For fixed height images, size based on the height constraint
    return `(max-width: 640px) 100vw, (max-width: 1024px) 90vw, ${Math.round(heightPx * 1.5)}px`;
  }

  if (hasFullWidth && hasFullHeight && (isAbsolute || isObjectCover)) {
    // Full container images (like hero banners) - viewport width
    return '100vw';
  }

  if (hasFullWidth || isHero) {
    // Full width images - use container-aware sizing
    return '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 1440px';
  }

  if (priority) {
    // For LCP images, be more precise with sizing
    const maxWidth = intrinsicWidth ? Math.min(intrinsicWidth, 1200) : 1200;
    return `(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, ${maxWidth}px`;
  }

  // Standard content images - use calculated dimensions
  if (intrinsicWidth && intrinsicWidth <= 800) {
    // Small images - don't over-size them
    return `(max-width: 480px) 100vw, (max-width: 768px) 60vw, ${Math.min(intrinsicWidth, 600)}px`;
  }

  // Medium to large content images
  const maxWidth = intrinsicWidth ? Math.min(intrinsicWidth, 800) : 600;
  return `(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 60vw, ${maxWidth}px`;
};

/**
 * Determines if an image should be treated as priority based on usage context
 * @param className - CSS classes applied to the image
 * @param priority - Explicit priority prop
 * @returns boolean indicating if image should be priority
 */
const shouldBePriority = (className?: string, priority?: boolean): boolean => {
  if (priority !== undefined) return priority;

  // Auto-detect priority images based on common patterns
  const hasFullWidth = className?.includes('w-full');
  const hasFullHeight = className?.includes('h-full');
  const isAbsolute = className?.includes('absolute');
  const isHero = className?.includes('hero') ?? className?.includes('banner');

  // Full-size images that are likely above the fold
  return Boolean(hasFullWidth && hasFullHeight && (isAbsolute ?? isHero));
};

/**
 * AirImage component that displays an image from Contentful
 * Uses the link field as the src and altText for accessibility
 * Automatically optimizes Contentful images for better quality
 */
export const AirImage: React.FC<AirImageType> = (props) => {
  const [fullImageData, setFullImageData] = useState<AirImageType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use full image data if available, otherwise fall back to props
  const imageData = fullImageData ?? props;
  const { sys, link, altText, width, height, priority: explicitPriority, mobileOrigin } = imageData;
  const { className } = props;

  // Determine if this should be a priority image
  const priority = shouldBePriority(className, explicitPriority);

  // Generate alignment classes based on mobileOrigin
  const getAlignmentClasses = (origin?: string): string => {
    switch (origin) {
      case 'Left':
        return 'object-cover !object-left md:!object-center';
      case 'Center':
        return 'object-cover !object-center';
      case 'Right':
        return 'object-cover !object-right md:!object-center';
      default:
        return 'object-cover !object-center'; // Default to center if not specified
    }
  };

  const alignmentClasses = getAlignmentClasses(mobileOrigin);

  // Fetch full image data if we only have sys fields (no link)
  useEffect(() => {
    const fetchFullImageData = async () => {
      if (!sys?.id || link || isLoading) {
        return; // Already have link or already loading
      }

      setIsLoading(true);
      try {
        const fullData = await getImageById(sys.id);
        if (fullData) {
          setFullImageData(fullData);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFullImageData();
  }, [sys?.id, link, isLoading]);

  if (!link) {
    if (isLoading) {
      // Show skeleton loader with calculated dimensions to match final image
      const originalWidth = width ?? 1208;
      const originalHeight = height ?? 800;
      const { width: skeletonWidth, height: skeletonHeight } = calculateIntrinsicDimensions(
        originalWidth,
        originalHeight,
        className
      );
      return (
        <div className="relative" style={{ width: skeletonWidth, height: skeletonHeight }}>
          <ImageSkeleton width={skeletonWidth} height={skeletonHeight} className={className} />
        </div>
      );
    }
    return null;
  }

  // Extract dimensions from Air imgix URL first, then fallback to props
  const airDimensions = extractDimensionsFromAirUrl(link);
  const originalWidth = airDimensions?.width ?? width ?? 1208;
  const originalHeight = airDimensions?.height ?? height ?? 800;

  // Calculate optimal intrinsic dimensions based on CSS context
  // This ensures intrinsic size matches rendered size for better LCP
  const { width: intrinsicWidth, height: intrinsicHeight } = calculateIntrinsicDimensions(
    originalWidth,
    originalHeight,
    className
  );

  // Use original URLs to avoid hydration mismatches from URL optimization
  // Let Next.js Image component handle optimization consistently
  const optimizedSrc = link;

  // Generate responsive srcset for better performance across devices
  const _srcSet = generateSrcSet(link, intrinsicWidth, intrinsicHeight, className);
  const responsiveSizes = generateSizes(className, priority, intrinsicWidth);

  // Combine alignment classes with existing className
  const combinedClassName = className ? `${className} ${alignmentClasses}` : alignmentClasses;

  // Always render the image directly to avoid hydration mismatches
  // Use Next.js built-in loading states instead of custom skeleton

  // Use optimized images for better LCP performance
  // Note: Next.js Image component automatically generates srcset, so we don't need to pass it manually
  return (
    <Image
      src={optimizedSrc}
      alt={altText ?? ''}
      title={altText ?? ''}
      className={combinedClassName}
      width={intrinsicWidth}
      height={intrinsicHeight}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={responsiveSizes}
      quality={60} // Optimized quality for better compression
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      unoptimized={false} // Enable Next.js optimization for all images
    />
  );
};
