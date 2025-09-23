'use client';

import { Box, Container, Section } from '@/components/global/matic-ds';
import { cn } from '@/lib/utils';

export function CtaBannerSkeleton() {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  return (
    <Section className="relative w-full overflow-hidden">
      {/* Background gradient image skeleton */}
      <SkeletonBox className="absolute inset-0 h-full w-full rounded-none" />

      {/* Background image with fade effect skeleton */}
      <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_right,black_20%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_right,black_20%,transparent_70%)]">
        <SkeletonBox className="absolute inset-0 h-full w-full rounded-none" />
      </div>

      <Container className="relative z-20 h-[335px]">
        <Box cols={{ base: 1, md: 4, lg: 5 }} className="h-[335px] items-center">
          <Box
            direction="col"
            gap={6}
            className="text-white max-md:items-center md:col-span-2 md:col-start-3 lg:col-span-2 lg:col-start-4"
          >
            <Box direction="col" gap={2} className="max-md:items-center">
              {/* Title skeleton */}
              <SkeletonBox className="h-12 w-80 max-md:mx-auto" />

              {/* Description skeleton */}
              <div className="max-w-xs max-md:mx-auto lg:max-w-sm">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="mt-2 h-4 w-4/5" />
              </div>
            </Box>

            <Box wrap={true} gap={3} className="max-md:items-center">
              {/* Primary CTA button skeleton */}
              <SkeletonBox className="h-12 w-40" />

              {/* Secondary CTA button skeleton */}
              <SkeletonBox className="h-12 w-36" />
            </Box>
          </Box>
        </Box>
      </Container>
    </Section>
  );
}
