import { AccordionSkeleton } from '@/components/Accordion/components/AccordionSkeleton';

/**
 * Pure presentation components for accordion states
 * Handle only UI rendering for different states
 */

export const LoadingState = () => <AccordionSkeleton />;

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg text-red-500">{message}</div>
  </div>
);

export const EmptyState = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg">No accordion items found</div>
  </div>
);
