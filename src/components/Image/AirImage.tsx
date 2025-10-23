'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { getImageById } from '@/components/Image/ImageApi';
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
  quality = 75
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
    urlObj.searchParams.set('q', quality.toString()); // Reduce quality for better compression
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
  quality = 75
): string => {
  if (!url.includes('images.ctfassets.net') && !url.includes('assets.ctfassets.net')) {
    return url; // Not a Contentful image, return as-is
  }

  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('fm', 'webp'); // Use WebP format for better compression
  params.set('q', quality.toString()); // Improved quality for better compression
  params.set('fit', 'fill'); // Ensure image fills the dimensions

  return `${url}?${params.toString()}`;
};

/**
 * Generates responsive image srcset for different screen sizes
 * @param baseUrl - Base image URL
 * @param width - Base width
 * @param height - Base height
 * @returns srcset string for responsive images
 */
const generateSrcSet = (baseUrl: string, width: number, height: number): string => {
  const isAirImage = baseUrl.includes('air-prod.imgix.net');
  const isContentfulImage = baseUrl.includes('images.ctfassets.net') || baseUrl.includes('assets.ctfassets.net');
  
  if (!isAirImage && !isContentfulImage) {
    return '';
  }

  const sizes = [
    { w: Math.round(width * 0.5), descriptor: '480w' },
    { w: Math.round(width * 0.75), descriptor: '768w' },
    { w: width, descriptor: '1200w' },
    { w: Math.round(width * 1.5), descriptor: '1920w' }
  ];

  return sizes
    .map(({ w, descriptor }) => {
      const h = Math.round((height * w) / width);
      const optimizedUrl = isAirImage 
        ? optimizeAirImage(baseUrl, w, h, 75)
        : optimizeContentfulImage(baseUrl, w, h, 75);
      return `${optimizedUrl} ${descriptor}`;
    })
    .join(', ');
};

/**
 * Generates optimized sizes attribute based on common breakpoints
 * @param priority - Whether this is a priority image
 * @returns sizes string for responsive images
 */
const generateSizes = (priority?: boolean): string => {
  if (priority) {
    // For LCP images, be more aggressive with sizing
    return '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
  }
  return '(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 50vw, 600px';
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
  const { sys, link, altText, width, height, priority = false, mobileOrigin } = imageData;
  const { className } = props;

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
      // Show loading placeholder
      return (
        <div
          className={`${className} flex animate-pulse items-center justify-center bg-gray-200`}
          style={{ width: width ?? 1208, height: height ?? 800 }}
        >
          <span className="text-gray-500">Loading...</span>
        </div>
      );
    }
    return null;
  }

  // Extract dimensions from Air imgix URL first, then fallback to props
  const airDimensions = extractDimensionsFromAirUrl(link);

  // Always use original Air dimensions if available, otherwise use provided or defaults
  const intrinsicWidth = airDimensions?.width ?? width ?? 1208;
  const intrinsicHeight = airDimensions?.height ?? height ?? 800;

  // Optimize both Air and Contentful images for better performance
  const optimizedSrc = airDimensions
    ? optimizeAirImage(link, intrinsicWidth, intrinsicHeight, 75)
    : optimizeContentfulImage(link, intrinsicWidth, intrinsicHeight, 75);

  // Generate responsive srcset for better performance across devices
  const _srcSet = generateSrcSet(link, intrinsicWidth, intrinsicHeight);
  const responsiveSizes = generateSizes(priority);

  // Combine alignment classes with existing className
  const combinedClassName = className ? `${className} ${alignmentClasses}` : alignmentClasses;

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
      sizes={responsiveSizes}
      quality={75} // Optimized quality for better compression
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      unoptimized={false} // Enable Next.js optimization for all images
    />
  );
};
