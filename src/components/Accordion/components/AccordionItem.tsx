'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  AccordionItem as AccordionItemPrimitive,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import { useAccordion } from '@/contexts/AccordionContext';

import { Box } from '@/components/global/matic-ds';

import { accordionStyles } from '@/components/Accordion/styles/AccordionStyles';
import { AirImage } from '@/components/Image/AirImage';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

interface AccordionItemProps {
  item: AccordionItemType;
  index: number;
  isFirst?: boolean;
  itemId?: string;
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
  isFirst = false,
  itemId,
  isHovered: _isHovered,
  shouldShowExpanded: _shouldShowExpanded,
  onHover: _onHover,
  inspectorProps
}: AccordionItemProps) => {
  const itemValue = itemId ?? `item-${index}`;
  const { activeItemId, setActiveItemId, lastHoveredItemId, setLastHoveredItemId } = useAccordion();
  const [isHovered, setIsHovered] = useState(false);

  // Set first item as active on mount if no item is active
  useEffect(() => {
    if (isFirst && itemValue && activeItemId === null) {
      setActiveItemId(itemValue);
      // For ContentTop variant, also set as last hovered item to ensure single active state
      if (item.variant === 'ContentTop') {
        setLastHoveredItemId(itemValue);
      }
    }
  }, [isFirst, itemValue, activeItemId, setActiveItemId, item.variant, setLastHoveredItemId]);

  const isActive = activeItemId === itemValue;
  
  // For ContentTop variant, show hover styles ONLY if this is the last hovered item (ensures single active)
  const shouldShowHoverStyles = item.variant === 'ContentTop' 
    ? (lastHoveredItemId === itemValue)
    : isHovered;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (itemValue) {
      setActiveItemId(itemValue);
      // For ContentTop variant, always update the last hovered item (this ensures only one is active)
      if (item.variant === 'ContentTop') {
        setLastHoveredItemId(itemValue);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Don't clear lastHoveredItemId on mouse leave - it persists until another item is hovered
  };

  const HorizontalAccordionItem = () => {
    return (
      <AccordionItemPrimitive
        key={`accordion-${index}-item-${item.sys.id}`}
        value={itemValue}
        className={accordionStyles.getItemClasses(false, isActive, item.variant)}
      >
        <AccordionTrigger
          chevron={false}
          onMouseEnter={handleMouseEnter}
          className={accordionStyles.getTriggerClasses(false, isActive)}
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
                {...(inspectorProps ? inspectorProps({ fieldId: 'image' }) ?? {} : {})}
              >
                <AirImage
                  sys={{ id: item.image.sys.id }}
                  className={accordionStyles.getImageElementClasses(false, isActive)}
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
                    false,
                    isActive,
                    item.variant
                  )}
                />
              )}

              <div>
                {item.overline && (
                  <p 
                    className={accordionStyles.getOverlineClasses(false, isActive)}
                    {...(inspectorProps ? inspectorProps({ fieldId: 'overline' }) ?? {} : {})}
                  >
                    {item.overline}
                  </p>
                )}

                <h3 
                  className={accordionStyles.getTitleClasses(false, isActive)}
                  {...(inspectorProps ? inspectorProps({ fieldId: 'title' }) ?? {} : {})}
                >
                  {item.title}
                </h3>
              </div>
              <div className={accordionStyles.getDescriptionClasses(false, isActive)}>
                {item.description && (
                  <p 
                    className={accordionStyles.getDescriptionTextClasses(false, isActive)}
                    {...(inspectorProps ? inspectorProps({ fieldId: 'description' }) ?? {} : {})}
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
        className={accordionStyles.getItemClasses(false, isActive, item.variant)}
      >
        <AccordionTrigger
          chevron={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={accordionStyles.getTriggerClasses(shouldShowHoverStyles, isActive, item.variant)}
        >
          <Box
            direction="col"
            gap={0}
            cols={1}
            className={accordionStyles.getWrapperClasses(item.variant, shouldShowHoverStyles, isActive)}
          >
            {item.image?.sys?.id && (
              <div 
                className={accordionStyles.getImageClasses(item.variant, false, isActive)}
                {...(inspectorProps ? inspectorProps({ fieldId: 'image' }) ?? {} : {})}
              >
                <AirImage
                  sys={{ id: item.image.sys.id }}
                  className={accordionStyles.getImageElementClasses(false, isActive)}
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
                      className={accordionStyles.getOverlineClasses(shouldShowHoverStyles, isActive, item.variant)}
                      {...(inspectorProps ? inspectorProps({ fieldId: 'overline' }) ?? {} : {})}
                    >
                      {item.overline}
                    </p>
                  )}

                  <h3 
                    className={accordionStyles.getTitleClasses(shouldShowHoverStyles, isActive, item.variant)}
                    {...(inspectorProps ? inspectorProps({ fieldId: 'title' }) ?? {} : {})}
                  >
                    {item.title}
                  </h3>
                </div>
                <div
                  className={accordionStyles.getDescriptionClasses(shouldShowHoverStyles, isActive, item.variant)}
                >
                  {item.description && (
                    <p 
                      className={accordionStyles.getDescriptionTextClasses(shouldShowHoverStyles, isActive, item.variant)}
                      {...(inspectorProps ? inspectorProps({ fieldId: 'description' }) ?? {} : {})}
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
                  {...(inspectorProps ? inspectorProps({ fieldId: 'cta' }) ?? {} : {})}
                >
                  <Button variant={accordionStyles.getButtonVariant(shouldShowHoverStyles, isActive, item.variant)} asChild>
                    <Link href={item.cta.internalLink?.slug ?? ''}>{item.cta.text}</Link>
                  </Button>
                </div>
              )}
            </Box>
          </Box>
        </AccordionTrigger>
        
        {/* Image only shows when item is active/hovered */}
        {item.image?.sys?.id && shouldShowHoverStyles && (
          <div 
            className={accordionStyles.getImageClasses(item.variant, shouldShowHoverStyles, isActive)}
            {...(inspectorProps ? inspectorProps({ fieldId: 'image' }) ?? {} : {})}
          >
            <AirImage
              sys={{ id: item.image.sys.id }}
              className={accordionStyles.getImageElementClasses(shouldShowHoverStyles, isActive, item.variant)}
            />
          </div>
        )}
      </AccordionItemPrimitive>
    );
  };

  switch (item.variant) {
    case 'ContentLeft':
      return <HorizontalAccordionItem />;
    case 'ContentTop':
      return <VerticalAccordionItem />;
    case 'ContentRight':
      return <HorizontalAccordionItem />;
    default:
      return <HorizontalAccordionItem />;
  }
};
