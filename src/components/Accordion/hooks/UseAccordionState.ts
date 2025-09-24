import type { AccordionItem as AccordionItemType } from '@/components/Accordion/AccordionSchema';

/**
 * State management hook for Accordion component
 * Handles loading, error, and empty state logic
 */
export const useAccordionState = (
  accordionItems: AccordionItemType[],
  loading: boolean,
  error: string | null
) => {
  // State determination logic
  const getCurrentState = () => {
    if (loading) {
      return { type: 'loading' as const };
    }

    if (error) {
      return { type: 'error' as const, message: error };
    }

    if (!accordionItems.length) {
      return { type: 'empty' as const };
    }

    return { type: 'content' as const };
  };

  const currentState = getCurrentState();

  // State-specific return values
  const getStateProps = () => {
    switch (currentState.type) {
      case 'loading':
        return { shouldRenderContent: false, stateComponent: 'LoadingState' };
      case 'error':
        return {
          shouldRenderContent: false,
          stateComponent: 'ErrorState',
          message: currentState.message
        };
      case 'empty':
        return { shouldRenderContent: false, stateComponent: 'EmptyState' };
      case 'content':
        return { shouldRenderContent: true, stateComponent: null };
      default:
        return { shouldRenderContent: false, stateComponent: 'ErrorState' };
    }
  };

  return {
    currentState,
    ...getStateProps()
  };
};
