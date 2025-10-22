'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SvgIconProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * SVG Icon component that fetches SVG content and renders it inline
 * This allows for proper CSS styling including hover effects on fill/stroke
 */
export function SvgIcon({ src, alt, className, width, height }: SvgIconProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(src);

        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }

        const text = await response.text();

        // Clean up the SVG content and add proper attributes
        let cleanSvg = text;

        // Remove existing width/height attributes if they exist
        cleanSvg = cleanSvg.replace(/width="[^"]*"/g, '');
        cleanSvg = cleanSvg.replace(/height="[^"]*"/g, '');

        // Replace all fill colors with currentColor so they can be styled with CSS
        // This handles both fill="#color" and fill='#color' formats
        cleanSvg = cleanSvg.replace(/fill=["'][^"']*["']/g, 'fill="currentColor"');

        // If no fill attribute exists, add it to the svg element
        if (!cleanSvg.includes('fill=')) {
          cleanSvg = cleanSvg.replace('<svg', '<svg fill="currentColor"');
        }

        setSvgContent(cleanSvg);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SVG');
        console.error('Error fetching SVG:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      void fetchSvg();
    }
  }, [src]);

  if (isLoading) {
    return (
      <div
        className={cn('animate-pulse rounded bg-gray-300', className)}
        style={{ width: width ?? 24, height: height ?? 24 }}
        aria-label={alt ?? 'Loading icon'}
      />
    );
  }

  if (error || !svgContent) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded bg-gray-200 text-xs text-gray-500',
          className
        )}
        style={{ width: width ?? 24, height: height ?? 24 }}
        title={error ?? 'Failed to load icon'}
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={cn('inline-flex', className)}
      style={{ width: width ?? 24, height: height ?? 24 }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svgContent }}
      role="img"
      aria-label={alt ?? 'Icon'}
    />
  );
}
