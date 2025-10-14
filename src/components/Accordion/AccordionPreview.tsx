'use client';

import { useState, useEffect } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';
import { AccordionItem } from './components/AccordionItem';
import { getAccordionItemById } from './AccordionApi';
import { useAccordionLogic } from './hooks/UseAccordionLogic';
import { Box } from '@/components/global/matic-ds';
import type { Accordion as AccordionType, AccordionItem as AccordionItemType } from './AccordionSchema';

interface AccordionPreviewProps extends Partial<AccordionType> {
  accordionId?: string;
}

/**
 * Accordion Preview Component
 * 
 * This component is used in Contentful Live Preview to display Accordion components
 * with a live preview and field breakdown.
 */
export function AccordionPreview(props: AccordionPreviewProps) {
  const [accordionItems, setAccordionItems] = useState<AccordionItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contentful Live Preview integration
  const liveAccordion = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveAccordion?.sys?.id });

  // Business logic layer - use stable reference to avoid hook order changes
  // Use the initial items from props to ensure consistent hook calls
  const stableItems = liveAccordion?.itemsCollection?.items ?? props.itemsCollection?.items ?? [];
  const { handleHover, handleMouseLeave, getItemDisplayState } = useAccordionLogic(
    accordionItems.length > 0 ? accordionItems : stableItems.map((item, index) => ({
      sys: item.sys,
      title: `Loading item ${index + 1}...`,
      description: 'Loading...',
      variant: 'ContentLeft' as const,
      image: { sys: { id: 'loading' } },
      tags: [],
      overline: ''
    }))
  );

  // Note: Cannot create inspector props for each item here due to React hooks rules
  // Inspector props for individual items will be handled in the rendering section


  // Fetch accordion items when the component mounts or itemsCollection changes
  useEffect(() => {
    async function fetchAccordionItems() {
      if (!props.itemsCollection?.items?.length) {
        setAccordionItems([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch full data for each accordion item
        const itemIds = props.itemsCollection.items.map((item) => item.sys.id);
        const itemPromises = itemIds.map((id) => getAccordionItemById(id, true)); // Use preview mode
        const items = await Promise.all(itemPromises);

        // Filter out any null results and ensure proper defaults
        const validItems = items
          .filter((item): item is AccordionItemType => item !== null)
          .map(item => ({
            ...item,
            backgroundImage: item.backgroundImage ?? {
              sys: { id: 'default-bg' },
              link: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=='
            },
            tags: item.tags ?? [],
            overline: item.overline ?? ''
          }));

        setAccordionItems(validItems);
      } catch (err) {
        console.error('Failed to fetch accordion items for preview:', err);
        setError('Failed to load accordion items');
      } finally {
        setLoading(false);
      }
    }

    void fetchAccordionItems();
  }, [props.itemsCollection]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Accordion
                const hasRequiredFields = props.sys && props.itemsCollection?.items?.length;
                
                if (loading) {
                  return (
                    <div className="p-8 text-center text-gray-500">
                      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
                    </div>
                  );
                }

                if (error) {
                  return (
                    <div className="p-8 text-center text-red-500">
                      <p>Error loading accordion: {error}</p>
                    </div>
                  );
                }
                
                if (hasRequiredFields && accordionItems.length > 0) {
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
                                      item={item}
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
                      {!props.title && <li>• Title is required</li>}
                      {!props.itemsCollection?.items?.length && 
                        <li>• At least one accordion item is required</li>
                      }
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Breakdown</h2>
            <div className="space-y-4">
              
              {/* Title Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main heading for the accordion component. This appears above all accordion items.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Items Collection Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Accordion Items</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Collection of accordion items. Each item contains a title, description, image, and CTA button.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.itemsCollection?.items ? 
                    `${props.itemsCollection.items.length} item(s) configured` : 
                    'Not set'
                  }
                </div>
                {props.itemsCollection?.items && props.itemsCollection.items.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {props.itemsCollection.items.map((item, index) => (
                      <div key={item.sys.id} className="text-xs bg-gray-50 px-2 py-1 rounded">
                        Item {index + 1}: {item.sys.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
