'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Accordion as AccordionPrimitive } from '@/components/ui/accordion';

import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import { accordionItemFields } from '@/components/Accordion/preview/AccordionItemFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

/**
 *
 * This component is used in Contentful Live Preview to display AccordionItem components
 * with a live preview and field breakdown.
 */
export function AccordionItemPreview(props: Partial<AccordionItemType>) {
  // Contentful Live Preview integration
  const liveAccordionItem = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveAccordionItem?.sys?.id });

  const liveDefaultItem = useContentfulLiveUpdates({
    sys: liveAccordionItem?.sys,
    title: liveAccordionItem?.title ?? '',
    description: liveAccordionItem?.description ?? '',
    image: liveAccordionItem?.image,
    backgroundImage: liveAccordionItem?.backgroundImage ?? {
      sys: { id: 'default-bg' },
      link: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==' // Base64 encoded gray gradient SVG
    },
    cta: liveAccordionItem?.cta ?? undefined,
    tags: liveAccordionItem?.tags ?? [],
    overline: liveAccordionItem?.overline ?? ''
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <LivePreview
            componentName="AccordionItem"
            data={liveAccordionItem}
            requiredFields={['sys', 'title', 'description', 'image', 'variant']}
          >
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">
                  Preview (single item accordion)
                </h3>
                <AccordionPrimitive type="single" collapsible defaultValue="item-0">
                  <div className="flex flex-col gap-6">
                    <AccordionItem
                      item={
                        {
                          ...liveDefaultItem
                        } as AccordionItemType
                      }
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
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={accordionItemFields} data={liveAccordionItem} />
        </div>
      </div>
    </div>
  );
}
