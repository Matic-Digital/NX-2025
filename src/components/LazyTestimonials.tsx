'use client';

import { useEffect, useState } from 'react';
import { Testimonials } from '@/components/global/Testimonials';
import { getTestimonialsById } from '@/lib/contentful-api/testimonials';
import type { Testimonials as TestimonialsType } from '@/types/contentful/Testimonials';

interface LazyTestimonialsProps {
  testimonialsId: string;
}

export function LazyTestimonials({ testimonialsId }: LazyTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<TestimonialsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true);
        const data = await getTestimonialsById(testimonialsId);
        setTestimonials(data);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    }

    void fetchTestimonials();
  }, [testimonialsId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading testimonials...</div>
      </div>
    );
  }

  if (error || !testimonials) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error ?? 'Testimonials not found'}</div>
      </div>
    );
  }

  return <Testimonials key={`lazy-loaded-${testimonialsId}`} {...testimonials} />;
}
