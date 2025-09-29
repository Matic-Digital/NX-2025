'use client';

export function ContactCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-96 w-full animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}
