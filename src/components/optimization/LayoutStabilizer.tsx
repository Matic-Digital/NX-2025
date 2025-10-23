'use client';

import { useEffect, useState } from 'react';

/**
 * Layout Stabilizer Component
 * Prevents layout shifts by reserving space and managing loading states
 */

interface LayoutStabilizerProps {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
}

export function LayoutStabilizer({ 
  children, 
  minHeight = 'min-h-[60vh]',
  className = '' 
}: LayoutStabilizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure fonts and critical resources are loaded
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${minHeight} ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      {children}
    </div>
  );
}

/**
 * Hero Section Stabilizer
 * Specifically for hero sections with complex layouts
 */
interface HeroStabilizerProps {
  children: React.ReactNode;
  expectedHeight?: number;
}

export function HeroStabilizer({ children, expectedHeight = 800 }: HeroStabilizerProps) {
  return (
    <div 
      className="relative w-full"
      style={{ minHeight: `${expectedHeight}px` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/**
 * Icon Stabilizer
 * Prevents icon layout shifts during font loading
 */
interface IconStabilizerProps {
  width: number;
  height: number;
  children: React.ReactNode;
  ariaLabel?: string;
}

export function IconStabilizer({ width, height, children, ariaLabel }: IconStabilizerProps) {
  return (
    <div
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-label={ariaLabel}
      role="img"
    >
      {children}
    </div>
  );
}
