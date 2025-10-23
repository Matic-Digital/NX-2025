'use client';

import type { ContactCard } from '@/components/ContactCard/ContactCardSchema';

/**
 * Custom hook for ContactCard state management
 */
export function useContactCardState(
  contactCard: ContactCard | null,
  loading: boolean,
  error: string | null
) {
  const getCurrentState = () => {
    if (loading) {
      return { type: 'loading' as const };
    }

    if (error) {
      return { type: 'error' as const, message: error };
    }

    if (!contactCard) {
      return { type: 'empty' as const };
    }

    return { type: 'loaded' as const, contactCard };
  };

  const currentState = getCurrentState();

  return {
    currentState
  };
}
