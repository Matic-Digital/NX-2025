'use client';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { Box } from '@/components/global/matic-ds';
import { AccordionProvider, useAccordion } from '@/contexts/AccordionContext';

import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import {
  EmptyState,
  ErrorState,
  LoadingState
} from '@/components/Accordion/components/AccordionStates';
import { useAccordionData } from '@/components/Accordion/hooks/UseAccordionData';
import { useAccordionState } from '@/components/Accordion/hooks/UseAccordionState';

import type { Accordion as AccordionType } from '@/components/Accordion/AccordionSchema';

// Types
interface AccordionProps {
  sys: AccordionType['sys'];
}

/**
 * Internal Accordion component that uses context
 */
function AccordionInternal({ sys }: AccordionProps) {
  // Data layer
  const { accordionItems, loading, error } = useAccordionData(sys.id);
  
  // Context layer
  const { activeItemId, setActiveItemId, lastHoveredItemId, setLastHoveredItemId } = useAccordion();

  // State layer
  const { currentState } = useAccordionState(accordionItems, loading, error);

  // Event handlers
  const handleHover = (itemId: string) => {
    setActiveItemId(itemId);
    setLastHoveredItemId(itemId);
  };

  const handleMouseLeave = () => {
    setActiveItemId(null);
  };

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

  return (
    <div onMouseLeave={handleMouseLeave}>
      <AccordionPrimitive type="single" collapsible>
        <Box direction="col" gap={6}>
          {accordionItems.map((item, index) => {
            const itemValue = `item-${index}`;
            const isHovered = activeItemId === itemValue;
            const shouldShowExpanded = isHovered;

            return (
              <AccordionItem
                key={`accordion-${index}-item-${item.sys.id}`}
                item={item}
                index={index}
                isHovered={isHovered}
                shouldShowExpanded={shouldShowExpanded}
                onHover={handleHover}
              />
            );
          })}
        </Box>
      </AccordionPrimitive>
    </div>
  );
}

/**
 * Main Accordion component with provider wrapper
 */
export function Accordion({ sys }: AccordionProps) {
  return (
    <AccordionProvider>
      <AccordionInternal sys={sys} />
    </AccordionProvider>
  );
}
