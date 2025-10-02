import { useEffect, useState } from 'react';

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { PageList } from '@/components/PageList/PageListSchema';
import type { Post as PostType } from '@/components/Post/PostSchema';
import type { Product } from '@/components/Product/ProductSchema';
import type { Service } from '@/components/Service/ServiceSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';

interface UseCollectionFilteringProps {
  posts: PostType[];
  pages: Page[];
  pageLists: PageList[];
  products: Product[];
  solutions: Solution[];
  services: Service[];
  collection: Collection | null;
  collectionData?: Collection;
}

export function useCollectionFiltering({
  posts,
  pages,
  pageLists,
  products,
  solutions,
  services,
  collection,
  collectionData
}: UseCollectionFilteringProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSortOption, setActiveSortOption] = useState<string>('newest');

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

  // Reset to page 1 when filter, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, activeSortOption]);

  // Sort options for posts
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' }
  ];

  // Function to sort posts
  const sortPosts = (posts: PostType[], sortOption: string): PostType[] => {
    const sortedPosts = [...posts];
    
    switch (sortOption) {
      case 'newest':
        return sortedPosts.sort((a, b) => {
          // Handle missing or invalid dates by treating them as very old dates
          const dateA = a.datePublished ? new Date(a.datePublished) : new Date(0);
          const dateB = b.datePublished ? new Date(b.datePublished) : new Date(0);
          
          // Check for invalid dates
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
          
          return timeB - timeA; // Newest first (larger timestamp first)
        });
      case 'oldest':
        return sortedPosts.sort((a, b) => {
          // Handle missing or invalid dates by treating them as very new dates for oldest-first sorting
          const dateA = a.datePublished ? new Date(a.datePublished) : new Date();
          const dateB = b.datePublished ? new Date(b.datePublished) : new Date();
          
          // Check for invalid dates
          const timeA = isNaN(dateA.getTime()) ? Date.now() : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? Date.now() : dateB.getTime();
          
          return timeA - timeB; // Oldest first (smaller timestamp first)
        });
      case 'title-asc':
        return sortedPosts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc':
        return sortedPosts.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      default:
        return sortedPosts;
    }
  };

  // Extract category names from Collection tags with group "Post"
  const postTagCategories =
    finalCollection?.contentfulMetadata?.tags
      ?.filter(
        (tag) =>
          tag.name.toLowerCase().startsWith('post:') || tag.name.toLowerCase().includes('post')
      )
      ?.map((tag) => tag.name.replace(/^post:/i, '').trim()) ?? [];

  // Filter and sort posts by search query, active filter, and sort option
  const filteredAndSortedPosts = (() => {
    // First filter posts
    const filtered = posts.filter((post) => {
      // Search filter: check if title contains search query
      const matchesSearch =
        !searchQuery || post.title?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter: check if post has matching category
      const matchesCategory =
        !activeFilter ||
        post.categories?.some((category) => category.toLowerCase() === activeFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    // Then sort the filtered posts
    return sortPosts(filtered, activeSortOption);
  })();

  // Keep the old name for backward compatibility
  const filteredPosts = filteredAndSortedPosts;

  // Calculate pagination for posts
  const itemsPerPage = finalCollection?.itemsPerPage ?? 6; // Default to 6 if not set
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Filter pages by search query
  const filteredPages = pages.filter((page) => {
    // Search filter: check if title or description contains search query
    const matchesSearch =
      !searchQuery || 
      page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Calculate pagination for pages
  const totalPagesForPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndexForPages = (currentPage - 1) * itemsPerPage;
  const endIndexForPages = startIndexForPages + itemsPerPage;
  const currentPages = filteredPages.slice(startIndexForPages, endIndexForPages);

  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery || 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Filter solutions by search query
  const filteredSolutions = solutions.filter((solution) => {
    const matchesSearch =
      !searchQuery || 
      solution.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Filter services by search query
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !searchQuery || 
      service.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Filter page lists by search query
  const filteredPageLists = pageLists.filter((pageList) => {
    const matchesSearch =
      !searchQuery || 
      pageList.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Combined content for unified pagination when search bar is enabled
  const allFilteredItems = [...filteredPosts, ...filteredPages, ...filteredPageLists, ...filteredProducts, ...filteredSolutions, ...filteredServices];
  
  // Shuffle items deterministically based on their IDs to mix all content types together
  // This ensures consistent ordering across renders while mixing content types
  const shuffledItems = [...allFilteredItems].sort((a, b) => {
    // Create a simple hash from the ID to ensure consistent but mixed ordering
    const hashA = a.sys.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hashB = b.sys.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hashA - hashB;
  });
  
  const totalUnifiedPages = Math.ceil(shuffledItems.length / itemsPerPage);
  const startIndexUnified = (currentPage - 1) * itemsPerPage;
  const endIndexUnified = startIndexUnified + itemsPerPage;
  const currentUnifiedItems = shuffledItems.slice(startIndexUnified, endIndexUnified);

  return {
    currentPage,
    setCurrentPage,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    activeSortOption,
    setActiveSortOption,
    sortOptions,
    handleFilterChange,
    postTagCategories,
    filteredPosts,
    currentPosts,
    totalPages,
    itemsPerPage,
    filteredPages,
    currentPages,
    totalPagesForPages,
    // New content types
    filteredProducts,
    filteredSolutions,
    filteredServices,
    filteredPageLists,
    // Unified pagination for mixed content
    allFilteredItems,
    currentUnifiedItems,
    totalUnifiedPages
  };
}
