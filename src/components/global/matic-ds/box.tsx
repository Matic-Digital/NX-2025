import React from 'react';

import { cn } from '@/lib/utils';

import type { BoxProps } from '@/components/global/matic-ds/types';

/**
 * Box component for creating flexible layouts using either Flexbox or Grid
 * @example
 * ```tsx
 * // Flex layout
 * <Box direction="row" gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Box>
 *
 * // Responsive grid
 * <Box
 *   cols={{ sm: 1, md: 2, lg: 3 }}
 *   gap={{ sm: 2, md: 4 }}
 *   className="justify-items-center"
 * >
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Box>
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be laid out
 * @param {string} [props.className] - Additional CSS classes
 * @param {'row' | 'col' | Object} [props.direction] - Flex direction (use for flex layouts)
 * @param {boolean | Object} [props.wrap] - Whether items should wrap
 * @param {number | Object} [props.gap] - Space between items
 * @param {number | Object} [props.cols] - Number of grid columns (use for grid layouts)
 * @param {number | Object} [props.rows] - Number of grid rows
 * @returns {JSX.Element} Box component
 */
export const Box = ({
  children,
  className,
  direction = 'row',
  wrap = false,
  gap = 0,
  cols,
  rows
}: BoxProps) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const wrapClasses = wrap ? 'flex-wrap' : 'flex-nowrap';

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
    16: 'gap-16',
    20: 'gap-20',
    24: 'gap-24',
    28: 'gap-28',
    32: 'gap-32',
    36: 'gap-36',
    40: 'gap-40',
    44: 'gap-44',
    48: 'gap-48',
    52: 'gap-52',
    56: 'gap-56',
    60: 'gap-60',
    64: 'gap-64'
  };

  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12'
  };

  const getResponsiveClasses = (
    prop: string | number | Record<string, unknown> | undefined,
    classMap: Record<string | number, string>
  ) => {
    if (!prop) return '';

    if (typeof prop === 'object') {
      return Object.entries(prop)
        .map(([breakpoint, value]) => {
          const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;
          return `${prefix}${classMap[value as keyof typeof classMap] ?? ''}`;
        })
        .join(' ');
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return classMap[prop as keyof typeof classMap] ?? '';
  };

  const stackClasses = cn(
    cols || rows ? 'grid' : 'flex',
    !cols && !rows && getResponsiveClasses(direction, directionClasses),
    !cols &&
      !rows &&
      (typeof wrap === 'boolean'
        ? wrapClasses
        : getResponsiveClasses(wrap, { true: 'flex-wrap', false: 'flex-nowrap' })),
    getResponsiveClasses(gap, gapClasses),
    cols && getResponsiveClasses(cols, colsClasses),
    rows && getResponsiveClasses(rows, colsClasses),
    className
  );

  return <div className={stackClasses}>{children}</div>;
};
