'use client';

import { useEffect, useState } from 'react';

import { getAccordionItemById as _getAccordionItemById, getAccordionsByIds as _getAccordionsByIds } from '@/components/Accordion/AccordionApi';

import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

/**
 * Custom hook for accordion data - now expects server-side enriched data
 * Client-side fetching is disabled to use server-side enrichment
 */
export const useAccordionData = (sysId: string, serverData?: AccordionItemType[]) => {
  const [accordionItems, setAccordionItems] = useState<AccordionItemType[]>(serverData || []);
  const [loading, setLoading] = useState(!serverData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // COMPLETELY DISABLE client-side fetching - only use server-side data
    if (serverData && serverData.length > 0) {
      setAccordionItems(serverData);
      setLoading(false);
      return; // Already have server-side data
    }

    // If we don't have server data, show error state
    console.warn('Accordion missing server-side data - showing error state. ID:', sysId);
    setError('Accordion data not provided by server-side enrichment');
    setLoading(false);
  }, [sysId, serverData]);

  return { accordionItems, loading, error };
};
