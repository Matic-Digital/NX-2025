import { cn } from '@/lib/utils';

/**
 * Pure styling utilities for Collection components
 * Contains all CSS class generation logic
 */

export const collectionStyles = {
  /**
   * Get CSS classes for collection grid container
   */
  getGridClasses: () => {
    return 'mb-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3';
  },

  /**
   * Get CSS classes for pagination container
   */
  getPaginationClasses: () => {
    return 'flex items-center justify-center gap-4';
  },

  /**
   * Get CSS classes for pagination button
   */
  getPaginationButtonClasses: (disabled: boolean) => {
    return cn(
      'rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
      disabled && 'disabled:cursor-not-allowed disabled:opacity-50'
    );
  },

  /**
   * Get CSS classes for filter button container
   */
  getFilterContainerClasses: () => {
    return 'mb-6 flex flex-wrap gap-2';
  },

  /**
   * Get CSS classes for filter button
   */
  getFilterButtonClasses: (isActive: boolean) => {
    return cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary border-primary text-white'
        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
    );
  },

  /**
   * Get CSS classes for search input
   */
  getSearchInputClasses: () => {
    return 'focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:outline-none';
  },

  /**
   * Get CSS classes for empty state container
   */
  getEmptyStateClasses: () => {
    return 'col-span-full flex flex-col items-center justify-center py-12 text-center';
  },

  /**
   * Get CSS classes for empty state icon
   */
  getEmptyStateIconClasses: () => {
    return 'mx-auto h-12 w-12 text-gray-400';
  },

  /**
   * Get CSS classes for empty state title
   */
  getEmptyStateTitleClasses: () => {
    return 'mb-2 text-lg font-medium text-gray-900';
  },

  /**
   * Get CSS classes for empty state description
   */
  getEmptyStateDescriptionClasses: () => {
    return 'mb-4 text-gray-500';
  },

  /**
   * Get CSS classes for empty state button container
   */
  getEmptyStateButtonContainerClasses: () => {
    return 'flex flex-col gap-2 sm:flex-row';
  },

  /**
   * Get CSS classes for empty state button
   */
  getEmptyStateButtonClasses: () => {
    return 'inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
  }
};
