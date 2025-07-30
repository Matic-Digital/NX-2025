import React from 'react';
import Image from 'next/image';

interface AirImageProps {
  sys?: { id: string };
  internalName?: string;
  link?: string;
  altText?: string;
  __typename?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * AirImage component that displays an image from Contentful
 * Uses the link field as the src and altText for accessibility
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

  return (
    <Image
      src={link}
      alt={altText ?? ''}
      className={className}
      width={width ?? 300} // Providing default width for Next.js Image
      height={height ?? 200} // Providing default height for Next.js Image
      priority={priority}
    />
  );
};

export default AirImage;
