import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Container, Section } from '@/components/global/matic-ds';

import { TestimonialSkeleton } from '@/components/Testimonials/TestimonialSkeleton';

/**
 * Pure presentation components for testimonials states
 * Handle only UI rendering for different states
 */

export const LoadingState = () => (
  <ErrorBoundary>
    <Section>
      <Container className="md:px-0">
        <TestimonialSkeleton count={3} />
      </Container>
    </Section>
  </ErrorBoundary>
);

export const ErrorState = ({ message }: { message: string }) => (
  <ErrorBoundary>
    <Section>
      <Container className="md:px-0">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500">{message}</div>
        </div>
      </Container>
    </Section>
  </ErrorBoundary>
);

export const EmptyState = () => (
  <ErrorBoundary>
    <Section>
      <Container className="md:px-0">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">No testimonials found</div>
        </div>
      </Container>
    </Section>
  </ErrorBoundary>
);
