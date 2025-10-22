'use client';

import { useState } from 'react';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

/**
 * Business logic for accordion behavior
 * Handles state management and interaction logic
 */
export const useAccordionLogic = (_accordionItems: AccordionItemType[]) => {
  // UI state management
  const [openItem, setOpenItem] = useState('item-0'); // First item is open by default
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Event handlers
  const handleHover = (value: string) => {
    setHoveredItem(value);
    setOpenItem(value); // Set the hovered item as the new open item
  };

  const handleMouseLeave = () => {
    // Don't close the item when mouse leaves - keep the last opened item open
    setHoveredItem(null);
  };

  // Business logic for determining display states
  const getItemDisplayState = (index: number, itemValue: string) => {
    const isHovered = hoveredItem === itemValue;
    const isFirstItem = index === 0;
    const isOpenItem = openItem === itemValue;
    // Show expanded if currently hovered OR if this is the open item (and no other item is being hovered)
    const shouldShowExpanded = isHovered || (isOpenItem && hoveredItem === null);

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
