'use client';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { Box } from '@/components/global/matic-ds';

import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import {
  EmptyState,
  ErrorState,
  LoadingState
} from '@/components/Accordion/components/AccordionStates';
import { useAccordionData } from '@/components/Accordion/hooks/UseAccordionData';
import { useAccordionLogic } from '@/components/Accordion/hooks/UseAccordionLogic';
import { useAccordionState } from '@/components/Accordion/hooks/UseAccordionState';

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
  const { accordionItems, accordionData, loading, error } = useAccordionData(sys.id);

  // Business logic layer
  const { handleHover, handleMouseLeave, getItemDisplayState } = useAccordionLogic(accordionItems);

  // State layer
  const { currentState } = useAccordionState(accordionItems, loading, error);

  // Presentation layer
  if (currentState.type === 'loading') {
    return <LoadingState />;
  }

  if (currentState.type === 'error') {
    return <ErrorState message={currentState.message} />;
  }

  if (currentState.type === 'empty') {
    return <EmptyState />;
  }

  // Check gridVariant to determine layout
  const gridVariant = accordionData?.gridVariant;

  if (gridVariant === 'ThreeColumn') {
    return (
      <div onMouseLeave={handleMouseLeave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {accordionItems.map((item, index) => {
          const displayState = getItemDisplayState(index, `item-${index}`);

          return (
            <AccordionItem
              key={`accordion-${index}-item-${item.sys.id}`}
              item={item}
              index={index}
              isHovered={displayState.isHovered}
              shouldShowExpanded={displayState.shouldShowExpanded}
              onHover={handleHover}
              renderAsCard={true}
            />
          );
        })}
      </div>
    );
  }

  // Default FullWidth layout (standard accordion)
  return (
    <div onMouseLeave={handleMouseLeave}>
      <AccordionPrimitive type="single" collapsible>
        <Box direction="col" gap={6}>
          {accordionItems.map((item, index) => {
            const displayState = getItemDisplayState(index, `item-${index}`);

            return (
              <AccordionItem
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
