import type { Collection } from '@/components/Collection/CollectionSchema';

// Union type for all possible content items
type ContentItem = {
  sys: { id: string };
  title?: string;
  slug?: string;
  [key: string]: unknown;
};

/**
 * State management hook for Collection component
 * Handles loading, error, empty, and search state logic
 */
export const useCollectionState = (
  collection: Collection | null,
  isLoading: boolean,
  error: string | null,
  currentPosts: ContentItem[],
  currentPages: ContentItem[],
  searchQuery: string,
  postsLoading = false,
  pagesLoading = false,
  isSearchContext = false,
  _searchBarEnabled = false
) => {
  // State determination logic
  const getCurrentState = () => {
    if (isLoading) {
      return { type: 'loading' as const };
    }

    if (error || !collection) {
      return { 
        type: 'error' as const, 
        message: error ?? 'Collection not found' 
      };
    }

    if (postsLoading || pagesLoading) {
      return { type: 'loading' as const };
    }

    // If in search context and no search query is entered, show empty state (search page starts empty)
    if (isSearchContext && !searchQuery.trim()) {
      return { type: 'empty' as const };
    }

    // Check if we have search query but no results
    if (searchQuery.trim() && currentPosts.length === 0 && currentPages.length === 0) {
      return { 
        type: 'emptySearch' as const, 
        searchQuery: searchQuery.trim() 
      };
    }

    // Check if we have no content at all (for non-search contexts)
    if (!isSearchContext && currentPosts.length === 0 && currentPages.length === 0) {
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
      case 'emptySearch':
        return { 
          shouldRenderContent: false, 
          stateComponent: 'EmptySearchState',
          searchQuery: currentState.searchQuery
        };
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
