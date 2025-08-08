'use client';

import { useEffect, useState } from 'react';
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
import type { Slider, SliderSys, SliderItem, PostSliderItem, Image } from '@/types/contentful';
import { AirImage } from '@/components/media/AirImage';
import { Box } from '@/components/global/matic-ds';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

type SliderItemType = SliderItem | PostSliderItem | Image;

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
    const imageItem = updatedItem as Image;
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
  showNavigation?: boolean;
  fullWidth?: boolean;
}

const GenericSlider = ({
  sliderData,
  current,
  api,
  setApi,
  showIndicators = false,
  showNavigation = true,
  fullWidth = true
}: GenericSliderProps) => {
  return (
    <div
      className={cn(fullWidth ? 'relative w-screen' : 'relative')}
      style={fullWidth ? { marginLeft: 'calc(-50vw + 50%)' } : {}}
    >
      <Carousel
        setApi={setApi}
        className={cn(
          fullWidth
            ? 'relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen md:-ml-[25vw] lg:-ml-[50vw]'
            : 'w-full'
        )}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {sliderData.itemsCollection.items.map((item, index) => (
            <CarouselItem
              key={`${item.sys.id}-${index}`}
              className={cn(fullWidth ? 'basis-full sm:basis-4/5' : 'basis-full')}
            >
              <SliderCard index={index} current={current} item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNavigation && (
          <>
            <CarouselPrevious
              className="left-2 size-10 rounded-none border-1 border-white bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 sm:left-10 sm:size-12"
              variant="outline"
            />
            <CarouselNext
              className="right-2 size-10 rounded-none border-1 border-white bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 sm:right-10 sm:size-12"
              variant="outline"
            />
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
            />
          ))}
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

  const isImageSlider = firstItem.__typename === 'Image';

  // Configure slider based on content type
  return (
    <GenericSlider
      sliderData={sliderData}
      current={current}
      api={api}
      setApi={setApi}
      showIndicators={isImageSlider}
      showNavigation={!isImageSlider}
      fullWidth={!isImageSlider}
    />
  );
}
