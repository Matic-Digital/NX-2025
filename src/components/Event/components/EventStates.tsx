import { EventSkeleton } from './EventSkeleton';

export const LoadingState = () => <EventSkeleton />;

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg text-red-500">{message}</div>
  </div>
);

export const EmptyState = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg">No event found</div>
  </div>
);
