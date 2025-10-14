'use client';

import { useState } from 'react';

import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import { ErrorState, LoadingState } from '@/components/Accordion/components/AccordionStates';
import { useAccordionData } from '@/components/Accordion/hooks/UseAccordionData';
import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

interface AccordionItemPreviewProps {
  sys: { id: string };
}

/**
 * AccordionItem Preview Component
 * Fetches and displays a single AccordionItem with Contentful preview UI
 */
export function AccordionItemPreview({ sys }: AccordionItemPreviewProps) {
  const { accordionItems, loading, error } = useAccordionData(sys.id);
  const [hoveredValue, setHoveredValue] = useState<string>('');
  const [expandedValue, setExpandedValue] = useState<string>('item-0');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!accordionItems.length) return <ErrorState message="No accordion item data" />;

  const accordionItem = accordionItems[0]!;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                AccordionItem
              </span>
            </div>
            <div className="overflow-hidden p-4">
              <AccordionPrimitive
                type="single"
                collapsible
                value={expandedValue}
                onValueChange={setExpandedValue}
              >
                <AccordionItem
                  item={accordionItem}
                  index={0}
                  isHovered={hoveredValue === 'item-0'}
                  shouldShowExpanded={expandedValue === 'item-0'}
                  onHover={setHoveredValue}
                />
              </AccordionPrimitive>
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
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">The main title for the accordion item.</p>
                <div className="text-xs text-gray-500">
                  Current value: {accordionItem.title ? `"${accordionItem.title}"` : 'Not set'}
                </div>
              </div>

              {/* Description Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The description text for the accordion item.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {accordionItem.description ? `"${accordionItem.description}"` : 'Not set'}
                </div>
              </div>

              {/* Variant Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Variant</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The layout variant for the accordion item (ContentLeft, ContentRight, ContentTop).
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {accordionItem.variant ?? 'Not set'}
                </div>
              </div>

              {/* Overline Field */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Overline</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Small text that appears above the title.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {accordionItem.overline ? `"${accordionItem.overline}"` : 'Not set'}
                </div>
              </div>

              {/* Image Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Image</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">The main image for the accordion item.</p>
                <div className="text-xs text-gray-500">
                  Current value: {accordionItem.image?.sys?.id ? 'Image configured' : 'Not set'}
                </div>
              </div>

              {/* Tags Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Tags</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Tags associated with this accordion item.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {accordionItem.tags?.length ? accordionItem.tags.join(', ') : 'Not set'}
                </div>
              </div>

              {/* CTA Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">CTA</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Call-to-action button for the accordion item.
                </p>
                <div className="text-xs text-gray-500">
                  Current value:{' '}
                  {accordionItem.cta ? `Button configured (${accordionItem.cta.text ?? 'No text'})` : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
