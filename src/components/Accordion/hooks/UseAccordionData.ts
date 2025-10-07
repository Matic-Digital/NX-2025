'use client';

import { useEffect, useState } from 'react';

import { getAccordionItemById, getAccordionsByIds } from '@/components/Accordion/AccordionApi';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

/**
 * Custom hook for fetching accordion data
 * Handles the two-step fetching pattern to avoid GraphQL complexity limits
 */
export const useAccordionData = (sysId: string) => {
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
