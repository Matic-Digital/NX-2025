'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { PageCollection } from '@/components/Collection/components/PageCollection';
import { PostCollection } from '@/components/Collection/components/PostCollection';
import { SearchBar } from '@/components/Collection/components/SearchBar';
import { SearchCard } from '@/components/Collection/components/SearchCard';
import { Pagination } from '@/components/Collection/components/Pagination';
import { detectContentType } from '@/components/Collection/utils/ContentTypeDetection';
// State components are now handled inline for better performance
import { useCollectionData } from '@/components/Collection/hooks/UseCollectionData';
import { useCollectionFiltering } from '@/components/Collection/hooks/UseCollectionFiltering';
import { useCollectionState } from '@/components/Collection/hooks/UseCollectionState';
import { usePagesData } from '@/components/Collection/hooks/UsePagesData';
import { usePageListsData } from '@/components/Collection/hooks/UsePageListsData';
import { usePostsData } from '@/components/Collection/hooks/UsePostsData';
import { useProductsData } from '@/components/Collection/hooks/UseProductsData';
import { useSolutionsData } from '@/components/Collection/hooks/UseSolutionsData';
import { useServicesData } from '@/components/Collection/hooks/UseServicesData';

import type { Collection } from '@/components/Collection/CollectionSchema';

interface CollectionProps {
  collectionData?: Collection;
  sys?: {
    id: string;
  };
  __typename?: string;
  variant?: 'default' | 'search';
  isSearchContext?: boolean;
}

/**
 * Main Collection component - orchestrates all layers
 * Pure composition of data, logic, and presentation layers
 */
export default function Collection({ collectionData, sys, isSearchContext = false }: CollectionProps) {
  // Data layer
  const { collection, isLoading, error } = useCollectionData({ collectionData, sys });
  const { posts, isLoading: postsLoading } = usePostsData({ collection, collectionData });
  const { pages, isLoading: pagesLoading } = usePagesData({ collection, collectionData });
  const { pageLists, isLoading: pageListsLoading } = usePageListsData({ collection, collectionData });
  const { products, isLoading: productsLoading } = useProductsData({ collection, collectionData });
  const { solutions, isLoading: solutionsLoading } = useSolutionsData({ collection, collectionData });
  const { services, isLoading: servicesLoading } = useServicesData({ collection, collectionData });

  // Business logic layer (filtering and pagination)
  const {
    currentPage,
    setCurrentPage,
    activeFilter,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    postTagCategories,
    filteredPosts,
    currentPosts,
    totalPages,
    currentPages,
    totalPagesForPages,
    currentUnifiedItems,
    totalUnifiedPages
  } = useCollectionFiltering({
    posts,
    pages,
    pageLists,
    products,
    solutions,
    services,
    collection,
    collectionData
  });

  // Contentful Live Preview integration
  const updatedCollection = useContentfulLiveUpdates(collection);
  const inspectorProps = useContentfulInspectorMode({
    entryId: collection?.sys?.id
  });

  const finalCollection = updatedCollection ?? collection;

  // State layer - use unified items when search bar is enabled
  const itemsForState = (finalCollection?.searchBar ?? false) ? currentUnifiedItems : [...currentPosts, ...currentPages, ...pageLists, ...products, ...solutions, ...services];
  
  // Filter for state management
  const postsForState = itemsForState.filter(item => 'categories' in item);
  const pagesForState = itemsForState.filter(item => !('categories' in item) && !('icon' in item) && !('backgroundImage' in item) && !('cardImage' in item));
  
  const { shouldRenderContent, stateComponent, message, searchQuery: emptySearchQuery } = useCollectionState(
    finalCollection,
    isLoading,
    error,
    postsForState,
    pagesForState,
    searchQuery,
    postsLoading || productsLoading || solutionsLoading || servicesLoading,
    pagesLoading || pageListsLoading,
    isSearchContext,
    finalCollection?.searchBar ?? false
  );

  return (
    <div {...inspectorProps}>
      {/* Always render search bar if enabled - outside of state/content toggle */}
      {(finalCollection?.searchBar ?? false) && (
        <SearchBar 
          key="collection-search-bar"
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          contentTypes={finalCollection?.contentType ?? []}
        />
      )}

      {/* Render state components with CSS visibility toggle */}
      <div className={shouldRenderContent ? 'hidden' : 'block'}>
        {stateComponent === 'LoadingState' && (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading collection...</div>
          </div>
        )}
        {stateComponent === 'ErrorState' && (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">{message}</div>
          </div>
        )}
        {stateComponent === 'EmptyState' && (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">No results found</div>
          </div>
        )}
        {stateComponent === 'EmptySearchState' && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-muted-foreground mb-2">No results found for &ldquo;{emptySearchQuery}&rdquo;</div>
            <div className="text-sm text-muted-foreground">Try adjusting your search terms</div>
          </div>
        )}
      </div>

      {/* Render content with CSS visibility toggle */}
      <div className={shouldRenderContent ? 'block' : 'hidden'}>

        {/* When search bar is enabled, use unified SearchCard layout */}
        {(finalCollection?.searchBar ?? false) ? (
          <div>
            <div className="space-y-0">
              {/* Render unified items as SearchCards */}
              {currentUnifiedItems.map((item) => {
                const contentType = detectContentType(item);
                
                return (
                  <SearchCard 
                    key={`${contentType}-${item.sys.id}`}
                    {...item} 
                    contentType={contentType} 
                  />
                );
              })}
            </div>

            {/* Single unified pagination */}
            {totalUnifiedPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalUnifiedPages} 
                onPageChange={setCurrentPage} 
              />
            )}
          </div>
        ) : (
          /* When search bar is disabled, use regular collections */
          <>
            {finalCollection && finalCollection.contentType?.includes('Post') && (
              <PostCollection
                filteredPosts={filteredPosts}
                currentPosts={currentPosts}
                currentPage={currentPage}
                totalPages={totalPages}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
                postTagCategories={postTagCategories}
                onFilterChange={handleFilterChange}
                onSearchChange={setSearchQuery}
                onPageChange={setCurrentPage}
                isLoading={postsLoading}
                searchBarEnabled={false} // Search bar is rendered above
              />
            )}

            {finalCollection && finalCollection.contentType?.includes('Page') && (
              <PageCollection
                currentPages={currentPages}
                currentPage={currentPage}
                totalPages={totalPagesForPages}
                onPageChange={setCurrentPage}
                isLoading={pagesLoading}
                variant="search"
                searchBarEnabled={false} // Search bar is rendered above
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            {finalCollection && !finalCollection.contentType?.includes('Post') && !finalCollection.contentType?.includes('Page') && (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No content type matched</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
