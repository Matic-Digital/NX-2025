import { cn } from '@/lib/utils';

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

  // Section styling logic
  const getSectionClasses = () => {
    return cn(
      'relative flex h-[789px]',
      isCenteredSectionHeading || isImageBetween ? 'items-center' : 'items-end',
      'dark'
    );
  };

  // Content positioning logic
  const getContentClasses = () => {
    return cn('relative z-10 container mx-auto w-full px-6 lg:px-8');
  };

  // Background image styling logic
  const getBackgroundImageClasses = () => {
    return 'absolute inset-0 h-[789px] w-full object-cover';
  };

  return {
    isCenteredSectionHeading,
    isImageBetween,
    getSectionClasses,
    getContentClasses,
    getBackgroundImageClasses
  };
};
