'use client';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

export function ProductCardSkeleton() {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  return (
    <div className="group flex flex-col">
      <Box direction="col" gap={4}>
        {/* Icon container skeleton */}
        <Box className="w-fit bg-black p-[0.38rem]">
          <SkeletonBox className="h-[60px] w-[60px] rounded" />
        </Box>

        <Box direction="row" gap={2} className="items-center">
          {/* Title skeleton */}
          <SkeletonBox className="h-6 w-32" />
          {/* Arrow icon skeleton */}
          <div className="opacity-0 group-hover:opacity-100">
            <SkeletonBox className="h-[29px] w-[30px]" />
          </div>
        </Box>

        {/* Description skeleton */}
        <SkeletonBox className="h-4 w-full" />
      </Box>
    </div>
  );
}
