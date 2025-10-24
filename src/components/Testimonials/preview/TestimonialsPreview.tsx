'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Box } from '@/components/global/matic-ds';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { createCollectionValidation, LivePreview } from '@/components/Preview/LivePreview';
import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';
import { testimonialsFields } from '@/components/Testimonials/preview/TestimonialsFields';

import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';

/**
 * Testimonials Preview Component
 *
 * This component is used in Contentful Live Preview to display Testimonials components
 * with a live preview and field breakdown.
 */
export function TestimonialsPreview(props: Partial<TestimonialsType>) {
  // Contentful Live Preview integration
  const liveTestimonials = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <LivePreview
            componentName="Testimonials"
            data={liveTestimonials}
            customValidation={(data) =>
              createCollectionValidation(data, ['sys', 'title'], 'itemsCollection', true)
            }
          >
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">
                  Preview (testimonials section)
                </h3>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-6">{liveTestimonials.title}</h2>

                {/* Testimonials Grid */}
                {liveTestimonials?.itemsCollection?.items?.length ? (
                  <Box direction={{ base: 'col', md: 'row' }} gap={8}>
                    {liveTestimonials.itemsCollection.items.map((item) => (
                      <TestimonialItem key={item.sys?.id} item={item} />
                    ))}
                  </Box>
                ) : (
                  <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>No testimonial items added yet.</p>
                    <p className="text-sm mt-2">
                      Add testimonial items to see them displayed here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown
            title="Testimonials Fields"
            fields={testimonialsFields}
            data={liveTestimonials}
          />
        </div>
      </div>
    </div>
  );
}
