'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSlidersByIds } from '@/lib/contentful-api/slider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import type {
  Slider,
  SliderSys,
  SliderItem,
  PostSliderItem,
  Image as ImageType,
  TimelineSliderItem,
  TeamMember
} from '@/types/contentful';
import { AirImage } from '@/components/media/AirImage';
import { Box, Container } from '@/components/global/matic-ds';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import type { ContentOverlay } from '@/types/contentful/Content';
import type { SliderItemType } from '@/types/contentful/Slider';
import { ArrowUpRight } from 'lucide-react';

interface SliderCardProps {
  item: SliderItemType;
  index: number;
  current: number;
  sliderData?: Slider;
  api?: CarouselApi;
}

const ContentOverlay = ({ children }: ContentOverlay) => (
  <div className="relative h-full">
    <div
      className="flex h-full w-full max-w-[393px] flex-col justify-end rounded-[2px] p-10 backdrop-blur-[14px]"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  </div>
);

const SliderCard = ({ item, index, current }: SliderCardProps) => {
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
        className={cn('bg-subtle h-full min-h-[350px] w-full p-8', isCurrentSlide && 'bg-primary')}
      >
        {sliderItem.icon && (
          <div className={cn('w-fit bg-black p-[0.38rem]', current === index + 1 && 'bg-white')}>
            <Image
              src={sliderItem.icon?.url ?? ''}
              alt={sliderItem.title}
              className={cn('filter', isCurrentSlide ? 'invert' : '')}
              width={60}
              height={60}
            />
          </div>
        )}
        <Box direction="col" gap={2}>
          <h3 className={cn('!text-headline-sm', isCurrentSlide && 'text-text-on-invert')}>
            {sliderItem.title}
          </h3>
          <p className={cn('!text-body-sm', isCurrentSlide && 'text-text-on-invert')}>
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
          className="absolute h-full w-full object-cover"
        />
      </div>
    );
  }

  // Handle Post type
  if (updatedItem.__typename === 'Post') {
    const postItem = updatedItem as PostSliderItem;
    return (
      <div className={baseCardClasses}>
        <AirImage
          link={postItem.mainImage?.link}
          altText={postItem.mainImage?.altText}
          className="absolute h-full w-full object-cover"
        />
        <ContentOverlay>
          <Box direction="col" gap={5}>
            <Box direction="col" gap={1.5}>
              {postItem.categories && (
                <p
                  className="text-body-sm text-white uppercase"
                  {...inspectorProps({ fieldId: 'categories' })}
                >
                  {postItem.categories}
                </p>
              )}
              <h2
                className="text-headline-sm leading-tight text-white"
                {...inspectorProps({ fieldId: 'title' })}
              >
                {postItem.title}
              </h2>
            </Box>
            {postItem.excerpt && (
              <p
                className="text-body-xs letter-spacing-[0.14px] leading-normal text-white"
                {...inspectorProps({ fieldId: 'excerpt' })}
              >
                {postItem.excerpt}
              </p>
            )}
          </Box>
        </ContentOverlay>
      </div>
    );
  }

  if (updatedItem.__typename === 'TimelineSliderItem') {
    const timelineItem = updatedItem as TimelineSliderItem;

    return (
      <div className="relative h-[669px] bg-white">
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
      <Box direction="col" gap={6}>
        <div className="aspect-square w-full overflow-hidden">
          <AirImage
            link={teamMember.image?.link}
            altText={teamMember.image?.altText}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-4">
          <h3
            className="text-lg font-semibold text-gray-900"
            {...inspectorProps({ fieldId: 'name' })}
          >
            {teamMember.name}
          </h3>
          <p className="text-sm text-gray-600" {...inspectorProps({ fieldId: 'jobTitle' })}>
            {teamMember.jobTitle}
          </p>
        </div>
      </Box>
    );
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
  api: CarouselApi | undefined;
  setApi: (api: CarouselApi) => void;
  showIndicators?: boolean;
  showAltIndicators?: boolean;
  showNavigation?: boolean;
  showAltNavigation?: boolean;
  isFullWidth?: boolean;
}

const GenericSlider = ({
  sliderData,
  current,
  api,
  setApi,
  showIndicators = false,
  showAltIndicators = false,
  showAltNavigation = false,
  isFullWidth = true
}: GenericSliderProps) => {
  const isSlider = sliderData.itemsCollection.items[0]?.__typename === 'SliderItem';
  const isTeamMemberSlider = sliderData.itemsCollection.items[0]?.__typename === 'TeamMember';
  const isTimelineSlider = sliderData.itemsCollection.items[0]?.__typename === 'TimelineSliderItem';
  const hasOnePostSlide =
    sliderData.itemsCollection.items.filter((item) => item.__typename === 'Post').length === 1;

  return (
    <div
      className={cn(isFullWidth ? 'relative w-screen' : 'relative')}
      style={{
        marginLeft: isFullWidth && !hasOnePostSlide ? 'calc(-50vw + 50%)' : ''
      }}
    >
      <Carousel
        setApi={setApi}
        className={cn(
          isFullWidth
            ? 'relative w-screen lg:right-1/2 lg:left-1/2 lg:-mr-[50vw] lg:-ml-[50vw]'
            : isTeamMemberSlider
              ? 'w-full max-w-none'
              : 'w-full'
        )}
        opts={{
          loop: true,
          align: 'center',
          ...(isTeamMemberSlider && {
            align: 'start'
          }),
          ...(isTimelineSlider && {
            align: 'start',
            containScroll: 'trimSnaps'
          })
        }}
      >
        <CarouselContent
          className={cn(
            isTeamMemberSlider && 'lg:overflow-visible',
            isTimelineSlider && 'overflow-hidden'
          )}
        >
          {sliderData.itemsCollection.items.map((item, index) => {
            return (
              <CarouselItem
                key={`${item.sys.id}-${index}`}
                className={cn(
                  isSlider
                    ? 'basis-[411px]'
                    : isTeamMemberSlider
                      ? 'basis-[300px]'
                      : isTimelineSlider
                        ? 'basis-full'
                        : isFullWidth
                          ? 'basis-full sm:basis-4/5'
                          : 'basis-full'
                )}
              >
                <SliderCard
                  index={index}
                  current={current}
                  item={item}
                  sliderData={isTimelineSlider ? sliderData : undefined}
                  api={isTimelineSlider ? api : undefined}
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
                {/* Mobile Timeline Navigation - Separate buttons on each side */}
                <CarouselPrevious
                  className="absolute top-1/2 left-6 z-50 size-10 -translate-y-1/2 rounded border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900 lg:hidden"
                  variant="outline"
                  aria-label="Previous slide"
                />
                <CarouselNext
                  className="absolute top-1/2 right-6 z-50 size-10 -translate-y-1/2 rounded border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:bg-white hover:text-gray-900 lg:hidden"
                  variant="outline"
                  aria-label="Next slide"
                />
                {/* Desktop Timeline Navigation - Grouped together */}
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
            ) : (
              <div
                className={cn(
                  'absolute -top-12 right-29 hidden gap-4 lg:flex',
                  isTeamMemberSlider && 'right-0'
                )}
              >
                <CarouselPrevious
                  className="relative left-0 size-8 rounded-none border border-gray-300 bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900"
                  variant="outline"
                  aria-label="Previous slide"
                />
                <CarouselNext
                  className="relative right-0 size-8 rounded-none border border-gray-300 bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900"
                  variant="outline"
                  aria-label="Next slide"
                />
              </div>
            )}
          </>
        )}
      </Carousel>

      {showIndicators && (
        <div className="relative z-50 mx-auto -mt-4 flex h-1 w-[532px] flex-shrink-0 items-center gap-4">
          {sliderData.itemsCollection.items.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn('h-full flex-1 cursor-pointer bg-[#171717] opacity-30', {
                'bg-[#F5B12D] opacity-100': current === index + 1
              })}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {showAltIndicators && (
        <Container>
          <div className="mx-auto mt-12 flex h-1">
            {sliderData.itemsCollection.items.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn('h-full flex-1 cursor-pointer bg-neutral-300', {
                  'bg-surface-invert': current === index + 1
                })}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Container>
      )}

      {/* Separate Timeline Component - Only for Timeline Sliders */}
      {isTimelineSlider && (
        <div className="absolute bottom-0 z-20 bg-white px-6 py-8 lg:right-0 lg:left-1/4">
          <div className="w-full">
            {/* Timeline Bar */}
            <div className="mb-8">
              <div
                className="relative h-0.5 w-full bg-gray-200 transition-transform duration-500 ease-in-out lg:!transform-none"
                style={{
                  transform: `translateX(-${((current - 1) / (sliderData.itemsCollection.items.filter((i) => i.__typename === 'TimelineSliderItem').length - 1)) * 100}%)`
                }}
              >
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

            {/* Sliding Timeline - Shows 3 items, slides to reveal more */}
            <div className="overflow-hidden">
              <div
                className="flex gap-8 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${(current - 1) * (100 / sliderData.itemsCollection.items.filter((i) => i.__typename === 'TimelineSliderItem').length)}%)`,
                  width: `${(sliderData.itemsCollection.items.filter((i) => i.__typename === 'TimelineSliderItem').length / 2.5) * 100}%`
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
                      <div key={item.sys.id} className="flex min-w-0 flex-1 flex-col">
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

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    async function fetchSliderData() {
      try {
        setLoading(true);
        const data = await getSlidersByIds([props.sys.id]);
        if (data.length > 0 && data[0]) {
          setSliderData(data[0]);
        }
      } catch (error) {
        console.error('Error fetching slider data:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchSliderData();
  }, [props.sys.id]);

  if (loading) {
    return (
      <div className="flex h-[669px] items-center justify-center">
        <div className="text-lg">Loading slider...</div>
      </div>
    );
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

  const isPostSlider = firstItem.__typename === 'Post';
  const isImageSlider = firstItem.__typename === 'Image';
  const isTeamMemberSlider = firstItem.__typename === 'TeamMember';
  const isTimelineSliderItemSlider = firstItem.__typename === 'TimelineSliderItem';
  const isSliderItemSlider = firstItem.__typename === 'SliderItem';

  // Configure slider based on content type
  return (
    <GenericSlider
      sliderData={sliderData}
      current={current}
      api={api}
      setApi={setApi}
      showIndicators={isImageSlider}
      showAltIndicators={isSliderItemSlider || isTeamMemberSlider}
      showNavigation={
        !isImageSlider && !isSliderItemSlider && !isTimelineSliderItemSlider && !isTeamMemberSlider
      }
      showAltNavigation={isSliderItemSlider || isTimelineSliderItemSlider || isTeamMemberSlider}
      isFullWidth={
        isPostSlider && !isImageSlider && !isTeamMemberSlider && !isTimelineSliderItemSlider
      }
    />
  );
}
