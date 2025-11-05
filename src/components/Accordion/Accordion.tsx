'use client';

import { AccordionProvider, useAccordion } from '@/contexts/AccordionContext';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { Box } from '@/components/global/matic-ds';

import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import {
  EmptyState,
  ErrorState,
  LoadingState
} from '@/components/Accordion/components/AccordionStates';
import { useAccordionData } from '@/components/Accordion/hooks/UseAccordionData';
import { useAccordionState } from '@/components/Accordion/hooks/UseAccordionState';

import type { Accordion as AccordionType, AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

// Types
interface AccordionProps {
  sys: AccordionType['sys'];
}

// Support both minimal sys data and full Accordion data
type AccordionAllProps = AccordionProps | AccordionType;

/**
 * Internal Accordion component that uses context
 */
function AccordionInternal(props: AccordionAllProps) {
  // Check if we have full Accordion data (server-side rendered) or just reference (client-side)
  const hasFullData = 'itemsCollection' in props;
  const sys = 'sys' in props ? props.sys : (props as AccordionType).sys;
  
  // When server-side enriched, the items are fully enriched AccordionItem objects
  // Type assertion is safe because getAccordionById enriches all accordion items
  const serverItems = hasFullData 
    ? (props as AccordionType).itemsCollection?.items as AccordionItemType[] | undefined
    : undefined;
  
  // Debug: Log Accordion data to verify server-side enrichment removed
  
  // Data layer - pass server-side items if available
  const { accordionItems, loading, error } = useAccordionData(sys.id, serverItems);

  // Context layer
  const { activeItemId, setActiveItemId, lastHoveredItemId: _lastHoveredItemId, setLastHoveredItemId } = useAccordion();

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
export function Accordion(props: AccordionAllProps) {
  return (
    <AccordionProvider>
      <AccordionInternal {...props} />
    </AccordionProvider>
  );
}
