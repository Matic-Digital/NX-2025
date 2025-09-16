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
