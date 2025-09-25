import React from 'react';

import { cn } from '@/lib/utils';

interface SliderItemSkeletonProps {
  type: 'SliderItem' | 'Post' | 'Image' | 'TimelineSliderItem' | 'TeamMember' | 'Solution';
  className?: string;
}

export const SliderItemSkeleton = ({ type, className }: SliderItemSkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  switch (type) {
    case 'SliderItem':
      return (
        <div className={cn('bg-subtle h-full min-h-[350px] w-full p-8', className)}>
          {/* Icon skeleton */}
          <div className={cn(baseClasses, 'mb-4 h-16 w-16 rounded-full')} />

          {/* Title skeleton */}
          <div className={cn(baseClasses, 'mb-2 h-6 w-3/4 rounded')} />

          {/* Description skeleton */}
          <div className={cn(baseClasses, 'mb-4 h-4 w-full rounded')} />
          <div className={cn(baseClasses, 'mb-4 h-4 w-2/3 rounded')} />

          {/* CTA button skeleton */}
          <div className={cn(baseClasses, 'mt-auto h-10 w-32 rounded')} />
        </div>
      );

    case 'Post':
      return (
        <div className={cn('relative h-[669px] bg-gray-100', className)}>
          {/* Image skeleton */}
          <div className={cn(baseClasses, 'absolute h-full w-full')} />

          {/* Content overlay skeleton */}
          <div className="absolute right-0 bottom-0 left-0 md:relative md:h-full">
            <div className="flex w-full flex-col justify-end rounded-[2px] p-10 backdrop-blur-[14px] md:h-full md:max-w-[393px]">
              {/* Categories skeleton */}
              <div className={cn(baseClasses, 'mb-2 h-4 w-20 rounded')} />

              {/* Title skeleton */}
              <div className={cn(baseClasses, 'mb-4 h-8 w-4/5 rounded')} />

              {/* Excerpt skeleton */}
              <div className={cn(baseClasses, 'mb-6 h-4 w-full rounded')} />
              <div className={cn(baseClasses, 'mb-6 h-4 w-3/4 rounded')} />

              {/* Button skeleton */}
              <div className={cn(baseClasses, 'h-12 w-32 rounded')} />
            </div>
          </div>
        </div>
      );

    case 'Image':
      return (
        <div className={cn('relative h-[669px] bg-gray-100', className)}>
          <div className={cn(baseClasses, 'absolute h-full w-full')} />
        </div>
      );

    case 'TimelineSliderItem':
      return (
        <div className="relative h-[669px] bg-white pb-32 lg:pb-16">
          <div className="flex h-full">
            {/* Left Column - Timeline Navigation skeleton */}
            <div className="hidden w-1/4 flex-col justify-center px-8 lg:flex">
              <div className={cn(baseClasses, 'h-4 w-16 rounded')} />
            </div>

            {/* Right Column - Content */}
            <div className="flex w-full flex-col lg:w-3/4">
              {/* Video/Image Section skeleton */}
              <div className="relative h-[400px] w-full">
                <div className={cn(baseClasses, 'h-full w-full')} />
                {/* Play button skeleton */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(baseClasses, 'h-16 w-16 rounded-full')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'TeamMember':
      return (
        <div className={cn('group/card cursor-pointer transition-all duration-300', className)}>
          {/* Image skeleton */}
          <div className="relative aspect-square w-full overflow-hidden">
            <div className={cn(baseClasses, 'h-full w-full')} />
            {/* Plus icon skeleton */}
            <div className="absolute right-0 bottom-0 flex size-10 items-center justify-center bg-gray-300">
              <div className={cn(baseClasses, 'h-6 w-6 rounded')} />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="mt-4">
            <div className={cn(baseClasses, 'mb-2 h-5 w-3/4 rounded')} />
            <div className={cn(baseClasses, 'h-4 w-1/2 rounded')} />
          </div>
        </div>
      );

    case 'Solution':
      return (
        <div className={cn('bg-subtle h-full min-h-[350px] w-full p-8', className)}>
          {/* Title skeleton */}
          <div className={cn(baseClasses, 'mb-2 h-6 w-3/4 rounded')} />

          {/* Description skeleton */}
          <div className={cn(baseClasses, 'mb-4 h-4 w-full rounded')} />
          <div className={cn(baseClasses, 'mb-4 h-4 w-2/3 rounded')} />

          {/* CTA button skeleton */}
          <div className={cn(baseClasses, 'mt-auto h-10 w-32 rounded')} />
        </div>
      );

    default:
      return (
        <div className={cn('h-[669px] bg-gray-100', className)}>
          <div className={cn(baseClasses, 'h-full w-full')} />
        </div>
      );
  }
};

interface SliderSkeletonProps {
  itemCount?: number;
  className?: string;
}

export const SliderSkeleton = ({ itemCount = 3, className }: SliderSkeletonProps) => {
  // Default to showing different types if we have multiple items
  const types: (
    | 'SliderItem'
    | 'Post'
    | 'Image'
    | 'TimelineSliderItem'
    | 'TeamMember'
    | 'Solution'
  )[] = ['SliderItem', 'Post', 'Image', 'TimelineSliderItem', 'TeamMember', 'Solution'];

  return (
    <div className={cn('flex gap-4', className)}>
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index} className="flex-1">
          <SliderItemSkeleton
            type={types[index % types.length] ?? 'SliderItem'}
            className="h-[350px] w-full"
          />
        </div>
      ))}
    </div>
  );
};
