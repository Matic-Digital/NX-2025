'use client';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';



import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';
import { EmptyState, ErrorState, LoadingState } from '@/components/Testimonials/components/TestimonialsStates';
import { useTestimonialsData } from '@/components/Testimonials/hooks/UseTestimonialsData';



import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';


// Types
interface TestimonialsProps {
  sys: TestimonialsType['sys'];
}

/**
 * Main Testimonials component - orchestrates all layers
 * Pure composition of data and presentation layers
 */
export function Testimonials({ sys }: TestimonialsProps) {
  // Data layer
  const { testimonials, loading, error } = useTestimonialsData(sys.id);

  console.log('⭐testimonials', testimonials);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Empty state
  if (!testimonials?.itemsCollection?.items?.length) {
    return <EmptyState />;
  }

  return (
    <ErrorBoundary>
      <Section>
        <Container className="px-0">
          <Box direction={{ base: 'col', md: 'row' }} gap={8} className="">
            {testimonials.itemsCollection.items.map((item) => (
              <TestimonialItem key={item.sys?.id} item={item} />
            ))}
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}