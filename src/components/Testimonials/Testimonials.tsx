'use client';

import React, { useEffect, useState } from 'react';
// import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import type { Testimonials as TestimonialsType } from './TestimonialsSchema';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { getTestimonialsById } from './TestimonialsApi';

type TestimonialsProps = TestimonialsType | { testimonialsId: string };

function isTestimonialsData(props: TestimonialsProps): props is TestimonialsType {
  return 'title' in props && 'itemsCollection' in props;
}

export function Testimonials(props: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<TestimonialsType | null>(
    isTestimonialsData(props) ? props : null
  );
  const [loading, setLoading] = useState(!isTestimonialsData(props));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isTestimonialsData(props)) {
      async function fetchTestimonials() {
        try {
          setLoading(true);
          const data = await getTestimonialsById(
            (props as { testimonialsId: string }).testimonialsId
          );
          setTestimonials(data);
        } catch (err) {
          console.error('Failed to fetch testimonials:', err);
          setError('Failed to load testimonials');
        } finally {
          setLoading(false);
        }
      }

      void fetchTestimonials();
    }
  }, [props]);

  // const liveTestimonials = useContentfulLiveUpdates(testimonials ?? {});

  if (loading) {
    return (
      <ErrorBoundary>
        <Section>
          <Container className="md:px-0">
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500">Loading testimonials...</div>
            </div>
          </Container>
        </Section>
      </ErrorBoundary>
    );
  }

  if (error || !testimonials) {
    return (
      <ErrorBoundary>
        <Section>
          <Container className="md:px-0">
            <div className="flex items-center justify-center p-8">
              <div className="text-red-500">{error ?? 'Testimonials not found'}</div>
            </div>
          </Container>
        </Section>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Section>
        <Container className="md:px-0">
          <Box direction="row" gap={8} className="">
            {testimonials.itemsCollection?.items?.map((item) => (
              <Box key={item.sys?.id} direction="row" className="w-full">
                <Box className="bg-blue relative overflow-hidden">
                  <AirImage
                    {...item.headshot}
                    altText={item.headshot?.altText ?? undefined}
                    className=""
                  />
                </Box>
                <Box direction="col" className="bg-subtle h-full justify-between p-[1.5rem]">
                  <blockquote className="text-body-sm">{item.quote}</blockquote>
                  <Box direction="col">
                    <p className="text-body-sm text-black">{item.authorName}</p>
                    <p className="text-body-xs text-black opacity-80">{item.authorTitle}</p>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}

export default Testimonials;
