'use client';

import { useEffect, useState } from 'react';
import {
  Accordion as AccordionPrimitive,
  AccordionContent,
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
        <Box direction="col" gap={6}>
          {accordionData.itemsCollection.items.map((item, index) => (
            <AccordionItem
              key={`accordion-${accordionData.sys.id}-item-${item.sys.id}`}
              value={`item-${index}`}
              className="bg-foreground overflow-hidden transition-all duration-300 ease-out group hover:shadow-lg"
            >
              <AccordionTrigger
                chevron={false}
                onMouseOver={() => handleHover(`item-${index}`)}
                className="p-0 hover:no-underline h-20 group-hover:h-auto"
              >
                <Box direction="row" gap={0} cols={{ base: 1, lg: 6 }} className="min-h-20">
                  {item.image?.sys?.id && (
                    <div className="col-span-4 h-20 group-hover:h-64 transition-all duration-300 ease-out overflow-hidden">
                      <AirImage 
                        sys={{ id: item.image.sys.id }} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <Box direction="col" gap={6} className="col-span-2 p-4 group-hover:p-12 transition-all duration-300 ease-out">
                    <h3 className="text-headline-sm text-background max-w-[300px] line-clamp-2 group-hover:line-clamp-none">
                      {item.heading}
                    </h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                      {item.description && <p className="text-background">{item.description}</p>}
                    </div>
                  </Box>
                </Box>
              </AccordionTrigger>
            </AccordionItem>
          ))}
        </Box>
      </AccordionPrimitive>
    </div>
  );
}
