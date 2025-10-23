'use client';

import type { ReactNode } from 'react';

/**
 * CLS (Cumulative Layout Shift) Fix Components
 * Address specific layout shift issues identified in your audit
 */

interface StableMainProps {
  children: ReactNode;
  className?: string;
}

/**
 * Stable Main Container
 * Fixes the -mt-25 negative margin layout shift issue
 */
export function StableMain({ children, className = '' }: StableMainProps) {
  return (
    <main className={`relative ${className}`}>
      {/* Reserve space instead of using negative margins */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </main>
  );
}

interface StableHeroProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Stable Hero Section
 * Prevents the large 0.235 layout shift in hero area
 */
export function StableHero({ children, title, subtitle }: StableHeroProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center">
      {/* Reserve space for content */}
      <div className="relative z-10 w-full flex justify-center">
        <div className="text-center max-w-4xl px-6">
          {title && (
            <div className="min-h-[4rem] flex items-center justify-center mb-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {title}
              </h1>
            </div>
          )}
          {subtitle && (
            <div className="min-h-[2rem] flex items-center justify-center mb-8">
              <p className="text-lg md:text-xl text-gray-600">
                {subtitle}
              </p>
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

interface StableSocialIconProps {
  children: ReactNode;
  ariaLabel: string;
  href?: string;
}

/**
 * Stable Social Icon
 * Prevents the 0.015 layout shift from social media icons
 */
export function StableSocialIcon({ children, ariaLabel, href }: StableSocialIconProps) {
  const iconContent = (
    <div 
      className="inline-flex items-center justify-center text-foreground hover:text-text-primary transition-colors duration-200"
      style={{ width: '24px', height: '24px' }}
      aria-label={ariaLabel}
      role="img"
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {iconContent}
      </a>
    );
  }

  return iconContent;
}

/**
 * Content Skeleton
 * Prevents layout shifts during content loading
 */
interface ContentSkeletonProps {
  lines?: number;
  className?: string;
}

export function ContentSkeleton({ lines = 3, className = '' }: ContentSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded h-4 mb-2 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Aspect Ratio Container
 * Prevents image loading layout shifts
 * 
 * Note: For image loading states, consider using ImageSkeleton component instead
 * which provides consistent skeleton styling across the application.
 */
interface AspectRatioProps {
  ratio: number; // e.g., 16/9, 4/3, 1/1
  children: ReactNode;
  className?: string;
}

export function AspectRatio({ ratio, children, className = '' }: AspectRatioProps) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="w-full"
        style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
