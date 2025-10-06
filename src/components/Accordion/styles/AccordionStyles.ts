import { cn } from '@/lib/utils';

/**
 * Pure styling utilities for Accordion components
 * Contains all CSS class generation logic
 */

export const accordionStyles = {
  getBackgroundImageClasses: (isHovered: boolean, shouldShowExpanded: boolean, variant: string) => {
    return `z-10 opacity-100 transition-all duration-500 ease-out ${
      isHovered || shouldShowExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
    } ${variant === 'ContentTop' ? 'hidden' : ''}`;
  },

  /**
   * Get CSS classes for the content Box based on variant
   */
  getContentBoxClasses: (variant: string | undefined) => {
    return cn(variant === 'ContentTop' ? 'lg:items-center p-12' : '');
  },

  /**
   * Get CSS classes for content container based on variant
   */
  getContentClasses: (variant: string | undefined) => {
    return cn(
      'relative col-span-5 transition-all duration-500 ease-out p-12',
      variant === 'ContentLeft'
        ? 'order-2 lg:order-1'
        : variant === 'ContentTop'
          ? 'order-1 p-0'
          : 'order-2'
    );
  },

  /**
   * Get CSS classes for CTA button wrapper
   */
  getCtaWrapperClasses: (variant: string | undefined) => {
    return cn(variant === 'ContentTop' ? 'order-2 lg:ml-auto' : '');
  },

  /**
   * Get CSS classes for description container
   */
  getDescriptionClasses: (isHovered: boolean, shouldShowExpanded: boolean) => {
    return `relative z-20 space-y-4 opacity-100 transition-all duration-500 ease-out ${
      isHovered || shouldShowExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
    }`;
  },

  /**
   * Get CSS classes for description text
   */
  getDescriptionTextClasses: () => {
    return 'text-body-xs text-white';
  },

  /**
   * Get CSS classes for image container based on variant
   */
  getImageClasses: (variant: string | undefined) => {
    return cn(
      'col-span-7 h-full overflow-hidden',
      variant === 'ContentLeft'
        ? 'order-1 lg:order-2'
        : variant === 'ContentTop'
          ? 'order-2'
          : 'order-1'
    );
  },

  /**
   * Get CSS classes for image element
   */
  getImageElementClasses: (isHovered: boolean, shouldShowExpanded: boolean) => {
    return `h-full w-full object-cover ${
      isHovered || shouldShowExpanded ? 'lg:h-full' : 'lg:h-60'
    }`;
  },

  /**
   * Get CSS classes for accordion item container
   */
  getItemClasses: (isHovered: boolean, shouldShowExpanded: boolean) => {
    return `overflow-hidden border-none bg-[#1D1E1F] text-white shadow-lg transition-all duration-500 ease-out lg:${
      isHovered || shouldShowExpanded ? 'shadow-lg' : 'shadow-none'
    }`;
  },

  /**
   * Get CSS classes for overline text
   */
  getOverlineClasses: () => {
    return 'text-body-xs relative z-20 text-white';
  },

  /**
   * Get CSS classes for individual tags
   */
  getTagClasses: () => {
    return 'text-body-xs border-t border-white/10 py-2 text-white first:border-b-0 last:border-b-1';
  },

  /**
   * Get CSS classes for tags container
   */
  getTagsContainerClasses: () => {
    return 'flex flex-col';
  },

  /**
   * Get CSS classes for title
   */
  getTitleClasses: (isHovered: boolean, shouldShowExpanded: boolean) => {
    return `text-headline-sm relative z-20 line-clamp-none max-w-[300px] text-white ${
      isHovered || shouldShowExpanded ? 'lg:line-clamp-none' : 'lg:line-clamp-2'
    }`;
  },

  /**
   * Get CSS classes for accordion trigger
   */
  getTriggerClasses: (isHovered: boolean, shouldShowExpanded: boolean) => {
    return `h-auto p-0 transition-all duration-500 ease-out hover:no-underline ${
      isHovered || shouldShowExpanded ? 'lg:h-auto' : 'lg:h-60'
    }`;
  },

  /**
   * Get CSS classes for the main Box wrapper based on variant
   */
  getWrapperClasses: (variant: string | undefined) => {
    return cn(
      'min-h-20',
      variant === 'ContentLeft' ? 'lg:flex-row' : '',
      variant === 'ContentTop' ? 'flex-col bg-primary' : '',
      variant === 'ContentRight' ? 'lg:flex-row' : ''
    );
  }
};
