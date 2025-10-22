'use client';

import { useEffect, useState } from 'react';

import { getTestimonialsById } from '@/components/Testimonials/TestimonialsApi';

import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';

/**
 * Custom hook for fetching testimonials data
 * Handles lazy loading of testimonials by ID
 */
export const useTestimonialsData = (sysId: string) => {
  const [testimonials, setTestimonials] = useState<TestimonialsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } catch (error) {
        console.error('Failed to fetch testimonials data:', error);
        setError('Failed to load testimonials data');
      } finally {
        setLoading(false);
      }
    }

    void fetchTestimonialsData();
  }, [sysId]);

  return { testimonials, loading, error };
};
