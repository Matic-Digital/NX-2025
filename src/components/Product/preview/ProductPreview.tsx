'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { productFields } from '@/components/Product/preview/ProductFields';
import { ProductCard } from '@/components/Product/ProductCard';

import type { Product } from '@/components/Product/ProductSchema';

/**
 * This component is used in Contentful Live Preview to display Product components
 * with a live preview and field breakdown.
 */
export function ProductPreview(props: Partial<Product>) {
  // Contentful Live Preview integration
  const liveProduct = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveProduct?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Product
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Product
                const hasRequiredFields =
                  liveProduct?.sys && liveProduct?.title && liveProduct?.slug;

                if (hasRequiredFields && liveProduct.sys && liveProduct.title) {
                  return (
                    <div className="overflow-hidden p-6 max-w-xl mx-auto">
                      <div className="grid gap-6">
                        <ProductCard
                          sys={{ id: liveProduct.sys.id }}
                          title={liveProduct.title}
                          {...inspectorProps}
                        />
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveProduct?.title && <li>• Title is required</li>}
                      {!liveProduct?.slug && <li>• Slug is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={productFields} data={liveProduct} />
        </div>
      </div>
    </div>
  );
}
