'use client';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

interface ContentSkeletonProps {
  variant?: 'ContentLeft' | 'ContentCenter' | 'ContentRight' | 'FullWidth';
  contentType?: 'Product' | 'SectionHeading' | 'ContentGridItem';
}

export function ContentSkeleton({
  variant = 'ContentLeft',
  contentType = 'SectionHeading'
}: ContentSkeletonProps) {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  const ContentContainer = ({ children }: { children: React.ReactNode }) => (
    <div
      className={cn(
        'relative container mx-auto mt-12 mb-20 h-[502px] overflow-hidden px-6 sm:px-6 md:px-9'
      )}
    >
      {children}
    </div>
  );

  const ContentOverlay = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex h-full w-full max-w-[558px] p-6 backdrop-blur-[14px] sm:p-8 md:p-10"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  );

  if (variant === 'ContentLeft') {
    return (
      <ContentContainer>
        <div className="relative h-full overflow-hidden px-6 sm:px-6 md:px-9">
          {/* Background Image Skeleton */}
          <SkeletonBox className="absolute inset-0 h-full w-full rounded-none" />
        </div>
        <div className="absolute inset-0 flex items-center px-6 sm:px-6 md:px-9">
          <ContentOverlay>
            <Box
              direction="col"
              gap={12}
              className="w-full items-center justify-center text-center"
            >
              <Box direction="col" gap={5}>
                <Box direction="col" gap={6}>
                  {/* Tags/Overline skeleton */}
                  {(contentType === 'Product' || contentType === 'SectionHeading') && (
                    <SkeletonBox className="mx-auto h-4 w-24" />
                  )}
                  {contentType === 'ContentGridItem' && (
                    <SkeletonBox className="mx-auto h-4 w-32" />
                  )}

                  {/* Title skeleton */}
                  <SkeletonBox className="mx-auto h-8 w-64 max-w-xl" />
                </Box>

                {/* Description skeleton */}
                <div className="space-y-2">
                  <SkeletonBox className="mx-auto h-4 w-full max-w-sm" />
                  <SkeletonBox className="mx-auto h-4 w-4/5 max-w-sm" />
                </div>
              </Box>

              {/* Button skeleton */}
              <SkeletonBox className="h-10 w-32" />
            </Box>
          </ContentOverlay>
        </div>
      </ContentContainer>
    );
  }

  if (variant === 'ContentCenter') {
    return (
      <ContentContainer>
        {/* Background Image Skeleton */}
        <SkeletonBox className="absolute inset-0 h-full w-full rounded-none px-6 md:px-9" />
        <Box
          direction="col"
          gap={12}
          className="relative h-full w-full items-center justify-center text-center"
        >
          <Box direction="col" gap={5}>
            <Box direction="col" gap={1.5}>
              {/* Tags/Overline skeleton */}
              {contentType === 'Product' && <SkeletonBox className="mx-auto h-4 w-28" />}
              {contentType !== 'Product' && <SkeletonBox className="mx-auto h-4 w-24" />}

              {/* Title skeleton */}
              <SkeletonBox className="mx-auto h-10 w-64" />
            </Box>

            {/* Description skeleton */}
            <div className="mx-auto max-w-lg space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-4/5" />
            </div>

            {/* Button(s) skeleton */}
            <div className="flex justify-center gap-3">
              <SkeletonBox className="h-10 w-32" />
              {contentType === 'SectionHeading' && <SkeletonBox className="h-10 w-28" />}
            </div>
          </Box>
        </Box>
      </ContentContainer>
    );
  }

  // Default/ContentRight/FullWidth variant
  return (
    <ContentContainer>
      {/* Background Image Skeleton */}
      <SkeletonBox className="absolute inset-0 h-full w-full rounded-none" />
      <div className="relative flex h-full items-center justify-center p-10">
        {/* SectionHeading skeleton content */}
        <div className="text-center">
          <Box direction="col" gap={6}>
            {/* Overline skeleton */}
            <SkeletonBox className="mx-auto h-4 w-24" />

            {/* Title skeleton */}
            <SkeletonBox className="mx-auto h-12 w-80" />

            {/* Description skeleton */}
            <div className="mx-auto max-w-2xl space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-4/5" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>

            {/* CTA buttons skeleton */}
            <div className="flex justify-center gap-3">
              <SkeletonBox className="h-12 w-36" />
              <SkeletonBox className="h-12 w-32" />
            </div>
          </Box>
        </div>
      </div>
    </ContentContainer>
  );
}
