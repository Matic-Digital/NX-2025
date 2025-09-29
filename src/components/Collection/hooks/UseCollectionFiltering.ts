import { useEffect, useState } from 'react';

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { Post as PostType } from '@/components/Post/PostSchema';

interface UseCollectionFilteringProps {
  posts: PostType[];
  pages: Page[];
  collection: Collection | null;
  collectionData?: Collection;
}

export function useCollectionFiltering({
  posts,
  pages,
  collection,
  collectionData
}: UseCollectionFilteringProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const finalCollection = collection ?? collectionData;

  // Read URL hash on mount to set initial filter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        setActiveFilter(decodeURIComponent(hash));
      }
    }
  }, []);

  // Function to update URL hash and filter
  const handleFilterChange = (filterValue: string | null) => {
    setActiveFilter(filterValue);

    if (typeof window !== 'undefined') {
      if (filterValue) {
        window.location.hash = encodeURIComponent(filterValue);
      } else {
        // Remove hash when showing all posts
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  // Extract category names from Collection tags with group "Post"
  const postTagCategories =
    finalCollection?.contentfulMetadata?.tags
      ?.filter(
        (tag) =>
          tag.name.toLowerCase().startsWith('post:') || tag.name.toLowerCase().includes('post')
      )
      ?.map((tag) => tag.name.replace(/^post:/i, '').trim()) ?? [];

  // Filter posts by search query and active filter
  const filteredPosts = posts.filter((post) => {
    // Search filter: check if title contains search query
    const matchesSearch =
      !searchQuery || post.title?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter: check if post has matching category
    const matchesCategory =
      !activeFilter ||
      post.categories?.some((category) => category.toLowerCase() === activeFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination for posts
  const itemsPerPage = finalCollection?.itemsPerPage ?? 6; // Default to 6 if not set
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Calculate pagination for pages
  const totalPagesForPages = Math.ceil(pages.length / itemsPerPage);
  const startIndexForPages = (currentPage - 1) * itemsPerPage;
  const endIndexForPages = startIndexForPages + itemsPerPage;
  const currentPages = pages.slice(startIndexForPages, endIndexForPages);

  return {
    currentPage,
    setCurrentPage,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    postTagCategories,
    filteredPosts,
    currentPosts,
    totalPages,
    itemsPerPage,
    currentPages,
    totalPagesForPages
  };
}
