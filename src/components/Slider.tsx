'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSlidersByIds } from '@/lib/contentful-api/slider';
import { cn } from '@/lib/utils';
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
  FeatureSliderItem,
  TimelineSliderItem,
  TeamMember
} from '@/types/contentful';
import { AirImage } from '@/components/media/AirImage';
import { Box, Container } from '@/components/global/matic-ds';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import type { SliderItemType } from '@/types/contentful/Slider';

interface SliderCardProps {
  item: SliderItemType;
  index: number;
  current: number;
}

interface ContentOverlayProps {
  children: React.ReactNode;
}

const ContentOverlay = ({ children }: ContentOverlayProps) => (
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

  // Handle SliderItem type
  if (updatedItem.__typename === 'SliderItem') {
    const sliderItem = updatedItem as SliderItem;
    return (
      <div className={baseCardClasses}>
        <AirImage
          link={sliderItem.image?.link}
          altText={sliderItem.image?.altText}
          className="absolute h-full w-full object-cover"
        />
        <ContentOverlay>
          <Box direction="col" gap={5}>
            <Box direction="col" gap={1.5}>
              {sliderItem.heading.overline && (
                <p
                  className="text-body-sm text-white uppercase"
                  {...inspectorProps({ fieldId: 'heading.overline' })}
                >
                  {sliderItem.heading.overline}
                </p>
              )}
              <h2
                className="text-headline-sm leading-tight text-white"
                {...inspectorProps({ fieldId: 'heading.title' })}
              >
                {sliderItem.heading.title}
              </h2>
            </Box>
            {sliderItem.heading.description && (
              <p
                className="text-body-xs letter-spacing-[0.14px] leading-normal text-white"
                {...inspectorProps({ fieldId: 'heading.description' })}
              >
                {sliderItem.heading.description}
              </p>
            )}
          </Box>
        </ContentOverlay>
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

  // Handle FeatureSliderItem type
  if (updatedItem.__typename === 'FeatureSliderItem') {
    const featureSliderItem = updatedItem as FeatureSliderItem;
    const isCurrentSlide = current === index + 1;

    return (
      <Box
        direction="col"
        gap={4}
        className={cn('bg-subtle w-full p-8', isCurrentSlide && 'bg-primary')}
      >
        <div className={cn('w-fit bg-black p-[0.38rem]', current === index + 1 && 'bg-white')}>
          <Image
            src={featureSliderItem.icon?.url ?? ''}
            alt={featureSliderItem.title}
            className={cn('filter', isCurrentSlide ? 'invert' : '')}
            width={60}
            height={60}
          />
        </div>
        <Box direction="col" gap={2}>
          <h3 className={cn('!text-headline-sm', isCurrentSlide && 'text-text-on-invert')}>
            {featureSliderItem.title}
          </h3>
          <p className={cn('!text-body-sm', isCurrentSlide && 'text-text-on-invert')}>
            {featureSliderItem.description}
          </p>
        </Box>
      </Box>
    );
  }

  if (updatedItem.__typename === 'TimelineSliderItem') {
    const timelineItem = updatedItem as TimelineSliderItem;
    const isCurrentSlide = current === index + 1;

    return (
      <div className="relative h-[669px]">
        {/* Main Image/Video Section */}
        <div className="relative h-[400px] w-full">
          {timelineItem.asset.__typename === 'Video'
            ? (() => {
                const videoAsset = timelineItem.asset as {
                  __typename: 'Video';
                  posterImage: { link?: string; altText?: string };
                };
                return (
                  <div className="relative h-full w-full">
                    <AirImage
                      link={videoAsset.posterImage.link ?? ''}
                      altText={videoAsset.posterImage.altText ?? 'Video thumbnail'}
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
            : timelineItem.asset.__typename === 'Image'
              ? (() => {
                  const imageAsset = timelineItem.asset as {
                    __typename: 'Image';
                    link?: string;
                    altText?: string;
                  };
                  return (
                    <AirImage
                      link={imageAsset.link ?? ''}
                      altText={imageAsset.altText ?? ''}
                      className="h-full w-full object-cover"
                    />
                  );
                })()
              : null}
        </div>

        {/* Timeline Content Section - Individual slide content */}
        <div className="flex h-[269px] flex-col justify-center bg-white px-6 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Timeline Year - Only show current slide prominently */}
            <div className="mb-4">
              <h3
                className={cn(
                  'text-4xl font-light transition-colors duration-300',
                  isCurrentSlide ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {timelineItem.year}
              </h3>
            </div>

            {/* Timeline Description - Only show for current slide */}
            {isCurrentSlide && (
              <div className="max-w-md text-gray-600">
                <p className="text-sm leading-relaxed">{timelineItem.description}</p>
              </div>
            )}
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
  showNavigation = true,
  showAltNavigation = false,
  isFullWidth = true
}: GenericSliderProps) => {
  const isFeatureSlider = sliderData.itemsCollection.items[0]?.__typename === 'FeatureSliderItem';
  const isTeamMemberSlider = sliderData.itemsCollection.items[0]?.__typename === 'TeamMember';

  return (
    <div
      className={cn(isFullWidth ? 'relative w-screen' : 'relative')}
      style={{ marginLeft: isFullWidth ? 'calc(-50vw + 50%)' : '' }}
    >
      <Carousel
        setApi={setApi}
        className={cn(
          isFullWidth
            ? 'relative w-screen lg:right-1/2 lg:left-1/2 lg:-mr-[50vw] lg:-ml-[25vw] lg:-ml-[50vw]'
            : isTeamMemberSlider
              ? 'w-full max-w-none'
              : 'w-full'
        )}
        opts={{
          loop: true,
          align: 'center',
          ...(isTeamMemberSlider && {
            align: 'start'
          })
        }}
      >
        <CarouselContent className={cn(isTeamMemberSlider && 'lg:overflow-visible')}>
          {sliderData.itemsCollection.items.map((item, index) => {
            return (
              <CarouselItem
                key={`${item.sys.id}-${index}`}
                className={cn(
                  isFeatureSlider
                    ? 'basis-[411px]'
                    : isTeamMemberSlider
                      ? 'basis-[300px]'
                      : isFullWidth
                        ? 'basis-full sm:basis-4/5'
                        : 'basis-full'
                )}
              >
                <SliderCard index={index} current={current} item={item} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {showNavigation && (
          <>
            <CarouselPrevious
              className="left-2 size-10 rounded-none border-1 border-white bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 sm:left-10 sm:size-12"
              variant="outline"
              aria-label="Previous slide"
            />
            <CarouselNext
              className="right-2 size-10 rounded-none border-1 border-white bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 sm:right-10 sm:size-12"
              variant="outline"
              aria-label="Next slide"
            />
          </>
        )}
        {showAltNavigation && (
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

  const isImageSlider = firstItem.__typename === 'Image';
  const isFeatureSliderItemSlider = firstItem.__typename === 'FeatureSliderItem';
  const isTimelineSliderItemSlider = firstItem.__typename === 'TimelineSliderItem';
  const isTeamMemberSlider = firstItem.__typename === 'TeamMember';

  // Configure slider based on content type
  return (
    <GenericSlider
      sliderData={sliderData}
      current={current}
      api={api}
      setApi={setApi}
      showIndicators={isImageSlider}
      showAltIndicators={isFeatureSliderItemSlider || isTeamMemberSlider}
      showNavigation={
        !isImageSlider &&
        !isFeatureSliderItemSlider &&
        !isTimelineSliderItemSlider &&
        !isTeamMemberSlider
      }
      showAltNavigation={
        isFeatureSliderItemSlider || isTimelineSliderItemSlider || isTeamMemberSlider
      }
      isFullWidth={!isImageSlider && !isTeamMemberSlider}
    />
  );
}
