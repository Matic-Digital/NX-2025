'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Accordion as AccordionPrimitive,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { getAccordionsByIds } from './AccordionApi';
import { AirImage } from '@/components/media/AirImage';
import type { AccordionSchema } from './AccordionSchema';
import { Box } from '@/components/global/matic-ds';

interface AccordionProps {
  sys: {
    id: string;
  };
}

export function Accordion({ sys }: AccordionProps) {
  const [accordionData, setAccordionData] = useState<AccordionSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const [openItem, setOpenItem] = useState('item-0'); // First item is always open
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleHover = (value: string) => {
    setHoveredItem(value);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  useEffect(() => {
    async function fetchAccordionData() {
      try {
        setLoading(true);
        const data = await getAccordionsByIds([sys.id]);
        if (data.length > 0 && data[0]) {
          setAccordionData(data[0]);
        } else {
          console.log('Accordion: No data returned or empty array');
        }
      } catch (error) {
        console.error('Error fetching accordion data:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAccordionData();
  }, [sys.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-lg">Loading accordion...</div>
      </div>
    );
  }

  if (!accordionData?.itemsCollection?.items?.length) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-lg">No accordion items found</div>
      </div>
    );
  }

  return (
    <div onMouseLeave={handleMouseLeave}>
      <AccordionPrimitive type="single" value={openItem} onValueChange={setOpenItem}>
        <Box direction="col" gap={6}>
          {accordionData.itemsCollection.items.map((item, index) => {
            const itemValue = `item-${index}`;
            const isHovered = hoveredItem === itemValue;
            const isFirstItem = index === 0;
            const shouldShowExpanded = isFirstItem && !hoveredItem;

            return (
              <AccordionItem
                key={`accordion-${index}-item-${item.sys.id}`}
                value={itemValue}
                className={`overflow-hidden border-none bg-[#1D1E1F] text-white shadow-lg transition-all duration-500 ease-out lg:${
                  isHovered || shouldShowExpanded ? 'shadow-lg' : 'shadow-none'
                }`}
              >
                <AccordionTrigger
                  chevron={false}
                  onMouseOver={() => handleHover(itemValue)}
                  className={`h-auto p-0 transition-all duration-500 ease-out hover:no-underline ${
                    isHovered || shouldShowExpanded ? 'lg:h-auto' : 'lg:h-60'
                  }`}
                >
                  <Box
                    direction="col"
                    gap={0}
                    cols={{ base: 1, lg: 12 }}
                    className="min-h-20 lg:flex-row"
                  >
                    {item.image?.sys?.id && (
                      <div className="col-span-7 h-full overflow-hidden">
                        <AirImage
                          sys={{ id: item.image.sys.id }}
                          className={`h-full w-full object-cover ${
                            isHovered || shouldShowExpanded ? 'lg:h-full' : 'lg:h-60'
                          }`}
                        />
                      </div>
                    )}
                    <Box
                      direction="col"
                      gap={6}
                      className="relative col-span-5 p-12 transition-all duration-500 ease-out"
                    >
                      <Image
                        src="https://air-prod.imgix.net/15bada56-2831-4406-98af-2330b3782171.jpg?w=1160&h=986&fm=webp&fit=crop&auto=auto"
                        fill
                        className={`z-10 opacity-100 transition-all duration-500 ease-out ${
                          isHovered || shouldShowExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                        }`}
                        alt="background gradient image"
                      />

                      <h3
                        className={`text-headline-sm relative z-20 line-clamp-none max-w-[300px] text-white transition-all duration-500 ease-out ${
                          isHovered || shouldShowExpanded ? 'lg:line-clamp-none' : 'lg:line-clamp-2'
                        }`}
                      >
                        {item.heading}
                      </h3>
                      <div
                        className={`relative z-20 opacity-100 transition-all duration-500 ease-out ${
                          isHovered || shouldShowExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                        }`}
                      >
                        {item.description && <p className="text-white">{item.description}</p>}
                      </div>
                    </Box>
                  </Box>
                </AccordionTrigger>
              </AccordionItem>
            );
          })}
        </Box>
      </AccordionPrimitive>
    </div>
  );
}
