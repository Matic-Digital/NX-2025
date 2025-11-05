'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { Box } from '@/components/global/matic-ds';
import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import { useAccordionLogic } from '@/components/Accordion/hooks/UseAccordionLogic';
import { accordionFields } from '@/components/Accordion/preview/AccordionPreviewFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type {
  AccordionItem as AccordionItemType,
  Accordion as AccordionType
} from '@/components/Accordion/AccordionSchema';

/**
 * Accordion Preview Component
 *
 * This component is used in Contentful Live Preview to display Accordion components
 * with a live preview and field breakdown. It receives server-enriched data and uses
 * Live Preview only for real-time updates.
 */
export function AccordionPreview(props: Partial<AccordionType>) {
  // Unwrap the item property if it exists (API returns {item: Accordion})
  const accordionData = 'item' in props && props.item ? props.item : props;

  // Contentful Live Preview integration - only for real-time updates
  const liveAccordion = useContentfulLiveUpdates(accordionData) as AccordionType;
  const inspectorProps = useContentfulInspectorMode({ entryId: liveAccordion?.sys?.id });

  // Use the live accordion items directly (already enriched by server)
  const accordionItems = (liveAccordion?.itemsCollection?.items ?? []) as AccordionItemType[];
  
  // Business logic layer
  const { handleHover, handleMouseLeave, getItemDisplayState } = useAccordionLogic(accordionItems);

  // Debug logging for accordion items
  console.log('[AccordionPreview] Rendering with items:', {
    hasAccordion: !!liveAccordion,
    itemCount: accordionItems.length,
    firstItemTitle: (accordionItems[0] as AccordionItemType)?.title,
    firstItemStructure: accordionItems[0] ? Object.keys(accordionItems[0]) : [],
    rawProps: props,
    accordionData: accordionData,
    liveAccordionStructure: liveAccordion ? Object.keys(liveAccordion) : []
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Accordion
                const hasRequiredFields = (liveAccordion as AccordionType)?.sys && accordionItems.length > 0;

                if (hasRequiredFields) {
                  // Render the accordion with fetched items
                  return (
                    <div className="p-4">
                      <div className="max-w-4xl mx-auto">
                        <div onMouseLeave={handleMouseLeave} {...inspectorProps}>
                          <AccordionPrimitive type="single" collapsible defaultValue="item-0">
                            <Box direction="col" gap={6}>
                              {accordionItems.map((item, index) => {
                                const displayState = getItemDisplayState(index, `item-${index}`);

                                return (
                                  <div
                                    key={`accordion-preview-${props.sys?.id ?? 'unknown'}-${index}-${item.sys.id}`}
                                    {...inspectorProps({ fieldId: `itemsCollection.${index}` })}
                                  >
                                    <AccordionItem
                                      item={item as AccordionItemType}
                                      index={index}
                                      isHovered={displayState.isHovered}
                                      shouldShowExpanded={displayState.shouldShowExpanded}
                                      onHover={handleHover}
                                      inspectorProps={undefined}
                                    />
                                  </div>
                                );
                              })}
                            </Box>
                          </AccordionPrimitive>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!(liveAccordion as AccordionType)?.title && <li>• Title is required</li>}
                      {!accordionItems.length && (
                        <li>• At least one accordion item is required</li>
                      )}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={accordionFields} data={liveAccordion} title="Accordion" />
        </div>
      </div>
    </div>
  );
}
