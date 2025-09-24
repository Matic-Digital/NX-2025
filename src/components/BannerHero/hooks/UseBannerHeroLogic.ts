import type { BannerHero } from '@/components/BannerHero/BannerHeroSchema';

interface BannerHeroProps extends BannerHero {
  productContext?: {
    type: 'product';
  };
  contentType?: string;
}

/**
 * Business logic for BannerHero layout and behavior
 * Handles layout calculations and variant logic
 */
export const useBannerHeroLogic = (props: BannerHeroProps, bannerHero: BannerHero | null) => {
  // Layout logic based on variant and content type
  const isCenteredSectionHeading = bannerHero?.heading.variant === 'Centered';
  const isImageBetween = props.contentType === 'ImageBetween';

  return {
    isCenteredSectionHeading,
    isImageBetween
  };
};
