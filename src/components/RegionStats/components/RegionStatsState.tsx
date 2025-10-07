/**
 * Pure presentation components for region stats states
 * Handle only UI rendering for different states
 */

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg text-red-500">{message}</div>
  </div>
);

export const EmptyState = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg">No region stats found</div>
  </div>
);
