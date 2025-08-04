import React from 'react';
import Image from 'next/image';

interface AirImageProps {
  sys?: { id: string };
  title?: string;
  link?: string;
  altText?: string;
  __typename?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

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
export const AirImage: React.FC<AirImageProps> = (props) => {
  const {
    link,
    altText,
    className = '',
    width,
    height,
    priority = false,
    __typename = 'Image'
  } = props;

  console.log('AirImage received props:', props);

  if (!link) {
    console.log('AirImage: No link found in props');
    return null;
  }

  // Use higher default resolutions for better quality
  const defaultWidth = width ?? 1200;
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
      style={{ objectFit: 'cover' }}
    />
  );
};

export default AirImage;
