'use client';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { AccordionProvider } from '@/contexts/AccordionContext';

import { Box } from '@/components/global/matic-ds';

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
 * Main Accordion component - orchestrates all layers
 * Pure composition of data, logic, and presentation layers
 */
export function Accordion({ sys }: AccordionProps) {
  // Data layer
  const { accordionItems, loading, error } = useAccordionData(sys.id);

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

  // Check if this is a ContentTop accordion
  const isContentTopAccordion = accordionItems.length > 0 && accordionItems[0]?.variant === 'ContentTop';

  return (
    <AccordionProvider key={sys.id}>
      <div>
        {isContentTopAccordion ? (
          // ContentTop accordion without flex layout
          <div>
            <AccordionPrimitive type="single" collapsible>
              <Box direction="col" gap={6}>
                {accordionItems.map((item, index) => {
                  return (
                    <AccordionItem
                      key={`accordion-${sys.id}-${index}-item-${item.sys.id}`}
                      item={item}
                      index={index}
                      isFirst={index === 0}
                      itemId={`${sys.id}-item-${index}`}
                      isHovered={false}
                      shouldShowExpanded={false}
                      onHover={() => undefined}
                    />
                  );
                })}
              </Box>
            </AccordionPrimitive>
          </div>
        ) : (
          // Regular accordion layout
          <AccordionPrimitive type="single" collapsible>
            <Box direction="col" gap={6}>
              {accordionItems.map((item, index) => {
                return (
                  <AccordionItem
                    key={`accordion-${sys.id}-${index}-item-${item.sys.id}`}
                    item={item}
                    index={index}
                    isFirst={index === 0}
                    itemId={`${sys.id}-item-${index}`}
                    isHovered={false}
                    shouldShowExpanded={false}
                    onHover={() => undefined}
                  />
                );
              })}
            </Box>
          </AccordionPrimitive>
        )}
      </div>
    </AccordionProvider>
  );
}
