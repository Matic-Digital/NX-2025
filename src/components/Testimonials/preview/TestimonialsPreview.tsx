'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Box } from '@/components/global/matic-ds';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Testimonials
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for valid Testimonials
                const hasRequiredFields = liveTestimonials?.sys && liveTestimonials?.title;

                const hasItems =
                  liveTestimonials?.itemsCollection?.items &&
                  liveTestimonials.itemsCollection.items.length > 0;

                console.log('⭐ hasItems', hasItems);

                if (hasRequiredFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (testimonials section)
                        </h3>

                        {/* Title */}
                        <h2 className="text-2xl font-bold mb-6">{liveTestimonials.title}</h2>

                        {/* Testimonials Grid */}
                        {hasItems ? (
                          <Box direction={{ base: 'col', md: 'row' }} gap={8}>
                            {liveTestimonials.itemsCollection!.items.map((item) => (
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
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveTestimonials?.title && <li>• Title is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

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
