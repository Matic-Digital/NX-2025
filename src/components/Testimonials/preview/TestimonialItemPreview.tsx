'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';
import { testimonialItemFields } from '@/components/Testimonials/preview/TestimonialItemFields';

import type { TestimonialItem as TestimonialItemType } from '@/components/Testimonials/TestimonialsSchema';

/**
 * TestimonialItem Preview Component
 *
 * This component is used in Contentful Live Preview to display TestimonialItem components
 * with a live preview and field breakdown.
 */
export function TestimonialItemPreview(props: Partial<TestimonialItemType>) {
  // Contentful Live Preview integration
  const liveTestimonialItem = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                TestimonialItem
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have the sys field (minimum requirement)
                const hasMinimumFields = liveTestimonialItem?.sys;

                if (hasMinimumFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (testimonial item)
                        </h3>

                        {/* Testimonial Item Preview */}
                        <TestimonialItem item={liveTestimonialItem as TestimonialItemType} />
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when the testimonial item is configured.</p>
                    <p className="text-sm mt-2">
                      Add quote, author name, author title, and headshot for best results.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown
            title="TestimonialItem Fields"
            fields={testimonialItemFields}
            data={liveTestimonialItem}
          />
        </div>
      </div>
    </div>
  );
}
