import { cn } from '@/lib/utils';

/**
 * Pure styling utilities for Accordion components
 * Contains all CSS class generation logic
 */

export const accordionStyles = {
  getBackgroundImageClasses: (isHovered: boolean, isActive: boolean, variant: string) => {
    return `z-10 opacity-100 transition-all duration-500 ease-out ${
      isHovered || isActive ? 'lg:opacity-100' : 'lg:opacity-0'
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
   * Get button variant based on accordion state for ContentTop
   */
  getButtonVariant: (isHovered?: boolean, isActive?: boolean, variant?: string) => {
    if (variant === 'ContentTop') {
      const isActiveState = isHovered ?? isActive;
      return isActiveState ? 'white' : 'outline';
    }
    return 'white'; // Default for other variants
  },

  /**
   * Get CSS classes for description container
   */
  getDescriptionClasses: (isHovered: boolean, isActive: boolean, variant?: string) => {
    // For vertical accordion (ContentTop), always show description
    if (variant === 'ContentTop') {
      return 'relative z-20 space-y-4 opacity-100 transition-all duration-500 ease-out';
    }
    
    // Default horizontal accordion behavior - hide/show based on state
    return `relative z-20 space-y-4 opacity-100 transition-all duration-500 ease-out ${
      isHovered || isActive ? 'lg:opacity-100' : 'lg:opacity-0'
    }`;
  },

  /**
   * Get CSS classes for description text
   */
  getDescriptionTextClasses: (isHovered?: boolean, isActive?: boolean, variant?: string) => {
    const isActiveState = isHovered ?? isActive;
    const textColor = (variant === 'ContentTop' && isActiveState) ? 'text-white' : 'text-foreground';
    return `text-body-xs transition-all duration-500 ease-out ${textColor}`;
  },

  /**
   * Get CSS classes for image container based on variant
   */
  getImageClasses: (variant: string | undefined, isHovered?: boolean, isActive?: boolean) => {
    const isActiveState = isHovered ?? isActive;
    return cn(
      'col-span-7 overflow-hidden transition-all duration-300 ease-out',
      variant === 'ContentLeft'
        ? 'order-1 lg:order-2 h-full'
        : variant === 'ContentTop'
          ? `order-2 ${isActiveState ? 'h-auto opacity-100' : 'h-0 opacity-0'}`
          : 'order-1 h-full'
    );
  },

  /**
   * Get CSS classes for image element
   */
  getImageElementClasses: (isHovered: boolean, isActive: boolean) => {
    return `h-full w-full object-cover transition-all duration-500 ease-in-out ${
      isHovered || isActive ? 'lg:h-full' : 'lg:h-60'
    }`;
  },

  /**
   * Get CSS classes for accordion item container
   */
  getItemClasses: (isHovered: boolean, isActive: boolean) => {
    return `overflow-hidden border-none bg-subtle text-foreground shadow-lg transition-all duration-500 ease-out !rounded-none lg:${
      isHovered || isActive ? 'shadow-lg' : 'shadow-none'
    }`;
  },

  /**
   * Get CSS classes for overline text
   */
  getOverlineClasses: (isHovered?: boolean, isActive?: boolean, variant?: string) => {
    const isActiveState = isHovered ?? isActive;
    const textColor = (variant === 'ContentTop' && isActiveState) ? 'text-white' : 'text-foreground';
    return `text-body-xs relative z-20 transition-all duration-500 ease-out ${textColor}`;
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
  getTitleClasses: (isHovered: boolean, isActive: boolean, variant?: string) => {
    const isActiveState = isHovered || isActive;
    const textColor = (variant === 'ContentTop' && isActiveState) ? 'text-white' : 'text-foreground';
    return `text-headline-sm relative z-20 line-clamp-none max-w-[300px] transition-all duration-500 ease-out ${textColor} ${
      isHovered || isActive ? 'lg:line-clamp-none' : 'lg:line-clamp-2'
    }`;
  },

  /**
   * Get CSS classes for accordion trigger
   */
  getTriggerClasses: (isHovered: boolean, isActive: boolean, variant?: string) => {
    // For vertical accordion (ContentTop), maintain consistent height - only toggle image/hover states
    if (variant === 'ContentTop') {
      return `p-0 transition-all duration-300 ease-out hover:no-underline overflow-hidden !rounded-none h-auto`;
    }
    
    // Default horizontal accordion behavior - use transform for smoother transitions  
    return `p-0 transition-all duration-300 ease-out hover:no-underline overflow-hidden !rounded-none ${
      isHovered || isActive ? 'lg:h-auto' : 'lg:h-60'
    }`;
  },

  /**
   * Get CSS classes for the main Box wrapper based on variant
   */
  getWrapperClasses: (variant: string | undefined, isHovered?: boolean, isActive?: boolean) => {
    const isActiveState = isHovered ?? isActive;
    return cn(
      'min-h-20 w-full transition-all duration-300 ease-out',
      // All variants get bg-surface as inactive state (theme-aware)
      isActiveState ? '' : 'bg-surface',
      // Variant-specific styling
      variant === 'ContentLeft' ? `lg:flex-row ${isActiveState ? 'bg-surface' : ''}` : '',
      variant === 'ContentTop' ? `flex-col ${isActiveState ? 'bg-primary' : ''}` : '',
      variant === 'ContentRight' ? `lg:flex-row ${isActiveState ? 'bg-surface' : ''}` : ''
    );
  }
};
