'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Accordion as AccordionPrimitive,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { getAccordionsByIds } from '@/lib/contentful-api/accordion';
import { AirImage } from '@/components/media/AirImage';
import type { Accordion as AccordionType } from '@/types/contentful';
import { Box } from '@/components/global/matic-ds';

interface AccordionProps {
  sys: {
    id: string;
  };
}

export function Accordion({ sys }: AccordionProps) {
  const [accordionData, setAccordionData] = useState<AccordionType | null>(null);
  const [loading, setLoading] = useState(true);

  const [openItem, setOpenItem] = useState(''); // "" means nothing is open

  const handleHover = (value: string) => {
    setOpenItem(value);
  };

  const handleMouseLeave = () => {
    setOpenItem(''); // Close the accordion when the mouse leaves the entire component
  };

  console.log('Accordion: data', accordionData);
  console.log('Accordion: sys.id', sys.id);

  useEffect(() => {
    async function fetchAccordionData() {
      try {
        setLoading(true);
        const data = await getAccordionsByIds([sys.id]);
        console.log('Accordion: received data from API', data);
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
        <div className="flex flex-col gap-6 lg:h-[800px]">
          {accordionData.itemsCollection.items.map((item, index) => (
            <div 
              key={`accordion-${accordionData.sys.id}-item-${item.sys.id}`} 
              className="bg-foreground group overflow-hidden transition-all duration-300 ease-out lg:min-h-[120px] lg:flex-1 lg:hover:flex-[4] lg:hover:shadow-lg"
              onMouseOver={() => handleHover(`item-${index}`)}
            >
              <AccordionItem
                value={`item-${index}`}
                className="h-full"
              >
              <AccordionTrigger
                chevron={false}
                className="h-full p-0 hover:no-underline"
              >
                <Box
                  direction="col"
                  gap={0}
                  cols={{ base: 1, lg: 12 }}
                  className="h-full lg:flex-row"
                >
                  {item.image?.sys?.id && (
                    <div className="h-60 overflow-hidden lg:col-span-7 lg:h-full">
                      <AirImage
                        sys={{ id: item.image.sys.id }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Box
                    direction="col"
                    gap={6}
                    className="relative p-6 transition-all duration-300 ease-out lg:col-span-5 lg:p-12 lg:group-hover:p-12"
                  >
                    <Image
                      src="https://air-prod.imgix.net/15bada56-2831-4406-98af-2330b3782171.jpg?w=1160&h=986&fm=webp&fit=crop&auto=auto"
                      fill
                      className="z-10 lg:hidden lg:group-hover:block"
                      alt="background gradient image"
                    />

                    <h3 className="text-headline-sm text-background relative z-20 lg:line-clamp-2 lg:max-w-[300px] lg:group-hover:line-clamp-none">
                      {item.heading}
                    </h3>
                    <div className="relative z-20 lg:opacity-0 lg:transition-opacity lg:duration-300 lg:ease-out lg:group-hover:opacity-100">
                      {item.description && <p className="text-background">{item.description}</p>}
                    </div>
                  </Box>
                </Box>
              </AccordionTrigger>
              </AccordionItem>
            </div>
          ))}
        </div>
      </AccordionPrimitive>
    </div>
  );
}
