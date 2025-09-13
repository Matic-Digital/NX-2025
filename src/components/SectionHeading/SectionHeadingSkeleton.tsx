import * as React from 'react';
import { Box } from '@/components/global/matic-ds';
import { cn } from '@/lib/utils';

interface SectionHeadingSkeletonProps {
  variant?: 'Horizontal' | 'Stacked' | 'Centered' | 'Default';
  componentType?: string;
  hasSolutionItems?: boolean;
  hasCtaCollection?: boolean;
  hasDescription?: boolean;
  hasOverline?: boolean;
}

export function SectionHeadingSkeleton({
  variant = 'Default',
  componentType,
  hasSolutionItems = false,
  hasCtaCollection = false,
  hasDescription = true,
  hasOverline = false
}: SectionHeadingSkeletonProps) {
  const isContentComponent = componentType === 'content';
  const gap = hasCtaCollection ? 12 : 0;
  const cols = { base: 1, md: 2, xl: hasCtaCollection ? 3 : 2 };

  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-200', className)} {...props} />
  );

  const HorizontalSectionHeadingSkeleton = () => (
    <Box
      gap={hasCtaCollection ? { base: 4, md: 12 } : 6}
      direction={{ base: 'col', md: 'row' }}
      cols={{ base: 1, md: 2, xl: 3 }}
      className="items-end"
    >
      {/* title skeleton */}
      <SkeletonBox className="col-span-2 h-16 w-full max-w-sm md:max-w-lg lg:h-20 lg:max-w-3xl" />

      {/* cta section skeleton */}
      <Box
        direction={hasCtaCollection ? 'col' : 'row'}
        gap={8}
        className="col-span-2 w-full max-w-sm lg:max-w-md xl:col-span-1 xl:ml-auto xl:max-w-lg xl:items-end"
      >
        {hasDescription && <SkeletonBox className="h-6 w-full lg:h-8" />}

        <Box gap={3} className="col-span-1 items-end xl:ml-auto">
          {hasCtaCollection && (
            <>
              <SkeletonBox className="h-10 w-24" />
              <SkeletonBox className="h-10 w-20" />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );

  const StackedSectionHeadingSkeleton = () => (
    <Box direction="col" gap={12}>
      {/* title skeleton */}
      <SkeletonBox className="h-16 w-full max-w-4xl lg:h-20" />

      {/* cta section skeleton */}
      <Box direction={{ base: 'col', md: 'row' }} gap={8} className="w-full">
        {hasDescription && <SkeletonBox className="h-6 w-full max-w-2xl lg:h-8" />}

        <Box gap={3} className="items-end lg:ml-auto">
          {hasCtaCollection && (
            <>
              <SkeletonBox className="h-10 w-24" />
              <SkeletonBox className="h-10 w-20" />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );

  const CenteredSectionHeadingSkeleton = () => (
    <Box direction="col" gap={6} className="items-center text-center">
      {/* title skeleton */}
      <SkeletonBox className="col-span-full h-16 w-full max-w-4xl lg:h-20" />

      {/* cta section skeleton */}
      <Box direction="col" gap={8} className="col-span-full w-full items-center">
        {hasDescription && <SkeletonBox className="h-6 w-full max-w-2xl lg:h-8" />}

        <Box gap={3} className="items-center justify-center">
          {hasCtaCollection && (
            <>
              <SkeletonBox className="h-10 w-24" />
              <SkeletonBox className="h-10 w-20" />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );

  const DefaultSectionHeadingSkeleton = () => (
    <Box cols={cols} gap={gap}>
      {/* overline, title and description skeleton */}
      <Box
        direction="col"
        gap={{ base: 2, md: 4 }}
        className={cn(
          'col-span-2 max-w-[600px]',
          !hasCtaCollection && 'max-w-5xl',
          hasSolutionItems && 'min-w-[22.3rem]'
        )}
      >
        {hasOverline && <SkeletonBox className="h-4 w-24" />}
        <SkeletonBox className="h-12 w-full lg:h-18" />
        {hasDescription && (
          <>
            <SkeletonBox className="h-6 w-2/3" />
            <SkeletonBox className="h-6 w-2/3" />
          </>
        )}
      </Box>

      {/* cta skeleton */}
      <Box
        gap={2}
        className={cn('col-span-1 items-end xl:ml-auto', {
          'items-center': isContentComponent
        })}
      >
        {hasCtaCollection && (
          <>
            <SkeletonBox className="h-10 w-36" />
            <SkeletonBox className="h-10 w-36" />
          </>
        )}
      </Box>
    </Box>
  );

  switch (variant) {
    case 'Horizontal':
      return <HorizontalSectionHeadingSkeleton />;
    case 'Stacked':
      return <StackedSectionHeadingSkeleton />;
    case 'Centered':
      return <CenteredSectionHeadingSkeleton />;
    default:
      return <DefaultSectionHeadingSkeleton />;
  }
}
