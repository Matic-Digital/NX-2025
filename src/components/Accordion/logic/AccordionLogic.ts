'use client';

import { useState } from 'react';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

/**
 * Business logic for accordion behavior
 * Handles state management and interaction logic
 */
export const useAccordionLogic = (_accordionItems: AccordionItemType[]) => {
  // UI state management
  const [openItem, setOpenItem] = useState('item-0'); // First item is always open
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Event handlers
  const handleHover = (value: string) => {
    setHoveredItem(value);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Business logic for determining display states
  const getItemDisplayState = (index: number, itemValue: string) => {
    const isHovered = hoveredItem === itemValue;
    const isFirstItem = index === 0;
    const shouldShowExpanded = isFirstItem && !hoveredItem;

    return {
      isHovered,
      isFirstItem,
      shouldShowExpanded,
      itemValue
    };
  };

  return {
    openItem,
    setOpenItem,
    hoveredItem,
    handleHover,
    handleMouseLeave,
    getItemDisplayState
  };
};
