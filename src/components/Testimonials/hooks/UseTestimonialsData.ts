'use client';

import { useEffect, useState } from 'react';

import { getTestimonialsById } from '@/components/Testimonials/TestimonialsApi';

import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';

/**
 * Custom hook for fetching testimonials data
 * Handles lazy loading of testimonials by ID
 * Supports server-side enriched data to avoid client-side fetching
 */
export const useTestimonialsData = (sysId: string, serverData?: TestimonialsType) => {
  const [testimonials, setTestimonials] = useState<TestimonialsType | null>(serverData || null);
  const [loading, setLoading] = useState(!serverData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have server-side data, don't fetch client-side
    if (serverData) {
      setTestimonials(serverData);
      setLoading(false);
      return;
    }

    async function fetchTestimonialsData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getTestimonialsById(sysId);

        if (data) {
          setTestimonials(data);
        } else {
          setError('No testimonials data found');
        }
      } catch {
        setError('Failed to load testimonials data');
      } finally {
        setLoading(false);
      }
    }

    void fetchTestimonialsData();
  }, [sysId, serverData]);

  return { testimonials, loading, error };
};
