'use client';

import { Menu, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { Box, Container } from '@/components/global/matic-ds';

export function HeaderSkeleton() {
  const SkeletonBox = ({ className, ...props }: { className?: string }) => (
    <div className={cn('animate-pulse rounded bg-gray-300', className)} {...props} />
  );

  return (
    <Container className="sticky top-0 z-[100] pt-0 transition-all duration-300 max-md:z-[40] md:pt-6">
      <header className="relative z-[100] px-6 transition-all duration-300 max-md:z-[40] max-md:py-1.5 lg:w-full">
        <Box className="items-center justify-between">
          {/* Logo Section Skeleton */}
          <div className="flex items-center gap-2 py-4">
            <Box gap={4}>
              {/* Logo skeleton */}
              <SkeletonBox className="h-10 w-10 rounded-full" />
              {/* Brand name skeleton */}
              <SkeletonBox className="h-6 w-24" />
            </Box>
          </div>

          {/* Desktop Navigation Skeleton */}
          <div className="hidden items-center md:flex" data-testid="desktop-nav">
            {/* Main navigation menu skeleton */}
            <div className="rounded-xxs mr-4 hidden h-12 items-center bg-black/[0.72] px-6 backdrop-blur-[30px] transition-all duration-300 md:flex">
              <div className="rounded-xxs mr-4">
                <SkeletonBox className="h-6 w-16 rounded" />
              </div>
              <div className="rounded-xxs mr-4">
                <SkeletonBox className="h-6 w-20 rounded" />
              </div>
              <div className="rounded-xxs mr-4">
                <SkeletonBox className="h-6 w-18 rounded" />
              </div>
            </div>

            {/* Search icon skeleton */}
            <div className="flex items-center justify-center">
              <Search className="size-6 text-white opacity-50" />
            </div>

            {/* Desktop Overflow Menu (Hamburger) Skeleton */}
            <div className="relative">
              <Button
                variant="ghost"
                className="rounded-xxs ml-4 flex items-center justify-center p-2 text-white"
                disabled
              >
                <Menu className="size-6" />
                <span className="sr-only">Loading overflow menu</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Skeleton */}
          <Box direction="row" gap={2} className="items-center md:hidden" data-testid="mobile-nav">
            {/* Search button skeleton */}
            <Button
              variant="ghost"
              className="rounded-xxs ml-2 flex size-10 items-center justify-center bg-black/40 p-2 text-white"
              disabled
            >
              <Search className="size-6" />
              <span className="sr-only">Loading search</span>
            </Button>

            {/* Mobile menu button skeleton */}
            <Button
              variant="ghost"
              className="rounded-xxs ml-2 flex items-center justify-center bg-black/40 p-2 text-white"
              disabled
            >
              <Menu className="size-6" />
              <span className="sr-only">Loading menu</span>
            </Button>
          </Box>
        </Box>
      </header>
    </Container>
  );
}
