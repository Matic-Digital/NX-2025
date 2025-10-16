'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { SolutionCard } from '@/components/Solution/SolutionCard';
import { solutionFields } from '@/components/Solution/preview/SolutionFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Solution as SolutionType } from '@/components/Solution/SolutionSchema';

/**
 * Solution Preview Component
 *
 * This component is used in Contentful Live Preview to display Solution components
 * with a live preview and field breakdown.
 */
export function SolutionPreview(props: Partial<SolutionType>) {
  // Contentful Live Preview integration
  const liveSolution = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Solution
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Solution
                const hasRequiredFields =
                  liveSolution?.sys &&
                  liveSolution?.title &&
                  liveSolution?.slug &&
                  liveSolution?.variant &&
                  liveSolution?.description;

                if (hasRequiredFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (solution card - {liveSolution.variant})
                        </h3>
                        <div className="flex justify-center">
                          <SolutionCard {...(liveSolution as SolutionType)} />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveSolution?.title && <li>• Title is required</li>}
                      {!liveSolution?.slug && <li>• Slug is required</li>}
                      {!liveSolution?.variant && <li>• Variant is required</li>}
                      {!liveSolution?.description && <li>• Description is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown title="Solution Fields" fields={solutionFields} data={liveSolution} />
        </div>
      </div>
    </div>
  );
}
