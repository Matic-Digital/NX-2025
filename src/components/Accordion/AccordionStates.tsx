export const LoadingState = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg">Loading accordion...</div>
  </div>
);

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
