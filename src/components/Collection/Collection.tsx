'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { PageCollection } from '@/components/Collection/components/PageCollection';
import { PostCollection } from '@/components/Collection/components/PostCollection';
import { useCollectionData } from '@/components/Collection/hooks/UseCollectionData';
import { useCollectionFiltering } from '@/components/Collection/hooks/UseCollectionFiltering';
import { usePagesData } from '@/components/Collection/hooks/UsePagesData';
import { usePostsData } from '@/components/Collection/hooks/UsePostsData';

import type { Collection } from '@/components/Collection/CollectionSchema';

interface CollectionProps {
  collectionData?: Collection;
  sys?: {
    id: string;
  };
  __typename?: string;
}

export default function Collection({ collectionData, sys }: CollectionProps) {
  // Custom hooks for data fetching
  const { collection, isLoading, error } = useCollectionData({ collectionData, sys });
  const { posts, isLoading: postsLoading } = usePostsData({ collection, collectionData });
  const { pages, isLoading: pagesLoading } = usePagesData({ collection, collectionData });

  // Custom hook for filtering and pagination
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
    totalPagesForPages
  } = useCollectionFiltering({
    posts,
    pages,
    collection,
    collectionData
  });

  // Contentful Live Preview integration
  const updatedCollection = useContentfulLiveUpdates(collection);
  const inspectorProps = useContentfulInspectorMode({
    entryId: collection?.sys?.id
  });

  const finalCollection = updatedCollection ?? collection;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading collection...</div>
      </div>
    );
  }

  if (error || !finalCollection) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error ?? 'Collection not found'}</div>
      </div>
    );
  }

  // If Collection content type includes "Post", render PostCollection
  if (finalCollection?.contentType?.includes('Post')) {
    return (
      <div {...inspectorProps}>
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
          searchBarEnabled={finalCollection.searchBar ?? false}
        />
      </div>
    );
  }

  // If Collection content type includes "Page", render PageCollection
  if (finalCollection?.contentType?.includes('Page')) {
    return (
      <div {...inspectorProps}>
        <PageCollection
          currentPages={currentPages}
          currentPage={currentPage}
          totalPages={totalPagesForPages}
          onPageChange={setCurrentPage}
          isLoading={pagesLoading}
        />
      </div>
    );
  }

  // For Collections that don't match Post or Page, return null or minimal display
  return null;
}
