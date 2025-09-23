'use client';

import { Box } from '@/components/global/matic-ds';

interface LocationSkeletonProps {
  variant?: string;
}

export const OfficeLocationSkeleton: React.FC<LocationSkeletonProps> = ({ variant }) => {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-gray-300 ${className ?? ''}`} {...props} />
  );

  // Featured variant - larger layout for the first location
  if (variant === 'featured') {
    return (
      <Box direction="col" gap={0}>
        {/* Image skeleton */}
        <SkeletonBox className="h-64 w-full" />

        <Box direction="col" gap={4} className="bg-subtle p-8">
          {/* Headquarters title skeleton */}
          <SkeletonBox className="h-8 w-48" />

          {/* City, state skeleton */}
          <SkeletonBox className="h-6 w-32" />

          <Box gap={2} className="flex-col justify-between md:flex-row">
            {/* Address skeleton */}
            <SkeletonBox className="h-4 w-full md:w-3/4" />
            {/* Phone skeleton */}
            <SkeletonBox className="h-4 w-32" />
          </Box>
        </Box>
      </Box>
    );
  }

  // Grid variant - smaller layout for remaining locations
  if (variant === 'grid') {
    return (
      <Box direction="col" gap={0}>
        {/* Image skeleton */}
        <SkeletonBox className="h-40 w-full" />

        <Box direction="col" gap={2} className="bg-subtle p-8">
          {/* Country skeleton */}
          <SkeletonBox className="h-5 w-24" />

          {/* City, state skeleton */}
          <SkeletonBox className="h-4 w-28" />

          <Box direction="col" gap={1}>
            {/* Address skeleton */}
            <SkeletonBox className="h-3 w-full" />
            {/* Phone skeleton */}
            <SkeletonBox className="h-3 w-32" />
          </Box>
        </Box>
      </Box>
    );
  }

  // Default variant - original layout
  return (
    <Box direction="col" gap={4} className="rounded-lg border border-gray-200 p-6">
      {/* Image skeleton */}
      <Box className="mb-4">
        <SkeletonBox className="h-48 w-full" />
      </Box>

      <Box direction="col" gap={2}>
        {/* City, state, country skeleton */}
        <SkeletonBox className="h-5 w-40" />

        <Box direction="col" gap={1}>
          {/* Address skeleton */}
          <SkeletonBox className="h-3 w-full" />
          {/* Phone skeleton */}
          <SkeletonBox className="h-3 w-32" />
        </Box>
      </Box>
    </Box>
  );
};
