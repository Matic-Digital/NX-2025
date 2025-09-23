'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import {
  AccordionItem,
  Accordion as AccordionPrimitive,
  AccordionTrigger
} from '@/components/ui/accordion';

import { getAccordionItemById, getAccordionsByIds } from '@/components/Accordion/AccordionApi';
import { AccordionSkeleton } from '@/components/Accordion/AccordionSkeleton';
import { Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/Image/AirImage';

import type {
  AccordionItem as AccordionItemType,
  Accordion as AccordionType
} from '@/components/Accordion/AccordionSchema';

// Types
interface AccordionProps {
  sys: AccordionType['sys'];
}

interface AccordionItemProps {
  item: AccordionItemType;
  index: number;
  isHovered: boolean;
  shouldShowExpanded: boolean;
  onHover: (value: string) => void;
}

// Utility functions
const getItemClasses = (isHovered: boolean, shouldShowExpanded: boolean) => {
  return `overflow-hidden border-none bg-[#1D1E1F] text-white shadow-lg transition-all duration-500 ease-out lg:${
    isHovered || shouldShowExpanded ? 'shadow-lg' : 'shadow-none'
  }`;
};

const getTriggerClasses = (isHovered: boolean, shouldShowExpanded: boolean) => {
  return `h-auto p-0 transition-all duration-500 ease-out hover:no-underline ${
    isHovered || shouldShowExpanded ? 'lg:h-auto' : 'lg:h-60'
  }`;
};

const getImageClasses = (variant: string | undefined) => {
  return cn(
    'col-span-7 h-full overflow-hidden',
    variant === 'ContentLeft' ? 'order-1 lg:order-2' : 'order-1'
  );
};

const getContentClasses = (variant: string | undefined) => {
  return cn(
    'relative col-span-5 p-12 transition-all duration-500 ease-out',
    variant === 'ContentLeft' ? 'order-2 lg:order-1' : 'order-2'
  );
};

// Custom hook for accordion data
const useAccordionData = (sysId: string) => {
  const [accordionItems, setAccordionItems] = useState<AccordionItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccordionData() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch accordion with just sys fields for items
        const data = await getAccordionsByIds([sysId]);

        if (data.length > 0 && data[0]) {
          const accordion = data[0];

          // Step 2: Fetch full data for each accordion item
          const itemIds = accordion.itemsCollection.items.map((item) => item.sys.id);
          const itemPromises = itemIds.map((id) => getAccordionItemById(id));
          const items = await Promise.all(itemPromises);

          // Filter out any null results
          const validItems = items.filter((item): item is AccordionItemType => item !== null);
          setAccordionItems(validItems);
        } else {
          setError('No accordion data found');
        }
      } catch (error) {
        console.error('Failed to fetch accordion data:', error);
        setError('Failed to load accordion data');
      } finally {
        setLoading(false);
      }
    }

    void fetchAccordionData();
  }, [sysId]);

  return { accordionItems, loading, error };
};

// Sub-components
const AccordionItemContent = ({
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
      className={getItemClasses(isHovered, shouldShowExpanded)}
    >
      <AccordionTrigger
        chevron={false}
        onMouseOver={() => onHover(itemValue)}
        className={getTriggerClasses(isHovered, shouldShowExpanded)}
      >
        <Box direction="col" gap={0} cols={{ base: 1, lg: 12 }} className="min-h-20 lg:flex-row">
          {item.image?.sys?.id && (
            <div className={getImageClasses(item.variant)}>
              <AirImage
                sys={{ id: item.image.sys.id }}
                className={`h-full w-full object-cover ${
                  isHovered || shouldShowExpanded ? 'lg:h-full' : 'lg:h-60'
                }`}
              />
            </div>
          )}
          <Box direction="col" gap={24} className={getContentClasses(item.variant)}>
            <Image
              src="https://air-prod.imgix.net/15bada56-2831-4406-98af-2330b3782171.jpg?w=1160&h=986&fm=webp&fit=crop&auto=auto"
              fill
              className={`z-10 opacity-100 transition-all duration-500 ease-out ${
                isHovered || shouldShowExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
              }`}
              alt="background gradient image"
            />

            <div>
              {item.overline && (
                <p className="text-body-xs relative z-20 text-white">{item.overline}</p>
              )}

              <h3
                className={`text-headline-sm relative z-20 line-clamp-none max-w-[300px] text-white ${
                  isHovered || shouldShowExpanded ? 'lg:line-clamp-none' : 'lg:line-clamp-2'
                }`}
              >
                {item.title}
              </h3>
            </div>
            <div
              className={`relative z-20 space-y-4 opacity-100 transition-all duration-500 ease-out ${
                isHovered || shouldShowExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
              }`}
            >
              {item.description && <p className="text-body-xs text-white">{item.description}</p>}

              {item.tags && (
                <div className="flex flex-col">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'text-body-xs border-t border-white/10 py-2 text-white first:border-b-0 last:border-b-1'
                      )}
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

const LoadingState = () => <AccordionSkeleton />;

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg text-red-500">{message}</div>
  </div>
);

const EmptyState = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg">No accordion items found</div>
  </div>
);

// Main component
export function Accordion({ sys }: AccordionProps) {
  const { accordionItems, loading, error } = useAccordionData(sys.id);
  const [openItem, setOpenItem] = useState('item-0'); // First item is always open
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleHover = (value: string) => {
    setHoveredItem(value);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Empty state
  if (!accordionItems.length) {
    return <EmptyState />;
  }

  return (
    <div onMouseLeave={handleMouseLeave}>
      <AccordionPrimitive type="single" value={openItem} onValueChange={setOpenItem}>
        <Box direction="col" gap={6}>
          {accordionItems.map((item, index) => {
            const itemValue = `item-${index}`;
            const isHovered = hoveredItem === itemValue;
            const isFirstItem = index === 0;
            const shouldShowExpanded = isFirstItem && !hoveredItem;

            return (
              <AccordionItemContent
                key={`accordion-${index}-item-${item.sys.id}`}
                item={item}
                index={index}
                isHovered={isHovered}
                shouldShowExpanded={shouldShowExpanded}
                onHover={handleHover}
              />
            );
          })}
        </Box>
      </AccordionPrimitive>
    </div>
  );
}
