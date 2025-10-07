'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Image from 'next/image';
import Link from 'next/link';

import { ArrowUpRight, Plus } from 'lucide-react';

import { resolveNestedUrls } from '@/lib/page-link-utils';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

import { Box, Container } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { ContentSliderItem } from '@/components/Slider/components/ContentSliderItem';
import { PostSliderCard } from '@/components/Post/PostSliderCard';
import { getSlidersByIds } from '@/components/Slider/SliderApi';
import { SliderSkeleton } from '@/components/Slider/SliderItemSkeleton';
import { TeamMemberModal } from '@/components/TeamMember/TeamMemberModal';
import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';

import type { ContentOverlay } from '@/components/Content/ContentSchema';
import type { Image as ImageType } from '@/components/Image/ImageSchema';
import type { PostSliderItem } from '@/components/Post/PostSchema';
import type { ContentSliderItem as ContentSliderItemType } from '@/components/Slider/components/ContentSliderItemSchema';
import type { SliderItem } from '@/components/Slider/SliderItemSchema';
import type { Slider, SliderItemType, SliderSys } from '@/components/Slider/SliderSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';
import type { TeamMember } from '@/components/TeamMember/TeamMemberSchema';
import type { TestimonialItem as TestimonialItemType } from '@/components/Testimonials/TestimonialsSchema';
import type { TimelineSliderItem } from '@/components/TimelineSlider/TimelineSliderItemSchema';
import type { CarouselApi } from '@/components/ui/carousel';

interface SliderCardProps {
  item: SliderItemType;
  index: number;
  current: number;
  sliderData?: Slider;
  api?: CarouselApi;
  solutionUrls?: Record<string, string>;
  onTeamMemberClick?: (teamMember: TeamMember) => void;
  context?: 'ImageBetween' | 'ContentGrid' | 'default';
}

const _ContentOverlay = ({ children }: ContentOverlay) => (
  <div className="absolute right-0 bottom-0 left-0 md:relative md:h-full">
    <div
      className="flex w-full flex-col justify-end rounded-[2px] p-10 backdrop-blur-[14px] md:h-full md:max-w-[393px]"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  </div>
);

const SliderCard = ({ item, index, current, solutionUrls, onTeamMemberClick, context = 'default' }: SliderCardProps) => {
  const updatedItem = useContentfulLiveUpdates(item);
  const inspectorProps = useContentfulInspectorMode({ entryId: updatedItem?.sys?.id });

  const baseCardClasses = cn(
    'text-primary-foreground relative h-[669px] transition-all duration-500',
    {
      'opacity-80': index !== current - 1
    }
  );

  // Guard clause: return fallback if updatedItem is undefined
  if (!updatedItem) {
    return (
      <div className={baseCardClasses}>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Handle SliderItem type
  if (updatedItem.__typename === 'SliderItem') {
    const sliderItem = updatedItem as SliderItem;
    const isCurrentSlide = current === index + 1;
    return (
      <Box
        direction="col"
        gap={4}
        className={cn(
          'bg-subtle h-full min-h-[350px] w-full p-8',
          isCurrentSlide && 'lg:bg-primary'
        )}
      >
        {sliderItem.icon && (
          <div className={cn('w-fit bg-black p-[0.38rem]', current === index + 1 && 'lg:bg-white')}>
            <Image
              src={sliderItem.icon?.url ?? ''}
              alt={sliderItem.title}
              className={cn('filter', isCurrentSlide ? 'lg:invert' : '')}
              width={60}
              height={60}
            />
          </div>
        )}
        <Box direction="col" gap={2}>
          <h3 className={cn('!text-headline-sm', isCurrentSlide && 'lg:text-text-on-invert')}>
            {sliderItem.title}
          </h3>
          <p className={cn('!text-body-sm', isCurrentSlide && 'lg:text-text-on-invert')}>
            {sliderItem.description}
          </p>
        </Box>

        {sliderItem.cta && (
          <Box direction="row" gap={2} className="mt-auto">
            <Link
              key={sliderItem.cta.sys?.id}
              href={sliderItem.cta.internalLink?.slug ?? sliderItem.cta.externalLink ?? '#'}
              {...(sliderItem.cta.externalLink
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="group"
            >
              <Button
                variant="outlineWhite"
                className={cn(
                  'hover:bg-primary hover:text-text-on-primary',
                  isCurrentSlide && 'hover:bg-white hover:text-black'
                )}
              >
                {sliderItem.cta.text}
                {isCurrentSlide && (
                  <ArrowUpRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </Button>
            </Link>
          </Box>
        )}
      </Box>
    );
  }

  // Handle Image type
  if (updatedItem.__typename === 'Image') {
    const imageItem = updatedItem as ImageType;
    return (
      <div className={baseCardClasses}>
        <AirImage
          link={imageItem.link}
          altText={imageItem.altText}
          className="absolute h-full w-full object-cover object-left md:object-cover"
        />
      </div>
    );
  }

  // Handle Post type
  if (updatedItem.__typename === 'Post') {
    const postItem = updatedItem as PostSliderItem;
    return (
      <PostSliderCard
        item={postItem}
        index={index}
        current={current}
        context={context}
      />
    );
  }

  if (updatedItem.__typename === 'TimelineSliderItem') {
    const timelineItem = updatedItem as TimelineSliderItem;

    return (
      <div className="relative h-[669px] bg-white pb-32 lg:pb-16">
        <div className="flex h-full">
          {/* Left Column - Timeline Navigation */}
          <div className="hidden w-1/4 flex-col justify-center px-8 lg:flex"></div>

          {/* Right Column - Content */}
          <div className="flex w-full flex-col lg:w-3/4">
            {/* Video/Image Section */}
            <div className="relative h-[400px] w-full">
              {timelineItem.asset?.__typename === 'Video'
                ? (() => {
                    const videoAsset = timelineItem.asset as {
                      __typename: 'Video';
                      posterImage: { link?: string; altText?: string };
                    };
                    return (
                      <div className="relative h-full w-full">
                        <AirImage
                          link={videoAsset?.posterImage?.link ?? ''}
                          altText={videoAsset?.posterImage?.altText ?? 'Video thumbnail'}
                          className="absolute h-full w-full object-cover"
                        />
                        {/* Video Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                            <svg
                              className="ml-1 h-6 w-6 text-gray-800"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                : timelineItem.asset?.__typename === 'Image'
                  ? (() => {
                      const imageAsset = timelineItem.asset as {
                        __typename: 'Image';
                        link?: string;
                        altText?: string;
                      };
                      return (
                        <AirImage
                          link={imageAsset?.link ?? ''}
                          altText={imageAsset?.altText ?? ''}
                          className="h-full w-full object-cover"
                        />
                      );
                    })()
                  : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (updatedItem.__typename === 'TeamMember') {
    const teamMember = updatedItem as TeamMember;

    return (
      <Box
        direction="col"
        gap={6}
        className="group/card cursor-pointer transition-all duration-300 hover:!opacity-100"
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <AirImage
            link={teamMember.image?.link}
            altText={teamMember.image?.altText}
            className="h-full w-full object-cover transition-all duration-300"
          />
          {/* Dark overlay that shows on non-hovered cards when any card is hovered */}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover/card:!opacity-0" />
          {/* Orange plus icon that shows on hover */}
          <button
            onClick={() => onTeamMemberClick?.(teamMember)}
            className="bg-background hover:bg-primary/90 group-hover/card:bg-primary absolute right-0 bottom-0 flex size-10 items-center justify-center opacity-100 transition-all duration-300"
          >
            <Plus className="text-text-on-background group-hover/card:text-text-on-primary size-6" />
          </button>
        </div>
        <div className="mt-4">
          <h3
            className="group-hover/card:text-primary text-lg font-semibold text-gray-900 transition-colors duration-300"
            {...inspectorProps({ fieldId: 'name' })}
          >
            {teamMember.name}
          </h3>
          <p
            className="group-hover/card:text-primary text-sm text-gray-600 transition-colors duration-300"
            {...inspectorProps({ fieldId: 'jobTitle' })}
          >
            {teamMember.jobTitle}
          </p>
        </div>
      </Box>
    );
  }

  if (updatedItem.__typename === 'Solution') {
    const solution = updatedItem as Solution;
    const isCurrentSlide = current === index + 1;
    return (
      <Box
        direction="col"
        gap={4}
        className={cn(
          'bg-subtle h-full min-h-[350px] w-full p-8',
          isCurrentSlide && 'lg:bg-primary'
        )}
      >
        <Box direction="col" gap={2}>
          <h3 className={cn('!text-headline-sm', isCurrentSlide && 'lg:text-text-on-invert')}>
            {solution.title}
          </h3>
          <p className={cn('!text-body-sm', isCurrentSlide && 'lg:text-text-on-invert')}>
            {solution.description}
          </p>
        </Box>

        {solution.cta && (
          <Box direction="row" gap={2} className="mt-auto">
            <Link
              key={solution.cta.sys?.id}
              href={
                // Check if we have a resolved URL for this Solution CTA
                // Use the internalLink sys.id as the key (matching resolveNestedUrls logic)
                (() => {
                  const internalLinkId = solution.cta.internalLink?.sys?.id ?? solution.sys?.id;
                  const resolvedUrl = internalLinkId ? solutionUrls?.[internalLinkId] : null;
                  return resolvedUrl ?? solution.cta.externalLink ?? 'test';
                })()
              }
              {...(solution.cta.externalLink
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="group"
            >
              <Button
                variant="outline"
                className={cn(
                  'lg:hover:bg-primary lg:hover:text-text-on-primary border-gray-300 text-black',
                  isCurrentSlide &&
                    'lg:bg-white lg:text-black lg:hover:bg-white lg:hover:text-black'
                )}
              >
                {solution.cta.text}
              </Button>
            </Link>
          </Box>
        )}
      </Box>
    );
  }

  if (updatedItem.__typename === 'TestimonialItem') {
    return <TestimonialItem key={item.sys?.id} item={updatedItem as TestimonialItemType} />;
  }

  if (updatedItem.__typename === 'ContentSliderItem') {
    return <ContentSliderItem key={item.sys?.id} item={updatedItem as ContentSliderItemType} />;
  }

  // Fallback for unknown types
  return (
    <div className={baseCardClasses}>
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Unsupported item type</div>
      </div>
    </div>
  );
};

interface GenericSliderProps {
  sliderData: Slider;
  current: number;
  api?: CarouselApi;
  solutionUrls?: Record<string, string>;
  setApi: (api: CarouselApi) => void;
  showIndicators?: boolean;
  showAltIndicators?: boolean;
  showNavigation?: boolean;
  showAltNavigation?: boolean;
  isFullWidth?: boolean;
  onTeamMemberClick?: (teamMember: TeamMember) => void;
  context?: 'ImageBetween' | 'ContentGrid' | 'default';
}

const GenericSlider = ({
  sliderData,
  current,
  api,
  solutionUrls,
  setApi,
  showIndicators = false,
  showAltIndicators = false,
  showAltNavigation = false,
  isFullWidth = true,
  onTeamMemberClick,
  context = 'default'
}: GenericSliderProps) => {
  const isContentSlider = sliderData.itemsCollection.items[0]?.__typename === 'ContentSliderItem';
  const isSlider = sliderData.itemsCollection.items[0]?.__typename === 'SliderItem';
  const isSolutionSlider = sliderData.itemsCollection.items[0]?.__typename === 'Solution';
  const isTeamMemberSlider = sliderData.itemsCollection.items[0]?.__typename === 'TeamMember';
  const isTimelineSlider = sliderData.itemsCollection.items[0]?.__typename === 'TimelineSliderItem';
  const isPostSlider = sliderData.itemsCollection.items[0]?.__typename === 'Post';
  const isServiceSlider = sliderData.itemsCollection.items[0]?.__typename === 'Service';
  const isTestimonialSlider = sliderData.itemsCollection.items[0]?.__typename === 'TestimonialItem';
  // const hasOnePostSlide =
  //   sliderData.itemsCollection.items.filter((item) => item.__typename === 'Post').length === 1;
  const hasOnlyOneSlide = sliderData.itemsCollection.items.length === 1;

  return (
    <div
      className={cn(
        hasOnlyOneSlide ? 'relative w-full' : isFullWidth ? 'relative w-screen' : 'relative'
      )}
      style={{
        marginLeft: isFullWidth && !hasOnlyOneSlide ? 'calc(-50vw + 50%)' : ''
      }}
    >
      <Carousel
        setApi={setApi}
        className={cn(
          hasOnlyOneSlide
            ? 'w-full'
            : isFullWidth && !hasOnlyOneSlide
              ? 'relative w-screen lg:right-1/2 lg:left-1/2 lg:-mr-[50vw] lg:-ml-[50vw]'
              : isTeamMemberSlider
                ? 'w-full max-w-none'
                : 'w-full'
        )}
        opts={{
          loop: sliderData.itemsCollection.items.length > 1,
          align: sliderData.itemsCollection.items.length === 1 ? 'center' : 'center',
          ...(isTeamMemberSlider &&
            sliderData.itemsCollection.items.length > 1 && {
              align: 'start'
            }),
          ...(isTimelineSlider &&
            sliderData.itemsCollection.items.length > 1 && {
              align: 'start',
              containScroll: 'trimSnaps'
            }),
          ...(isTestimonialSlider &&
            sliderData.itemsCollection.items.length > 1 && {
              align: 'start',
              containScroll: 'trimSnaps'
            })
        }}
      >
        <CarouselContent
          className={cn(
            isTeamMemberSlider && 'group lg:overflow-visible',
            isTimelineSlider && 'overflow-hidden'
          )}
        >
          {sliderData.itemsCollection.items.map((item, index) => {
            return (
              <CarouselItem
                key={`${item.sys.id}-${index}`}
                className={cn(
                  // If there's only one slide, always use full width
                  hasOnlyOneSlide
                    ? 'basis-full'
                    : isSlider
                      ? 'basis-[calc(100vw-3rem)] sm:basis-[411px]'
                      : isTeamMemberSlider
                        ? 'basis-[300px]'
                        : isTimelineSlider
                          ? 'basis-[calc(100vw-4rem)] lg:basis-full'
                          : isFullWidth
                            ? 'basis-[calc(100vw-3rem)] sm:basis-4/5'
                            : isSolutionSlider
                              ? 'basis-[calc(100vw-3rem)] sm:basis-[411px]'
                              : isTestimonialSlider
                                ? 'basis-1/3'
                                : isContentSlider
                                  ? 'basis-[calc(100vw-3rem)] sm:basis-[411px]'
                                  : 'basis-full'
                )}
              >
                <SliderCard
                  key={item.sys.id}
                  item={item}
                  index={index}
                  current={current}
                  sliderData={sliderData}
                  api={api}
                  solutionUrls={solutionUrls}
                  onTeamMemberClick={onTeamMemberClick}
                  context={context}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Combined Navigation - Handles TimelineSlider (left side) and other sliders (top right) */}
        {showAltNavigation && (
          <>
            {isTimelineSlider ? (
              <>
                {/* Mobile Navigation - Separate buttons on each side */}
                <CarouselPrevious
                  className="absolute top-2/3 left-0 z-50 size-10 -translate-y-1/2 rounded border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900 lg:hidden"
                  variant="outline"
                  aria-label="Previous slide"
                />
                <CarouselNext
                  className="absolute top-2/3 right-0 z-50 size-10 -translate-y-1/2 rounded border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900 lg:hidden"
                  variant="outline"
                  aria-label="Next slide"
                />
                {/* Desktop Navigation */}
                <div className="absolute top-3/4 left-8 z-50 hidden -translate-y-2/3 flex-row gap-4 lg:flex">
                  <CarouselPrevious
                    className="relative left-0 size-8 rounded border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900"
                    variant="outline"
                    aria-label="Previous slide"
                  />
                  <CarouselNext
                    className="relative right-0 size-8 rounded border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900"
                    variant="outline"
                    aria-label="Next slide"
                  />
                </div>
              </>
            ) : null}
          </>
        )}
      </Carousel>

      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 z-20 flex h-1 -translate-x-1/2 items-center gap-4">
          {sliderData.itemsCollection.items.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn('h-full w-12 cursor-pointer bg-[#171717] opacity-30', {
                'bg-[#F5B12D] opacity-100': current === index + 1
              })}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {showAltIndicators && (
        <Container>
          <div
            className={cn(
              'mx-auto mt-12 flex',
              isTeamMemberSlider ||
                isSlider ||
                isSolutionSlider ||
                isPostSlider ||
                isServiceSlider ||
                isContentSlider
                ? 'w-full items-center justify-between'
                : 'justify-center'
            )}
          >
            <div
              className={cn(
                'flex h-1',
                isTeamMemberSlider ||
                  isSlider ||
                  isSolutionSlider ||
                  isPostSlider ||
                  isServiceSlider ||
                  isContentSlider
                  ? 'flex-1'
                  : 'max-w-md flex-1'
              )}
            >
              {(isTestimonialSlider
                ? Array.from({ length: Math.ceil(sliderData.itemsCollection.items.length / 3) })
                : sliderData.itemsCollection.items
              ).map((_, index) => {
                // For testimonial sliders, calculate which group is active
                const isActive = isTestimonialSlider
                  ? Math.floor((current - 1) / 3) === index
                  : current === index + 1;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isTestimonialSlider) {
                        // For testimonial sliders, scroll to the first item in the group
                        api?.scrollTo(index * 3);
                      } else {
                        api?.scrollTo(index);
                      }
                    }}
                    className={cn('h-full flex-1 cursor-pointer bg-neutral-300', {
                      'bg-surface-invert': isActive
                    })}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
            {showAltIndicators && (
              <div className="ml-8 flex items-center gap-4">
                <button
                  onClick={() => {
                    if (isTestimonialSlider) {
                      const currentSnap = api?.selectedScrollSnap() ?? 0;
                      const totalSlides = sliderData.itemsCollection.items.length;
                      const targetSnap = currentSnap - 3;
                      const loopedSnap = targetSnap < 0 ? totalSlides - 3 : targetSnap;
                      api?.scrollTo(loopedSnap);
                    } else {
                      api?.scrollPrev();
                    }
                  }}
                  className="relative left-0 flex size-8 items-center justify-center rounded-none border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900"
                  aria-label="Previous slide"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (isTestimonialSlider) {
                      const currentSnap = api?.selectedScrollSnap() ?? 0;
                      const totalSlides = sliderData.itemsCollection.items.length;
                      const targetSnap = currentSnap + 3;
                      const loopedSnap = targetSnap >= totalSlides ? 0 : targetSnap;
                      api?.scrollTo(loopedSnap);
                    } else {
                      api?.scrollNext();
                    }
                  }}
                  className="relative right-0 flex size-8 items-center justify-center rounded-none border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900"
                  aria-label="Next slide"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </Container>
      )}

      {/* Separate Timeline Component - Only for Timeline Sliders */}
      {isTimelineSlider && (
        <div
          className="absolute right-6 left-6 z-10 flex gap-4 lg:right-6 lg:left-1/4"
          style={{ top: '420px' }}
        >
          <div className="w-full">
            {/* Timeline Bar positioned under the asset */}
            <div className="mb-8 pt-6">
              {/* Mobile Timeline Bar - Centered active bullet */}
              <div className="relative h-0.5 w-full lg:hidden">
                {/* Timeline Bullets - Mobile - Show only visible ones, center active */}
                <div className="relative mx-10 overflow-hidden">
                  {/* Timeline line behind bullets - with fade out effect */}
                  <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  <div
                    className="relative z-10 flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(calc(50% - ${(current - 1) * 60}px))`
                    }}
                  >
                    {sliderData.itemsCollection.items
                      .filter((item) => item.__typename === 'TimelineSliderItem')
                      .map((item, timelineIndex) => {
                        const timelineItemData = item as TimelineSliderItem;
                        const isActive = current === timelineIndex + 1;

                        return (
                          <button
                            key={item.sys.id}
                            onClick={() => api?.scrollTo(timelineIndex)}
                            className={cn(
                              'relative z-10 h-3 w-3 flex-shrink-0 rounded-full transition-colors duration-300',
                              isActive ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
                            )}
                            style={{
                              marginRight:
                                timelineIndex <
                                sliderData.itemsCollection.items.filter(
                                  (i) => i.__typename === 'TimelineSliderItem'
                                ).length -
                                  1
                                  ? '48px'
                                  : '0'
                            }}
                            aria-label={`Go to ${timelineItemData.year}`}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Desktop Timeline Bar - Static */}
              <div className="relative hidden h-0.5 w-full bg-gray-200 lg:block">
                {/* Individual Timeline Segments */}
                {sliderData.itemsCollection.items
                  .filter((item) => item.__typename === 'TimelineSliderItem')
                  .map((item, timelineIndex) => {
                    const totalItems = sliderData.itemsCollection.items.filter(
                      (i) => i.__typename === 'TimelineSliderItem'
                    ).length;
                    const segmentWidth = 100 / Math.max(1, totalItems - 1);
                    const isActive = current === timelineIndex + 1;

                    // Don't render segment for the last item
                    if (timelineIndex === totalItems - 1) return null;

                    return (
                      <div
                        key={item.sys.id}
                        className={cn(
                          'absolute top-0 h-full transition-all duration-500 ease-in-out',
                          isActive ? 'bg-gray-400' : 'bg-gray-200'
                        )}
                        style={{
                          left: `${(timelineIndex / Math.max(1, totalItems - 1)) * 100}%`,
                          width: `${segmentWidth}%`
                        }}
                      />
                    );
                  })}
                {/* Timeline Bullets - Show all timeline items */}
                {sliderData.itemsCollection.items
                  .filter((item) => item.__typename === 'TimelineSliderItem')
                  .map((item, timelineIndex) => {
                    const timelineItemData = item as TimelineSliderItem;
                    return (
                      <button
                        key={item.sys.id}
                        onClick={() => api?.scrollTo(timelineIndex)}
                        className={cn(
                          'absolute top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full transition-colors duration-300',
                          current === timelineIndex + 1
                            ? 'bg-gray-400'
                            : 'bg-gray-200 hover:bg-gray-300'
                        )}
                        style={{
                          left: `${(timelineIndex / (sliderData.itemsCollection.items.filter((i) => i.__typename === 'TimelineSliderItem').length - 1)) * 100}%`
                        }}
                        aria-label={`Go to ${timelineItemData.year}`}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Sliding Timeline - Shows 1 item on mobile, 3 items on desktop */}
            <div className="overflow-hidden lg:overflow-visible">
              <div
                className="flex gap-0 transition-transform duration-500 ease-in-out"
                style={{
                  transform:
                    window.innerWidth >= 1024
                      ? `translateX(-${(current - 1) * 33.33}%)`
                      : `translateX(-${(current - 1) * 100}%)`,
                  width: `100%`
                }}
              >
                {sliderData.itemsCollection.items
                  .filter((item) => item.__typename === 'TimelineSliderItem')
                  .map((item, timelineIndex) => {
                    const timelineItemData = item as TimelineSliderItem;
                    const totalItems = sliderData.itemsCollection.items.filter(
                      (i) => i.__typename === 'TimelineSliderItem'
                    ).length;
                    const isActive = (current - 1) % totalItems === timelineIndex;
                    return (
                      <div
                        key={item.sys.id}
                        className="flex min-w-0 flex-[0_0_100%] flex-col lg:flex-[0_0_33.33%]"
                      >
                        {/* Year */}
                        <div className="mb-4 flex h-[60px] items-start">
                          <span
                            className={cn(
                              'text-headline-lg transition-all duration-300',
                              isActive
                                ? '!text-text-body scale-100'
                                : 'origin-left scale-55 !text-gray-600'
                            )}
                          >
                            {timelineItemData.year}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="min-h-[80px]">
                          <p
                            className={cn(
                              'text-sm leading-relaxed transition-all duration-300',
                              isActive
                                ? 'scale-100 text-gray-600'
                                : 'origin-left scale-90 text-gray-600'
                            )}
                          >
                            {timelineItemData.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function Slider(props: SliderSys) {
  const [sliderData, setSliderData] = useState<Slider | null>(null);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [solutionUrls, setSolutionUrls] = useState<Record<string, string>>({});
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleTeamMemberClick = (teamMember: TeamMember) => {
    setSelectedTeamMember(teamMember);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedTeamMember(null);
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Intersection Observer to track if slider is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.3 }
    );

    const currentRef = sliderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInView || !api) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        api.scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        api.scrollNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [api, isInView]);

  useEffect(() => {
    async function fetchSliderData() {
      try {
        setLoading(true);
        const data = await getSlidersByIds([props.sys.id]);
        if (data.length > 0 && data[0]) {
          const sliderData = data[0];

          // Randomize team member order if this is a team member slider
          if (sliderData.itemsCollection.items[0]?.__typename === 'TeamMember') {
            // Fisher-Yates shuffle for equal distribution
            const shuffledItems = [...sliderData.itemsCollection.items];
            for (let i = shuffledItems.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              const temp = shuffledItems[i]!;
              shuffledItems[i] = shuffledItems[j]!;
              shuffledItems[j] = temp;
            }
            setSliderData({
              ...sliderData,
              itemsCollection: {
                ...sliderData.itemsCollection,
                items: shuffledItems
              }
            });
          } else {
            setSliderData(sliderData);
          }
        }
      } catch (error) {
        console.error('Error fetching slider data:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchSliderData();
  }, [props.sys.id]);

  // Generate correct URLs for Solutions by looking up their parent PageList
  // PageList Nesting Integration: Dynamically resolve all Solution URLs to respect nesting hierarchy
  // This ensures all Solution slider items link to proper nested URLs when parent PageLists exist
  useEffect(() => {
    const fetchNestedUrls = async () => {
      if (!sliderData?.itemsCollection?.items) return;

      // Filter only Solution items and extract their CTA links
      const allSolutions = sliderData.itemsCollection.items
        .filter((item) => item.__typename === 'Solution')
        .map((item) => item as Solution);

      const solutionItems = allSolutions.filter((solution) => solution.cta);

      const urlMap = await resolveNestedUrls(solutionItems, (solution) => ({
        sys: solution.cta!.sys,
        // If CTA doesn't have internalLink with slug, create one using the Solution's own slug
        internalLink: solution.cta!.internalLink?.slug
          ? solution.cta!.internalLink
          : { sys: solution.sys, slug: solution.slug },
        externalLink: solution.cta!.externalLink
      }));
      setSolutionUrls(urlMap);
    };

    void fetchNestedUrls();
  }, [sliderData?.itemsCollection?.items]);

  if (loading) {
    return <SliderSkeleton itemCount={3} />;
  }

  if (!sliderData?.itemsCollection?.items?.length) {
    return (
      <div className="flex h-[669px] items-center justify-center">
        <div className="text-lg">No slider items found</div>
      </div>
    );
  }

  // Determine slider configuration based on the first item's type
  const firstItem = sliderData.itemsCollection.items[0];
  if (!firstItem) {
    return (
      <div className="flex h-[669px] items-center justify-center">
        <div className="text-lg">No slider items found</div>
      </div>
    );
  }

  const isContentSlider = firstItem.__typename === 'ContentSliderItem';
  const isPostSlider = firstItem.__typename === 'Post';
  const isImageSlider = firstItem.__typename === 'Image';
  const isTeamMemberSlider = firstItem.__typename === 'TeamMember';
  const isTimelineSliderItemSlider = firstItem.__typename === 'TimelineSliderItem';
  const isSliderItemSlider = firstItem.__typename === 'SliderItem';
  const isSolutionSlider = firstItem.__typename === 'Solution';
  const isServiceSlider = firstItem.__typename === 'Service';
  const isTestimonialSlider = firstItem.__typename === 'TestimonialItem';

  // Check if there's only one item to hide navigation
  const hasOnlyOneItem = sliderData.itemsCollection.items.length === 1;

  // Configure slider based on content type
  return (
    <div ref={sliderRef} className={isTimelineSliderItemSlider ? 'mb-8' : ''}>
      <GenericSlider
        sliderData={sliderData}
        current={current}
        api={api}
        solutionUrls={solutionUrls}
        setApi={setApi}
        showIndicators={!hasOnlyOneItem && isImageSlider}
        showAltIndicators={
          !hasOnlyOneItem &&
          (isSliderItemSlider ||
            isTeamMemberSlider ||
            isSolutionSlider ||
            isPostSlider ||
            isServiceSlider ||
            isTestimonialSlider ||
            isContentSlider)
        }
        showNavigation={
          !hasOnlyOneItem &&
          !isImageSlider &&
          !isSliderItemSlider &&
          !isTimelineSliderItemSlider &&
          !isTeamMemberSlider &&
          !isSolutionSlider &&
          !isServiceSlider &&
          !isTestimonialSlider
        }
        showAltNavigation={
          !hasOnlyOneItem &&
          (isSliderItemSlider ||
            isTimelineSliderItemSlider ||
            isTeamMemberSlider ||
            isSolutionSlider ||
            isPostSlider ||
            isServiceSlider ||
            isTestimonialSlider)
        }
        isFullWidth={
          isPostSlider &&
          !isImageSlider &&
          !isTeamMemberSlider &&
          !isTimelineSliderItemSlider &&
          !isTestimonialSlider
        }
        onTeamMemberClick={handleTeamMemberClick}
        context={props.context}
      />

      {/* Team Member Modal */}
      {selectedTeamMember && (
        <TeamMemberModal
          isOpen={isModalOpen}
          onOpenChange={handleModalClose}
          teamMember={selectedTeamMember}
        />
      )}
    </div>
  );
}
