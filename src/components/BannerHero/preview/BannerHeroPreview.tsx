'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { bannerHeroFields } from '@/components/BannerHero/preview/BannerHeroFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

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
          <LivePreview
            componentName="BannerHero"
            data={liveBannerHero}
            requiredFields={['sys', 'title', 'heading', 'backgroundImage']}
          >
            <BannerHero {...(liveBannerHero as BannerHeroType)} />
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={bannerHeroFields} data={liveBannerHero} title="BannerHero" />
        </div>
      </div>
    </div>
  );
}
