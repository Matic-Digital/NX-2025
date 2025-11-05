'use client';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';

import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';
import {
  EmptyState,
  ErrorState,
  LoadingState
} from '@/components/Testimonials/components/TestimonialsStates';
import { useTestimonialsData } from '@/components/Testimonials/hooks/UseTestimonialsData';

import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';

// Types - Support both minimal sys data and full Testimonials data
type TestimonialsAllProps = TestimonialsProps | (TestimonialsType & { className?: string });

interface TestimonialsProps {
  sys: TestimonialsType['sys'];
  className?: string;
}

/**
 * Main Testimonials component - orchestrates all layers
 * Pure composition of data and presentation layers
 * Supports both server-side enriched data and client-side fetching
 */
export function Testimonials(props: TestimonialsAllProps) {
  // Check if we have full Testimonials data (server-side rendered) or just reference (client-side)
  const hasFullData = 'title' in props && props.title !== undefined;
  const sys = props.sys;
  
  // Debug logging removed
  
  // Data layer - only use hook if we don't have server-side data
  const { testimonials: clientTestimonials, loading, error } = useTestimonialsData(
    sys.id, 
    hasFullData ? (props as TestimonialsType) : undefined
  );
  
  // Use server-side data if available, otherwise use client-side data
  const testimonials = hasFullData ? (props as TestimonialsType) : clientTestimonials;

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
