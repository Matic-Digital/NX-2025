'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import type { Testimonials as TestimonialsType } from '@/types/contentful/Testimonials';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';

type TestimonialsProps = TestimonialsType;

export function Testimonials(props: TestimonialsProps) {
  const testimonials = useContentfulLiveUpdates(props);

  return (
    <ErrorBoundary>
      <Section>
        <Container>
          <Box direction="row" className="">
            {testimonials.itemsCollection?.items?.map((item) => (
              <Box key={item.sys?.id} direction="row" className="">
                <Box className="relative">
                  <AirImage {...item.headshot} altText={item.headshot?.altText ?? undefined} />
                </Box>
                <Box direction="col">
                  <h2>{item.title}</h2>
                  <p>{item.quote}</p>
                  <p>{item.authorName}</p>
                  <p>{item.authorTitle}</p>
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
