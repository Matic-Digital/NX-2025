'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  AccordionItem as AccordionItemPrimitive,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { accordionStyles } from '@/components/Accordion/styles/AccordionStyles';
import { AirImage } from '@/components/Image/AirImage';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

interface AccordionItemProps {
  item: AccordionItemType;
  index: number;
  isHovered: boolean;
  shouldShowExpanded: boolean;
  onHover: (value: string) => void;
  inspectorProps?: (options: { fieldId: string }) => Record<string, unknown> | null;
}

/**
 * Pure presentation component for accordion items
 * Handles only UI rendering, no business logic or data fetching
 */
export const AccordionItem = ({
  item,
  index,
  isHovered,
  shouldShowExpanded,
  onHover,
  inspectorProps
}: AccordionItemProps) => {
  const itemValue = `item-${index}`;

  const HorizontalAccordionItem = () => {
    return (
      <AccordionItemPrimitive
        key={`accordion-${index}-item-${item.sys.id}`}
        value={itemValue}
        className={accordionStyles.getItemClasses(isHovered, shouldShowExpanded)}
      >
        <AccordionTrigger
          chevron={false}
          onMouseOver={() => onHover(itemValue)}
          className={accordionStyles.getTriggerClasses(isHovered, shouldShowExpanded)}
        >
          <Box
            direction="col"
            gap={0}
            cols={{ base: 1, lg: 12 }}
            className={accordionStyles.getWrapperClasses(item.variant)}
          >
            {item.image?.sys?.id && (
              <div
                className={accordionStyles.getImageClasses(item.variant)}
                {...(inspectorProps ? (inspectorProps({ fieldId: 'image' }) ?? {}) : {})}
              >
                <AirImage
                  sys={{ id: item.image.sys.id }}
                  className={accordionStyles.getImageElementClasses(isHovered, shouldShowExpanded)}
                />
              </div>
            )}
            <Box
              direction="col"
              gap={24}
              className={accordionStyles.getContentClasses(item.variant)}
            >
              {item.backgroundImage?.link && (
                <Image
                  src={item.backgroundImage.link}
                  alt="background gradient image"
                  fill
                  className={accordionStyles.getBackgroundImageClasses(
                    isHovered,
                    shouldShowExpanded,
                    item.variant
                  )}
                />
              )}

              <div>
                {item.overline && (
                  <p
                    className={accordionStyles.getOverlineClasses(isHovered, shouldShowExpanded)}
                    {...(inspectorProps ? (inspectorProps({ fieldId: 'overline' }) ?? {}) : {})}
                  >
                    {item.overline}
                  </p>
                )}

                <h3
                  className={accordionStyles.getTitleClasses(isHovered, shouldShowExpanded)}
                  {...(inspectorProps ? (inspectorProps({ fieldId: 'title' }) ?? {}) : {})}
                >
                  {item.title}
                </h3>
              </div>
              <div className={accordionStyles.getDescriptionClasses(isHovered, shouldShowExpanded)}>
                {item.description && (
                  <p
                    className={accordionStyles.getDescriptionTextClasses(
                      isHovered,
                      shouldShowExpanded
                    )}
                    {...(inspectorProps ? (inspectorProps({ fieldId: 'description' }) ?? {}) : {})}
                  >
                    {item.description}
                  </p>
                )}

                {item.tags && (
                  <div className={accordionStyles.getTagsContainerClasses()}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={accordionStyles.getTagClasses()}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Box>
          </Box>
        </AccordionTrigger>
      </AccordionItemPrimitive>
    );
  };

  const VerticalAccordionItem = () => {
    return (
      <AccordionItemPrimitive
        key={`accordion-${index}-item-${item.sys.id}`}
        value={itemValue}
        className={accordionStyles.getItemClasses(isHovered, shouldShowExpanded)}
      >
        <AccordionTrigger
          chevron={false}
          onMouseOver={() => onHover(itemValue)}
          className={accordionStyles.getTriggerClasses(isHovered, shouldShowExpanded, item.variant)}
        >
          <Box
            direction="col"
            gap={0}
            cols={1}
            className={accordionStyles.getWrapperClasses(
              item.variant,
              isHovered,
              shouldShowExpanded
            )}
          >
            {item.image?.sys?.id && shouldShowExpanded && (
              <div
                className={accordionStyles.getImageClasses(item.variant)}
                {...(inspectorProps ? (inspectorProps({ fieldId: 'image' }) ?? {}) : {})}
              >
                <AirImage
                  sys={{ id: item.image.sys.id }}
                  className={accordionStyles.getImageElementClasses(isHovered, shouldShowExpanded)}
                />
              </div>
            )}
            <Box
              direction={{ base: 'col', lg: 'row' }}
              gap={{ base: 6, lg: 24 }}
              className={accordionStyles.getContentBoxClasses(item.variant)}
            >
              <Box
                direction="col"
                gap={2}
                className={accordionStyles.getContentClasses(item.variant)}
              >
                <div>
                  {item.overline && (
                    <p
                      className={accordionStyles.getOverlineClasses(isHovered, shouldShowExpanded)}
                      {...(inspectorProps ? (inspectorProps({ fieldId: 'overline' }) ?? {}) : {})}
                    >
                      {item.overline}
                    </p>
                  )}

                  <h3
                    className={accordionStyles.getTitleClasses(isHovered, shouldShowExpanded)}
                    {...(inspectorProps ? (inspectorProps({ fieldId: 'title' }) ?? {}) : {})}
                  >
                    {item.title}
                  </h3>
                </div>
                <div
                  className={accordionStyles.getDescriptionClasses(
                    isHovered,
                    shouldShowExpanded,
                    item.variant
                  )}
                >
                  {item.description && (
                    <p
                      className={accordionStyles.getDescriptionTextClasses(
                        isHovered,
                        shouldShowExpanded,
                      )}
                      {...(inspectorProps
                        ? (inspectorProps({ fieldId: 'description' }) ?? {})
                        : {})}
                    >
                      {item.description}
                    </p>
                  )}

                  {item.tags && (
                    <div className={accordionStyles.getTagsContainerClasses()}>
                      {item.tags.map((tag) => (
                        <span key={tag} className={accordionStyles.getTagClasses()}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Box>
              {item.cta && (
                <div
                  className={accordionStyles.getCtaWrapperClasses(item.variant)}
                  {...(inspectorProps ? (inspectorProps({ fieldId: 'cta' }) ?? {}) : {})}
                >
                  <Button variant="white" asChild>
                    <Link href={item.cta.internalLink?.slug ?? ''}>{item.cta.text}</Link>
                  </Button>
                </div>
              )}
            </Box>
          </Box>
        </AccordionTrigger>
      </AccordionItemPrimitive>
    );
  };

  switch (item.variant) {
    case 'ContentTop':
      return <VerticalAccordionItem />;
    case 'ContentRight':
      return <HorizontalAccordionItem />;
    case 'ContentBottom':
      return <HorizontalAccordionItem />;
    case 'ContentLeft':
      return <HorizontalAccordionItem />;
    default:
      return <HorizontalAccordionItem />;
  }
};
