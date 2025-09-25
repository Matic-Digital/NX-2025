'use client';

import { Section } from '@/components/global/matic-ds';

import { bannerHeroStyles } from '@/components/BannerHero/styles/BannerHeroStyles';
import { AirImage } from '@/components/Image/AirImage';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';

import type { BannerHero } from '@/components/BannerHero/BannerHeroSchema';

interface BannerHeroContentProps {
  bannerHero: BannerHero;
  inspectorProps: (options: { fieldId: string }) => Record<string, unknown> | null;
  isCenteredSectionHeading: boolean;
  isImageBetween: boolean;
}

/**
 * Pure presentation component for BannerHero content
 * Handles only UI rendering, no business logic or data fetching
 */
export const BannerHeroContent = ({
  bannerHero,
  inspectorProps,
  isCenteredSectionHeading,
  isImageBetween
}: BannerHeroContentProps) => {
  return (
    <Section
      className={bannerHeroStyles.getSectionClasses(isCenteredSectionHeading, isImageBetween)}
      {...inspectorProps}
    >
      {/* Background Image */}
      <AirImage
        link={bannerHero.backgroundImage.link}
        altText={bannerHero.backgroundImage.altText}
        className={bannerHeroStyles.getBackgroundImageClasses()}
      />

      {/* Content Overlay */}
      <div className={bannerHeroStyles.getOverlayClasses()}>
        <div className={bannerHeroStyles.getContentClasses()}>
          <SectionHeading
            sectionHeadingId={bannerHero.heading.sys.id}
            variant={bannerHero.heading.variant}
            componentType="banner-hero"
          />
        </div>
      </div>
    </Section>
  );
};
