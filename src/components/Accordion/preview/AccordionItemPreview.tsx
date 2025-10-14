'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import { accordionItemFields } from '@/components/Accordion/preview/AccordionItemFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

interface AccordionItemPreviewProps extends Partial<AccordionItemType> {
  accordionItemId?: string;
}

/**
 *
 * This component is used in Contentful Live Preview to display AccordionItem components
 * with a live preview and field breakdown.
 */
export function AccordionItemPreview(props: AccordionItemPreviewProps) {
  // Contentful Live Preview integration
  const liveAccordionItem = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveAccordionItem?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                AccordionItem
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid AccordionItem
                const hasRequiredFields =
                  liveAccordionItem?.sys &&
                  liveAccordionItem?.title &&
                  liveAccordionItem?.description &&
                  liveAccordionItem?.image &&
                  liveAccordionItem?.variant;

                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = liveAccordionItem as AccordionItemType;

                  // Ensure the item has all required fields for the AccordionItem component
                  const itemWithDefaults = {
                    ...fullProps,
                    backgroundImage: fullProps.backgroundImage ?? {
                      sys: { id: 'default-bg' },
                      link: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==' // Base64 encoded gray gradient SVG
                    },
                    cta: fullProps.cta ?? undefined,
                    tags: fullProps.tags ?? [],
                    overline: fullProps.overline ?? ''
                  } as AccordionItemType; // Use proper type instead of any

                  return (
                    <div className="p-4">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (single item accordion)
                        </h3>
                        <AccordionPrimitive type="single" collapsible defaultValue="item-0">
                          <div className="flex flex-col gap-6">
                            <AccordionItem
                              item={itemWithDefaults}
                              index={0}
                              isHovered={false}
                              shouldShowExpanded={true}
                              onHover={() => {
                                /* Preview hover handler */
                              }}
                              inspectorProps={inspectorProps}
                            />
                          </div>
                        </AccordionPrimitive>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveAccordionItem?.title && <li>• Title is required</li>}
                      {!liveAccordionItem?.description && <li>• Description is required</li>}
                      {!liveAccordionItem?.image && <li>• Image is required</li>}
                      {!liveAccordionItem?.variant && <li>• Variant is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={accordionItemFields} data={liveAccordionItem} />
        </div>
      </div>
    </div>
  );
}
