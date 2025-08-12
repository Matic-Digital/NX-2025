'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { AirImage } from '@/components/media/AirImage';
import { Section } from '@/components/global/matic-ds';
import { SectionHeading } from '@/components/SectionHeading';
import type { BannerHero } from '@/types/contentful/BannerHero';

export function BannerHero(props: BannerHero) {
  const bannerHero = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: bannerHero?.sys?.id });

  console.log('BannerHero props:', props);
  console.log('BannerHero bannerHero:', bannerHero);
  console.log('BannerHero heading data:', bannerHero?.heading);

  return (
    <ErrorBoundary>
      <Section className="relative flex h-[789px] items-end" {...inspectorProps}>
        {/* Background Image */}
        <AirImage
          link={bannerHero.backgroundImage.link}
          altText={bannerHero.backgroundImage.altText}
          className="absolute inset-0 h-[789px] w-full object-cover"
          priority
        />

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto w-full px-6 lg:px-8">
          <SectionHeading {...bannerHero.heading} componentType="banner-hero" />
        </div>
      </Section>
    </ErrorBoundary>
  );
}
