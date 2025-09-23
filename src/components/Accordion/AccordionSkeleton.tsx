'use client';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

interface AccordionSkeletonProps {
  itemCount?: number;
}

export function AccordionSkeleton({ itemCount = 3 }: AccordionSkeletonProps) {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-600', className)} {...props} />
  );

  const AccordionItemSkeleton = ({ index }: { index: number }) => {
    const isFirstItem = index === 0;

    return (
      <div
        className={cn(
          'overflow-hidden border-none bg-[#1D1E1F] shadow-lg transition-all duration-500 ease-out',
          isFirstItem ? 'lg:shadow-lg' : 'lg:shadow-none'
        )}
      >
        <div
          className={cn(
            'h-auto p-0 transition-all duration-500 ease-out',
            isFirstItem ? 'lg:h-auto' : 'lg:h-60'
          )}
        >
          <Box direction="col" gap={0} cols={{ base: 1, lg: 12 }} className="min-h-20 lg:flex-row">
            {/* Image skeleton */}
            <div className="order-1 col-span-7 h-full overflow-hidden">
              <SkeletonBox
                className={cn('h-full w-full object-cover', isFirstItem ? 'lg:h-full' : 'lg:h-60')}
              />
            </div>

            {/* Content skeleton */}
            <Box
              direction="col"
              gap={24}
              className="relative order-2 col-span-5 p-12 transition-all duration-500 ease-out"
            >
              {/* Background gradient skeleton */}
              <SkeletonBox
                className={cn(
                  'absolute inset-0 z-10 transition-all duration-500 ease-out',
                  isFirstItem ? 'lg:opacity-100' : 'lg:opacity-0'
                )}
              />

              {/* Content area */}
              <div className="relative z-20">
                {/* Overline skeleton (optional) */}
                {index % 2 === 0 && <SkeletonBox className="mb-2 h-4 w-20" />}

                {/* Title skeleton */}
                <SkeletonBox
                  className={cn('h-8 max-w-[300px]', isFirstItem ? 'lg:h-8' : 'lg:h-6')}
                />
                {!isFirstItem && <SkeletonBox className="mt-2 h-6 w-3/4 max-w-[250px] lg:hidden" />}
              </div>

              {/* Description and tags skeleton */}
              <div
                className={cn(
                  'relative z-20 space-y-4 transition-all duration-500 ease-out',
                  isFirstItem ? 'lg:opacity-100' : 'lg:opacity-0'
                )}
              >
                {/* Description skeleton */}
                <div className="space-y-2">
                  <SkeletonBox className="h-4 w-full" />
                  <SkeletonBox className="h-4 w-4/5" />
                </div>

                {/* Tags skeleton */}
                <div className="flex flex-col space-y-2">
                  <div className="border-t border-white/10 py-2">
                    <SkeletonBox className="h-4 w-24" />
                  </div>
                  <div className="border-t border-white/10 py-2">
                    <SkeletonBox className="h-4 w-32" />
                  </div>
                  <div className="border-t border-b border-white/10 py-2">
                    <SkeletonBox className="h-4 w-28" />
                  </div>
                </div>
              </div>
            </Box>
          </Box>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Box direction="col" gap={6}>
        {Array.from({ length: itemCount }, (_, index) => (
          <AccordionItemSkeleton key={`accordion-skeleton-${index}`} index={index} />
        ))}
      </Box>
    </div>
  );
}
