'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { cn } from '@/lib/utils';

import { BannerHeroSkeleton } from '@/components/BannerHero/BannerHeroSkeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Section } from '@/components/global/matic-ds';
import { AirImage } from '@/components/Image/AirImage';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';

import type { BannerHero } from '@/components/BannerHero/BannerHeroSchema';

interface BannerHeroProps extends BannerHero {
  productContext?: {
    type: 'product';
  };
  contentType?: string;
}

export function BannerHero(props: BannerHeroProps) {
  const bannerHero = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: bannerHero?.sys?.id });
  const isCenteredSectionHeading = bannerHero.heading.variant === 'Centered';
  const isImageBetween = props.contentType === 'ImageBetween';

  if (!bannerHero) {
    return <BannerHeroSkeleton />;
  }

  return (
    <ErrorBoundary>
      <Section
        className={cn(
          'relative flex h-[789px]',
          isCenteredSectionHeading || isImageBetween ? 'items-center' : 'items-end',
          'dark'
        )}
        {...inspectorProps}
      >
        {/* Background Image */}
        <AirImage
          link={bannerHero.backgroundImage.link}
          altText={bannerHero.backgroundImage.altText}
          className="absolute inset-0 h-[789px] w-full object-cover"
        />

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto w-full px-6 lg:px-8">
          <SectionHeading
            sectionHeadingId={bannerHero.heading.sys.id}
            variant={bannerHero.heading.variant}
            componentType="banner-hero"
          />
        </div>
      </Section>
    </ErrorBoundary>
  );
}
