'use client';

import { Slider } from './Slider';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
import { sliderFields } from '@/components/Slider/preview/SliderFields';

import type { Slider as SliderType } from './SliderSchema';

interface SliderPreviewProps extends Partial<SliderType> {
  sliderId?: string;
}

/**
 * Slider Preview Component
 *
 * This component is used in Contentful Live Preview to display Slider components
 * with a live preview and field breakdown.
 */
export function SliderPreview(props: SliderPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="Slider"
            data={props}
            requiredFields={['sys', 'title', 'itemsCollection']}
          >
            <Slider {...(props as SliderType)} />
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={sliderFields} data={props as SliderType} title="Slider" />
        </div>
      </div>
    </div>
  );
}
