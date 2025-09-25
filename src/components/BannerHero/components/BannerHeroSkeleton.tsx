'use client';

import { cn } from '@/lib/utils';

import { Section } from '@/components/global/matic-ds';

import { SectionHeadingSkeleton } from '@/components/SectionHeading/SectionHeadingSkeleton';

interface BannerHeroSkeletonProps {
  variant?: 'Horizontal' | 'Stacked' | 'Centered' | 'Default';
  contentType?: string;
}

export function BannerHeroSkeleton({ variant = 'Default', contentType }: BannerHeroSkeletonProps) {
  const isCenteredSectionHeading = variant === 'Centered';
  const isImageBetween = contentType === 'ImageBetween';

  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  return (
    <Section
      className={cn(
        'relative flex h-[789px]',
        isCenteredSectionHeading || isImageBetween ? 'items-center' : 'items-end',
        'dark'
      )}
    >
      {/* Background Image Skeleton */}
      <SkeletonBox className="absolute inset-0 h-[789px] w-full rounded-none" />

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto w-full px-6 lg:px-8">
        <SectionHeadingSkeleton
          variant={variant}
          componentType="banner-hero"
          hasDescription={true}
          hasCtaCollection={true}
        />
      </div>
    </Section>
  );
}
