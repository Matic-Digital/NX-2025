'use client';

import { ContactCardSkeleton } from '@/components/ContactCard/components/ContactCardSkeleton';

/**
 * ContactCard states component - handles loading, error, and empty states
 */
export function LoadingState() {
  return <ContactCardSkeleton />;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-background border-border flex h-full flex-col rounded-lg border p-6">
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{message}</div>
      </div>
    </div>
  );
}

export function EmptyState() {
  return <ContactCardSkeleton />;
}
