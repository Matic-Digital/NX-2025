'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { AccordionItem } from './components/AccordionItem';
import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';
import type { AccordionItem as AccordionItemType } from './AccordionSchema';

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
    <div className="min-h-screen bg-gray-50">{/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
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
                const hasRequiredFields = props.sys && props.title && props.description && 
                  props.image && props.variant;
                
                if (hasRequiredFields) {
                  // Cast to full type since we've verified all required fields exist
                  const fullProps = props as AccordionItemType;
                  
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
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">Preview (single item accordion)</h3>
                        <AccordionPrimitive type="single" collapsible defaultValue="item-0">
                          <div className="flex flex-col gap-6">
                            <AccordionItem 
                              item={itemWithDefaults}
                              index={0}
                              isHovered={false}
                              shouldShowExpanded={true}
                              onHover={() => { /* Preview hover handler */ }}
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
                      {!props.title && <li>• Title is required</li>}
                      {!props.description && <li>• Description is required</li>}
                      {!props.image && <li>• Image is required</li>}
                      {!props.variant && <li>• Variant is required</li>}
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
              
              {/* Overline Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Overline</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Small text that appears above the title. Used for categorization or context.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.overline ? `"${props.overline}"` : 'Not set'}
                </div>
              </div>

              {/* Title Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main heading for this accordion item. This is what users click to expand the item.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Description Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The content that appears when the accordion item is expanded. Supports rich text formatting.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.description ? 
                    `"${props.description.substring(0, 100)}${props.description.length > 100 ? '...' : ''}"` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Image Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Image</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Main image displayed within the accordion item content area.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.image ? 
                    `Image configured (${props.image.sys.id})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Background Image Field */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Image</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional background image that appears behind the accordion item content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundImage ? 
                    `Background configured (${props.backgroundImage.sys.id})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Variant Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Variant</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Layout variant that determines how content is positioned (ContentLeft, ContentTop, ContentRight).
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.variant ? `"${props.variant}"` : 'Not set'}
                </div>
              </div>

              {/* Tags Field */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Tags</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional tags for categorization and filtering purposes.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.tags && props.tags.length > 0 ? 
                    `${props.tags.length} tag(s): ${props.tags.join(', ')}` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* CTA Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">CTA Button</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional call-to-action button that appears within the accordion item content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.cta ? 
                    `Button configured: "${props.cta.text || 'No text'}"` : 
                    'Not set'
                  }
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
