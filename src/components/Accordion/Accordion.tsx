'use client';

import {
  Accordion as AccordionPrimitive,
} from '@/components/ui/accordion';

import { Box } from '@/components/global/matic-ds';

import { useAccordionData } from '@/components/Accordion/hooks/UseAccordionData';
import { useAccordionLogic } from '@/components/Accordion/logic/AccordionLogic';
import { AccordionItemComponent } from '@/components/Accordion/components/AccordionItem';
import { LoadingState, ErrorState, EmptyState } from '@/components/Accordion/components/AccordionStates';

import type { Accordion as AccordionType } from '@/components/Accordion/AccordionSchema';

// Types
interface AccordionProps {
  sys: AccordionType['sys'];
}

/**
 * Main Accordion component - orchestrates all layers
 * Pure composition of data, logic, and presentation layers
 */
export function Accordion({ sys }: AccordionProps) {
  // Data layer
  const { accordionItems, loading, error } = useAccordionData(sys.id);

  // Business logic layer
  const { handleHover, handleMouseLeave, getItemDisplayState } = useAccordionLogic(accordionItems);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Empty state
  if (!accordionItems.length) {
    return <EmptyState />;
  }

  return (
    <div onMouseLeave={handleMouseLeave}>
      <AccordionPrimitive type="single" value="item-0">
        <Box direction="col" gap={6}>
          {accordionItems.map((item, index) => {
            const displayState = getItemDisplayState(index, `item-${index}`);

            return (
              <AccordionItemComponent
                key={`accordion-${index}-item-${item.sys.id}`}
                item={item}
                index={index}
                isHovered={displayState.isHovered}
                shouldShowExpanded={displayState.shouldShowExpanded}
                onHover={handleHover}
              />
            );
          })}
        </Box>
      </AccordionPrimitive>
    </div>
  );
}
