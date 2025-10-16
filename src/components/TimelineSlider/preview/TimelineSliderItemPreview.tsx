'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { timelineSliderItemFields } from '@/components/TimelineSlider/preview/TimelineSliderItemFields';
import { TimelineSliderItem } from '@/components/TimelineSlider/TimelineSliderItem';

import type { TimelineSliderItem as TimelineSliderItemType } from '@/components/TimelineSlider/TimelineSliderItemSchema';

/**
 * TimelineSliderItem Preview Component
 *
 * This component is used in Contentful Live Preview to display TimelineSliderItem components
 * with a live preview and field breakdown.
 */
export function TimelineSliderItemPreview(props: Partial<TimelineSliderItemType>) {
  // Contentful Live Preview integration
  const liveTimelineSliderItem = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                TimelineSliderItem
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have the minimum required fields
                const hasMinimumFields =
                  liveTimelineSliderItem?.sys && liveTimelineSliderItem?.year;

                if (hasMinimumFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (timeline slider item)
                        </h3>

                        {/* Timeline Slider Item Preview */}
                        <div className="rounded-lg overflow-hidden shadow-lg">
                          <TimelineSliderItem
                            {...(liveTimelineSliderItem as TimelineSliderItemType)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when the timeline slider item is configured.</p>
                    <p className="text-sm mt-2">
                      Add year, description, and background asset for best results.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown
            title="TimelineSliderItem Fields"
            fields={timelineSliderItemFields}
            data={liveTimelineSliderItem}
          />
        </div>
      </div>
    </div>
  );
}
