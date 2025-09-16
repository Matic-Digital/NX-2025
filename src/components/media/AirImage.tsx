'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { AirImage as AirImageType } from '@/types/contentful/Image';
import { getImageById } from '@/lib/contentful-api/image';

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
  } catch (error) {
    console.error('Failed to parse Air imgix URL:', error);
  }
  
  return null;
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
  quality = 80
): string => {
  if (!url.includes('images.ctfassets.net') && !url.includes('assets.ctfassets.net')) {
    return url; // Not a Contentful image, return as-is
  }

  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('fm', 'webp'); // Use WebP format for better compression
  params.set('q', quality.toString()); // Set quality
  params.set('fit', 'fill'); // Ensure image fills the dimensions

  return `${url}?${params.toString()}`;
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
  const { sys, link, altText, width, height, priority = false } = imageData;
  const { className } = props;

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
      } catch (error) {
        console.error('Failed to fetch full image data:', error);
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
  
  // Prioritize URL dimensions, then provided dimensions, then defaults
  const defaultWidth = airDimensions?.width ?? width ?? 1208;
  const defaultHeight = airDimensions?.height ?? height ?? 800;

  // For Air imgix URLs, enhance quality parameters while preserving dimensions
  const optimizedSrc = airDimensions 
    ? link.replace('&auto=auto', '&auto=format&q=90&sharp=1') 
    : optimizeContentfulImage(link, defaultWidth, defaultHeight, 85);

  // Use regular img tag for Air images to bypass Next.js dimension constraints
  if (airDimensions) {
    return (
      <img
        src={optimizedSrc}
        alt={altText ?? ''}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
      />
    );
  }

  // Use Next.js Image for non-Air images
  return (
    <Image
      src={optimizedSrc}
      alt={altText ?? ''}
      className={className}
      width={defaultWidth}
      height={defaultHeight}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ objectFit: 'cover' }}
    />
  );
};

export default AirImage;
