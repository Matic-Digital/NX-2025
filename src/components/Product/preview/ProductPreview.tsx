'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <LivePreview componentName="Product" data={liveProduct} requiredFields={['sys', 'title']}>
            <div className="overflow-hidden p-6 max-w-xl mx-auto">
              <div className="grid gap-6">
                <ProductCard sys={liveProduct.sys!} title={liveProduct.title!} />
              </div>
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={productFields} data={liveProduct} />
        </div>
      </div>
    </div>
  );
}
