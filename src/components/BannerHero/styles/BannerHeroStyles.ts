import { cn } from '@/lib/utils';

/**
 * Pure styling utilities for BannerHero components
 * Contains all CSS class generation logic
 */

export const bannerHeroStyles = {
  /**
   * Get CSS classes for the main section container
   */
  getSectionClasses: (isCenteredSectionHeading: boolean, isImageBetween: boolean) => {
    return cn(
      'relative flex',
      isImageBetween ? 'h-[789px]' : 'max-h-[100vh] h-[789px]',
      isCenteredSectionHeading || isImageBetween ? 'items-center justify-center' : 'items-end',
      'dark'
    );
  },

  /**
   * Get CSS classes for the content container
   */
  getContentClasses: () => {
    return cn('relative z-10 container mx-auto w-full px-6 lg:px-8');
  },

  /**
   * Get CSS classes for the background image
   */
  getBackgroundImageClasses: (isImageBetween?: boolean) => {
    return cn(
      'absolute inset-0 w-full object-cover',
      isImageBetween ? 'h-[calc(789px+4rem)]' : 'h-full'
    );
  },

  /**
   * Get CSS classes for the overlay content
   */
  getOverlayClasses: () => {
    return 'relative z-10 w-full flex justify-center min-h-0';
  }
};
