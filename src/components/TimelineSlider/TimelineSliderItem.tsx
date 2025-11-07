'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { AirImage } from '@/components/Image/AirImage';

import type { Image as ImageType } from '@/components/Image/ImageSchema';
import type { TimelineSliderItem as TimelineSliderItemType } from '@/components/TimelineSlider/TimelineSliderItemSchema';

export function TimelineSliderItem(props: TimelineSliderItemType) {
  const updatedItem = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({
    entryId: updatedItem.sys.id
  });

  if (!updatedItem.asset) {
    console.warn('TimelineSliderItem: No asset available for item:', updatedItem.sys.id);
    return (
      <div className="flex h-[669px] items-center justify-center bg-gray-100">
        <p className="text-gray-500">No asset available</p>
      </div>
    );
  }

  // Debug logging
  console.warn('TimelineSliderItem asset:', {
    id: updatedItem.sys.id,
    assetType: updatedItem.asset.__typename,
    hasLink: !!(updatedItem.asset as ImageType).link,
    asset: updatedItem.asset
  });

  // Check if it's a video and render as image instead
  const isVideo = updatedItem.asset.__typename === 'Video';

  // For videos, try to use poster image if available, otherwise show placeholder
  if (isVideo) {
    const videoAsset = updatedItem.asset as any;
    const posterImage = videoAsset.posterImage;
    
    if (posterImage?.link) {
      console.warn('Using poster image for video:', posterImage);
      return (
        <div {...inspectorProps} className="relative h-[669px] bg-white pb-32 lg:pb-16">
          <div className="absolute inset-0 z-0">
            <AirImage
              {...posterImage}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Content overlay */}
          <div className="relative z-20 flex h-full flex-col justify-end p-8 lg:p-16">
            <div className="max-w-2xl">
              <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-lg font-semibold text-white">{updatedItem.year}</span>
              </div>
              <p className="text-lg leading-relaxed text-white lg:text-xl">{updatedItem.description}</p>
            </div>
          </div>
        </div>
      );
    } else {
      // No poster image available for video
      return (
        <div {...inspectorProps} className="relative h-[669px] bg-gray-200 pb-32 lg:pb-16">
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <p className="text-gray-500">Video asset - no poster image available</p>
          </div>
          {/* Content overlay */}
          <div className="relative z-20 flex h-full flex-col justify-end p-8 lg:p-16">
            <div className="max-w-2xl">
              <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-lg font-semibold text-black">{updatedItem.year}</span>
              </div>
              <p className="text-lg leading-relaxed text-black lg:text-xl">{updatedItem.description}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  // For images, use the same logic as regular Slider component
  const imageAsset = updatedItem.asset as ImageType;
  
  // If no link but has sys.id, let AirImage fetch it (this triggers Vercel protection bypass)
  if (!imageAsset.link && imageAsset.sys?.id) {
    return (
      <div {...inspectorProps} className="relative h-[669px] bg-white pb-32 lg:pb-16">
        <div className="absolute inset-0 z-0">
          <AirImage
            sys={{ id: imageAsset.sys.id }}
            altText={imageAsset?.altText ?? ''}
            mobileOrigin={imageAsset?.mobileOrigin}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="relative z-20 flex h-full flex-col justify-end p-8 lg:p-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <span className="text-lg font-semibold text-white">{updatedItem.year}</span>
            </div>
            <p className="text-lg leading-relaxed text-white lg:text-xl">{updatedItem.description}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If has link, use it directly
  if (imageAsset.link) {
    return (
      <div {...inspectorProps} className="relative h-[669px] bg-white pb-32 lg:pb-16">
        <div className="absolute inset-0 z-0">
          <AirImage
            link={imageAsset.link}
            altText={imageAsset?.altText ?? ''}
            mobileOrigin={imageAsset?.mobileOrigin}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="relative z-20 flex h-full flex-col justify-end p-8 lg:p-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <span className="text-lg font-semibold text-white">{updatedItem.year}</span>
            </div>
            <p className="text-lg leading-relaxed text-white lg:text-xl">{updatedItem.description}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback: show placeholder if no link or ID available
  return (
    <div {...inspectorProps} className="relative h-[669px] bg-gray-200 pb-32 lg:pb-16">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <p className="text-gray-500">Image asset - no link or ID available</p>
      </div>
      {/* Content overlay */}
      <div className="relative z-20 flex h-full flex-col justify-end p-8 lg:p-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-lg font-semibold text-black">{updatedItem.year}</span>
          </div>
          <p className="text-lg leading-relaxed text-black lg:text-xl">{updatedItem.description}</p>
        </div>
      </div>
    </div>
  );
}
