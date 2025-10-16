'use client';

import { useContentfulInspectorMode, useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { AirImage } from '@/components/Image/AirImage';
import { MuxVideoPlayer } from '@/components/Video/MuxVideo';

import type { TimelineSliderItem as TimelineSliderItemType } from '@/components/TimelineSlider/TimelineSliderItemSchema';
import type { Image as ImageType } from '@/components/Image/ImageSchema';
import type { Video as VideoType } from '@/components/Video/VideoSchema';

export function TimelineSliderItem(props: TimelineSliderItemType) {
  const updatedItem = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({
    entryId: updatedItem.sys.id
  });

  if (!updatedItem.asset) {
    return (
      <div className="flex h-[669px] items-center justify-center bg-gray-100">
        <p className="text-gray-500">No asset available</p>
      </div>
    );
  }

  const isImage = updatedItem.asset.__typename === 'Image';
  const isVideo = updatedItem.asset.__typename === 'Video';

  return (
    <div {...inspectorProps} className="relative h-[669px] bg-white pb-32 lg:pb-16">
      <div className="absolute inset-0 z-0">
        {isImage && (
          <AirImage
            {...(updatedItem.asset as ImageType)}
            className="h-full w-full object-cover"
            priority
          />
        )}
        {isVideo && (
          <div className="h-full w-full">
            <MuxVideoPlayer {...(updatedItem.asset as VideoType)} />
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content overlay */}
      <div className="relative z-20 flex h-full flex-col justify-end p-8 lg:p-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-lg font-semibold text-white">{updatedItem.year}</span>
          </div>
          <p className="text-lg leading-relaxed text-white lg:text-xl">
            {updatedItem.description}
          </p>
        </div>
      </div>
    </div>
  );
}
