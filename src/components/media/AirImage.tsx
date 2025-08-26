'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { AirImage as AirImageType } from '@/types/contentful/Image';
import { getImageById } from '@/lib/contentful-api/image';

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
    console.log('AirImage: No link found in props');
    return null;
  }

  // Use higher default resolutions for better quality
  const defaultWidth = width ?? 1208;
  const defaultHeight = height ?? 800;

  // Optimize the Contentful image URL
  const optimizedSrc = optimizeContentfulImage(link, defaultWidth, defaultHeight, 85);

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
