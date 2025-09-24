'use client';

import Image from 'next/image';

import {
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import { Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/Image/AirImage';

import { accordionStyles } from '@/components/Accordion/styles/AccordionStyles';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

interface AccordionItemProps {
  item: AccordionItemType;
  index: number;
  isHovered: boolean;
  shouldShowExpanded: boolean;
  onHover: (value: string) => void;
}

/**
 * Pure presentation component for accordion items
 * Handles only UI rendering, no business logic or data fetching
 */
export const AccordionItemComponent = ({
  item,
  index,
  isHovered,
  shouldShowExpanded,
  onHover
}: AccordionItemProps) => {
  const itemValue = `item-${index}`;

  return (
    <AccordionItem
      key={`accordion-${index}-item-${item.sys.id}`}
      value={itemValue}
      className={accordionStyles.getItemClasses(isHovered, shouldShowExpanded)}
    >
      <AccordionTrigger
        chevron={false}
        onMouseOver={() => onHover(itemValue)}
        className={accordionStyles.getTriggerClasses(isHovered, shouldShowExpanded)}
      >
        <Box direction="col" gap={0} cols={{ base: 1, lg: 12 }} className="min-h-20 lg:flex-row">
          {item.image?.sys?.id && (
            <div className={accordionStyles.getImageClasses(item.variant)}>
              <AirImage
                sys={{ id: item.image.sys.id }}
                className={accordionStyles.getImageElementClasses(isHovered, shouldShowExpanded)}
              />
            </div>
          )}
          <Box direction="col" gap={24} className={accordionStyles.getContentClasses(item.variant)}>
            <Image
              src="https://air-prod.imgix.net/15bada56-2831-4406-98af-2330b3782171.jpg?w=1160&h=986&fm=webp&fit=crop&auto=auto"
              fill
              className={accordionStyles.getBackgroundImageClasses(isHovered, shouldShowExpanded)}
              alt="background gradient image"
            />

            <div>
              {item.overline && (
                <p className="text-body-xs relative z-20 text-white">{item.overline}</p>
              )}

              <h3 className={accordionStyles.getTitleClasses(isHovered, shouldShowExpanded)}>
                {item.title}
              </h3>
            </div>
            <div className={accordionStyles.getDescriptionClasses(isHovered, shouldShowExpanded)}>
              {item.description && <p className="text-body-xs text-white">{item.description}</p>}

              {item.tags && (
                <div className="flex flex-col">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-body-xs border-t border-white/10 py-2 text-white first:border-b-0 last:border-b-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Box>
        </Box>
      </AccordionTrigger>
    </AccordionItem>
  );
};
