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
import type { Slider, SliderSys, SliderItem, SliderItemOrImage, Image } from '@/types/contentful';
import { AirImage } from '@/components/media/AirImage';
import { Box } from '@/components/global/matic-ds';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

const SliderItem = ({
  item,
  index,
  current
}: {
  item: SliderItemOrImage;
  index: number;
  current: number;
}) => {
  const sliderItem = useContentfulLiveUpdates(item);
  const inspectorProps = useContentfulInspectorMode({ entryId: sliderItem?.sys?.id });

  // Type guard to check if item is a SliderItem (has heading and image properties)
  const isSliderItem = 'heading' in sliderItem && 'image' in sliderItem;
  // Type guard to check if item is an Image (has link property)
  const isImage = 'link' in sliderItem && !('heading' in sliderItem);

  return (
    <div
      className={cn('text-primary-foreground relative h-[669px] transition-all duration-500', {
        'opacity-80': index !== current - 1
      })}
    >
      <AirImage
        link={isSliderItem ? sliderItem.image?.link : isImage ? sliderItem.link : undefined}
        altText={
          isSliderItem ? sliderItem.image?.altText : isImage ? sliderItem.altText : undefined
        }
        className="absolute h-full w-full object-cover"
      />
      {/* Content overlay - only show for SliderItem, for Image just show the image */}
      {isSliderItem && (
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
      )}
      {/* For Image items, show a simple title overlay */}
      {isImage && (
        <div className="relative h-full">
          <div className="flex h-full w-full flex-col justify-end p-10">
            <div className="rounded-[2px] bg-black/20 p-4 backdrop-blur-[14px]">
              <h2 className="text-headline-sm leading-tight text-white">{sliderItem.title}</h2>
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
    const fetchSliderData = async () => {
      try {
        const sliders = await getSlidersByIds([props.sys.id]);
        if (sliders.length > 0 && sliders[0]) {
          setSliderData(sliders[0]);
        }
      } catch (error) {
        console.error('Error fetching slider data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSliderData();
  }, [props.sys.id]);

  if (loading) {
    return <div>Loading slider...</div>;
  }

  if (!sliderData) {
    return <div>Slider not found</div>;
  }

  return (
    <Carousel
      setApi={setApi}
      className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen md:-ml-[25vw] lg:-ml-[50vw]"
      opts={{ loop: true }}
    >
      <CarouselContent>
        {sliderData.itemsCollection.items.map((item, index) => (
          <CarouselItem key={`${item.sys.id}-${index}`} className="basis-full sm:basis-4/5">
            <SliderItem index={index} current={current} item={item} />
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
  );
}
