'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { bannerHeroFields } from '@/components/BannerHero/preview/BannerHeroFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { BannerHero as BannerHeroType } from '@/components/BannerHero/BannerHeroSchema';

/**
 * BannerHero Preview Component
 *
 * This component is used in Contentful Live Preview to display BannerHero components
 * with a live preview and field breakdown.
 */
export function BannerHeroPreview(props: Partial<BannerHeroType>) {
  // Contentful Live Preview integration
  const liveBannerHero = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                BannerHero
              </span>
            </div>
            <div className="overflow-hidden">
              {liveBannerHero?.sys &&
              liveBannerHero?.title &&
              liveBannerHero?.heading &&
              liveBannerHero?.backgroundImage ? (
                <BannerHero {...(liveBannerHero as BannerHeroType)} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Preview will appear when all required fields are configured:</p>
                  <ul className="mt-2 text-sm">
                    {!props.title && <li>• Title is required</li>}
                    {!props.heading && <li>• Heading is required</li>}
                    {!props.backgroundImage && <li>• Background Image is required</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={bannerHeroFields} data={liveBannerHero} title="BannerHero" />
        </div>
      </div>
    </div>
  );
}
