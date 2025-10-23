'use client';

import { useEffect, useState } from 'react';

/**
 * Content Stabilizer Component
 * Prevents layout shifts during dynamic content loading
 */

interface ContentStabilizerProps {
  children: React.ReactNode;
  minHeight?: number;
  reserveSpace?: boolean;
  className?: string;
}

export function ContentStabilizer({ 
  children, 
  minHeight = 200,
  reserveSpace = true,
  className = ''
}: ContentStabilizerProps) {
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      setIsContentLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!isContentLoaded && reserveSpace) {
    return (
      <div 
        className={`${className}`}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: reserveSpace ? `${minHeight}px` : undefined }}>
      {children}
    </div>
  );
}

/**
 * Hero Content Stabilizer
 * Specifically for hero sections that might cause large layout shifts
 */
interface HeroContentStabilizerProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroContentStabilizer({ children, className = '' }: HeroContentStabilizerProps) {
  return (
    <div className={`relative min-h-[60vh] flex items-center justify-center ${className}`}>
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="text-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Text Content Stabilizer
 * Prevents layout shifts from dynamic text content
 */
interface TextStabilizerProps {
  children: React.ReactNode;
  lines?: number;
  className?: string;
}

export function TextStabilizer({ children, lines = 2, className = '' }: TextStabilizerProps) {
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    setHasContent(true);
  }, []);

  if (!hasContent) {
    return (
      <div className={className}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`bg-gray-200 rounded animate-pulse mb-2 ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{ height: '1.5rem' }}
          />
        ))}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
