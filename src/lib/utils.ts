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

export const formatDateRange = (
  startDateString: string,
  endDateString?: string,
  includeTime?: boolean
): string => {
  if (!startDateString) return '';

  const startDate = new Date(startDateString);

  // If no end date, just format the start date
  if (!endDateString) {
    return formatDate(startDateString, includeTime);
  }

  const endDate = new Date(endDateString);

  // Check if dates are on the same day
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  if (!includeTime) {
    if (isSameDay) {
      return startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      const startFormatted = startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const endFormatted = endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      return `${startFormatted} - ${endFormatted}`;
    }
  }

  // With time
  if (isSameDay) {
    const datePart = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });

    return `${datePart} • ${startTime} - ${endTime}`;
  } else {
    // Different days with time
    const startFormatted = formatDate(startDateString, true);
    const endFormatted = formatDate(endDateString, true);
    return `${startFormatted} - ${endFormatted}`;
  }
};
