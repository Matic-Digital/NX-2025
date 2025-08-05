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
import type { Slider, SliderSys, SliderItem, Image } from '@/types/contentful';
import { AirImage } from '@/components/media/AirImage';
import { Box } from '@/components/global/matic-ds';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

// SliderItem component for SliderItem types
const SliderItemCard = ({
  item,
  index,
  current
}: {
  item: SliderItem;
  index: number;
  current: number;
}) => {
  const sliderItem = useContentfulLiveUpdates(item);
  const inspectorProps = useContentfulInspectorMode({ entryId: sliderItem?.sys?.id });

  return (
    <div
      className={cn('text-primary-foreground relative h-[669px] transition-all duration-500', {
        'opacity-80': index !== current - 1
      })}
    >
      <AirImage
        link={sliderItem.image?.link}
        altText={sliderItem.image?.altText}
        className="absolute h-full w-full object-cover"
      />
      {/* Content overlay for SliderItem */}
      <div className="relative h-full">
        <div
          className="flex h-full w-full max-w-[393px] flex-col justify-end rounded-[2px] p-10 backdrop-blur-[14px]"
          style={{
            background:
              'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
          }}
        >
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
        </div>
      </div>
    </div>
  );
};

// ImageCard component for Image types
const ImageCard = ({ item, index, current }: { item: Image; index: number; current: number }) => {
  const imageItem = useContentfulLiveUpdates(item);

  return (
    <div
      className={cn('text-primary-foreground relative h-[669px] transition-all duration-500', {
        'opacity-80': index !== current - 1
      })}
    >
      <AirImage
        link={imageItem.link}
        altText={imageItem.altText}
        className="absolute h-full w-full object-cover"
      />
    </div>
  );
};

// SliderItem-based Slider (current implementation)
const SliderItemSlider = ({
  sliderData,
  current,
  setApi
}: {
  sliderData: Slider;
  current: number;
  api: CarouselApi | undefined;
  setApi: (api: CarouselApi) => void;
}) => {
  return (
    <div className="relative w-screen" style={{ marginLeft: 'calc(-50vw + 50%)' }}>
      <Carousel
        setApi={setApi}
        className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen md:-ml-[25vw] lg:-ml-[50vw]"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {sliderData.itemsCollection.items.map((item, index) => (
            <CarouselItem key={`${item.sys.id}-${index}`} className="basis-full sm:basis-4/5">
              <SliderItemCard index={index} current={current} item={item as SliderItem} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-2 size-10 rounded-none border-1 border-white bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 sm:left-10 sm:size-12"
          variant="outline"
        />
        <CarouselNext
          className="right-2 size-10 rounded-none border-1 border-white bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 sm:right-10 sm:size-12"
          variant="outline"
        />
      </Carousel>
    </div>
  );
};

// Image-based Slider (new implementation for you to style)
const ImageSlider = ({
  sliderData,
  current,
  api,
  setApi
}: {
  sliderData: Slider;
  current: number;
  api: CarouselApi | undefined;
  setApi: (api: CarouselApi) => void;
}) => {
  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {sliderData.itemsCollection.items.map((item, index) => (
            <CarouselItem key={`${item.sys.id}-${index}`} className="basis-full">
              <ImageCard index={index} current={current} item={item as Image} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="relative z-50 mx-auto -mt-4 flex h-1 w-[532px] flex-shrink-0 items-center gap-4">
        {sliderData.itemsCollection.items.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn('h-full flex-1 bg-[#171717] opacity-30', {
              'bg-[#F5B12D] opacity-100': current === index + 1
            })}
          />
        ))}
      </div>
    </div>
  );
};

export function Slider(props: SliderSys) {
  const [sliderData, setSliderData] = useState<Slider | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('Slider props', props);
  console.log('Slider data:', sliderData);

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

  // Determine which slider to render based on the first item's type
  const firstItem = sliderData.itemsCollection.items[0];
  if (!firstItem) {
    return (
      <div className="flex h-[669px] items-center justify-center">
        <div className="text-lg">No slider items found</div>
      </div>
    );
  }

  const isImageSlider = firstItem.__typename === 'Image';
  const isSliderItemSlider = firstItem.__typename === 'SliderItem';

  console.log('First item type:', firstItem.__typename);
  console.log('Rendering ImageSlider:', isImageSlider);
  console.log('Rendering SliderItemSlider:', isSliderItemSlider);

  // Render appropriate slider based on item types
  if (isImageSlider) {
    return <ImageSlider sliderData={sliderData} current={current} api={api} setApi={setApi} />;
  }

  if (isSliderItemSlider) {
    return <SliderItemSlider sliderData={sliderData} current={current} api={api} setApi={setApi} />;
  }

  // Fallback for mixed or unknown types
  return (
    <div className="flex h-[669px] items-center justify-center">
      <div className="text-lg">Unsupported slider item types</div>
    </div>
  );
}
