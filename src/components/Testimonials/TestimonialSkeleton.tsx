'use client';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

interface TestimonialSkeletonProps {
  count?: number;
}

export function TestimonialSkeleton({ count = 3 }: TestimonialSkeletonProps) {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  return (
    <Box direction="row" gap={8} className="">
      {Array.from({ length: count }, (_, index) => (
        <Box key={index} direction="row" className="w-full">
          {/* Headshot skeleton - should be square and match typical headshot dimensions */}
          <Box className="bg-blue relative overflow-hidden flex-shrink-0">
            <SkeletonBox className="h-80 w-48" />
          </Box>

          {/* Content skeleton - should fill remaining space */}
          <Box direction="col" className="bg-subtle h-full justify-between p-[1.5rem] flex-1">
            {/* Quote skeleton - multiple lines */}
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>

            {/* Author info skeleton */}
            <Box direction="col">
              <SkeletonBox className="h-4 w-28 mb-1" />
              <SkeletonBox className="h-3 w-24" />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
