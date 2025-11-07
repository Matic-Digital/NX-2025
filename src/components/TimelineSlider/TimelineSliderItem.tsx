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

  // Force all assets to be treated as images for timeline slider
  return (
    <div {...inspectorProps} className="relative h-[669px] bg-white pb-32 lg:pb-16">
      <div className="absolute inset-0 z-0">
        <AirImage
          {...(updatedItem.asset as ImageType)}
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
