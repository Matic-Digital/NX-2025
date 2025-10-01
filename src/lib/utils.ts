import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

// Dependencies

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'bg-blue-500') // => 'px-2 py-1 bg-blue-500'
 *
 * // With conditions
 * cn('px-2', isActive && 'bg-blue-500') // => 'px-2 bg-blue-500' or 'px-2'
 *
 * // Handles conflicting classes
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString?: string, includeTime?: boolean): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (!includeTime) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format date and time separately to avoid "at"
  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });

  return `${datePart} • ${timePart} `;
};
