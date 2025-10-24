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
const generateSrcSet = (baseUrl: string, width: number, height: number, className?: string): string => {
  const isAirImage = baseUrl.includes('air-prod.imgix.net');
  const isContentfulImage = baseUrl.includes('images.ctfassets.net') ?? baseUrl.includes('assets.ctfassets.net');
  
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
      { w: 480, descriptor: '480w' },   // Mobile
      { w: 768, descriptor: '768w' },   // Tablet
      { w: 1024, descriptor: '1024w' }, // Small desktop
      { w: 1280, descriptor: '1280w' }, // Medium desktop
      { w: 1440, descriptor: '1440w' }, // Large desktop
      { w: 1920, descriptor: '1920w' }  // Extra large
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
    .filter((size, index, arr) => arr.findIndex(s => s.w === size.w) === index)
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
 * Generates responsive sizes attribute based on className usage patterns
 * @param className - CSS classes applied to the image
 * @param priority - Whether this is a priority image
 * @param intrinsicWidth - The actual width of the image
 * @returns sizes string for responsive images
 */
const generateSizes = (className?: string, priority?: boolean, intrinsicWidth?: number): string => {
  const hasFullWidth = className?.includes('w-full');
  const hasFullHeight = className?.includes('h-full');
  const isAbsolute = className?.includes('absolute');
  const isObjectCover = className?.includes('object-cover');
  const isHero = className?.includes('hero') ?? className?.includes('banner');

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

  // Standard content images - use actual dimensions when available
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
      // Show skeleton loader matching design system with exact dimensions
      const skeletonWidth = width ?? 1208;
      const skeletonHeight = height ?? 800;
      return (
        <div className="relative" style={{ width: skeletonWidth, height: skeletonHeight }}>
          <ImageSkeleton
            width={skeletonWidth}
            height={skeletonHeight}
            className={className}
          />
        </div>
      );
    }
    return null;
  }

  // Extract dimensions from Air imgix URL first, then fallback to props
  const airDimensions = extractDimensionsFromAirUrl(link);
  const originalWidth = airDimensions?.width ?? width ?? 1208;
  const originalHeight = airDimensions?.height ?? height ?? 800;

  // Use original image dimensions to let CSS handle responsive sizing
  // This ensures intrinsic size matches rendered size
  const intrinsicWidth = originalWidth;
  const intrinsicHeight = originalHeight;

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
