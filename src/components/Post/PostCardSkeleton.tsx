'use client';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

interface PostCardSkeletonProps {
  variant?: 'row' | 'featured' | 'default';
}

export function PostCardSkeleton({ variant = 'default' }: PostCardSkeletonProps) {
  const isRowVariant = variant === 'row';
  const isFeaturedVariant = variant === 'featured';

  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  return (
    <div className="group h-full">
      <Box
        direction="col"
        gap={0}
        className={cn(
          // Mobile: always column layout, Large: row layout only for row variant
          'h-full ',
          isRowVariant && '',
          isFeaturedVariant && 'h-full'
        )}
      >
        {/* Image skeleton */}
        <SkeletonBox
          className={cn(
            // Mobile: consistent height for all cards, Large: different heights for variants
            'min-h-[16rem] w-full',
            isRowVariant && '2xl:max-h-64',
            isFeaturedVariant && 'lg:min-h-[24rem] xl:min-h-[32rem]'
          )}
        />

        <Box direction="col" gap={0} className={cn('bg-subtle h-full justify-between')}>
          <Box
            direction="col"
            gap={0}
            className={cn(
              // Mobile: consistent padding for all cards, Large: different padding for variants
              'gap-[0.75rem] p-[1.5rem]',
              isRowVariant && '2xl:gap-[0.25rem] 2xl:p-[1rem]',
              isFeaturedVariant && 'lg:gap-[1rem] lg:p-[2rem]'
            )}
          >
            {/* Categories skeleton */}
            <div className="flex gap-2">
              <SkeletonBox className="h-4 w-16" />
              <SkeletonBox className="h-4 w-20" />
            </div>

            {/* Title skeleton */}
            <SkeletonBox
              className={cn(
                // Mobile: consistent sizing for all cards, Large: different sizes for variants
                'h-6 w-full',
                isFeaturedVariant && 'lg:h-8 xl:h-10',
                isRowVariant && '2xl:h-6'
              )}
            />
          </Box>

          <Box
            direction="row"
            gap={2}
            className={cn(
              // Mobile: consistent padding, Large: different padding for variants
              'items-center justify-between pl-[1.5rem]',
              isRowVariant && '2xl:pl-[1rem]'
            )}
          >
            {/* Date skeleton */}
            <SkeletonBox className="h-4 w-24" />

            {/* Arrow icon skeleton */}
            <Box
              direction="col"
              gap={0}
              className={cn(
                // Mobile: consistent padding, Large: different padding for variants
                'bg-background p-[1.25rem]',
                isRowVariant && '2xl:p-[1rem]'
              )}
            >
              <SkeletonBox className="size-12" />
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
