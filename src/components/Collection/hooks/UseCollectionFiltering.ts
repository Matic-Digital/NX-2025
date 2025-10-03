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
    
    console.log(`🔄 Sorting ${posts.length} posts by: ${sortOption}`);
    
    // Debug: Show first few posts' datePublished values (same as PostCard uses)
    console.log('📅 Sample datePublished values (same field as PostCard):');
    posts.slice(0, 3).forEach(post => {
      console.log(`  "${post.title}": datePublished = "${post.datePublished}"`);
      if (post.datePublished) {
        const parsed = new Date(post.datePublished);
        console.log(`    → ${parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (timestamp: ${parsed.getTime()})`);
      }
    });
    
    switch (sortOption) {
      case 'newest':
        return sortedPosts.sort((a, b) => {
          // Handle missing dates - put posts without dates at the end
          if (!a.datePublished && !b.datePublished) return 0;
          if (!a.datePublished) return 1; // a goes to end
          if (!b.datePublished) return -1; // b goes to end
          
          const dateA = new Date(a.datePublished);
          const dateB = new Date(b.datePublished);
          
          // Handle invalid dates - put invalid dates at the end
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          const result = dateB.getTime() - dateA.getTime(); // Newest first
          console.log(`  Newest: "${a.title}" (${a.datePublished} → ${dateA.toISOString()}) vs "${b.title}" (${b.datePublished} → ${dateB.toISOString()}) = ${result}`);
          return result;
        });
      case 'oldest':
        return sortedPosts.sort((a, b) => {
          // Handle missing dates - put posts without dates at the end
          if (!a.datePublished && !b.datePublished) return 0;
          if (!a.datePublished) return 1; // a goes to end
          if (!b.datePublished) return -1; // b goes to end
          
          const dateA = new Date(a.datePublished);
          const dateB = new Date(b.datePublished);
          
          // Handle invalid dates - put invalid dates at the end
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          const result = dateA.getTime() - dateB.getTime(); // Oldest first
          console.log(`  Oldest: "${a.title}" (${a.datePublished} → ${dateA.toISOString()}) vs "${b.title}" (${b.datePublished} → ${dateB.toISOString()}) = ${result}`);
          return result;
        });
      case 'title-asc':
        console.log('  Sorting by title A-Z');
        return sortedPosts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc':
        console.log('  Sorting by title Z-A');
        return sortedPosts.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      default:
        console.log('  No sorting applied');
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
    // First apply global filter: only show posts whose categories match Collection's Contentful tag names
    let postsToFilter = posts;
    
    // Debug logging
    console.log('🔍 Collection filtering debug:');
    console.log('- Total posts:', posts.length);
    console.log('- Collection:', finalCollection?.title);
    console.log('- Collection tags:', finalCollection?.contentfulMetadata?.tags);
    
    // Extract category names from Collection's Contentful tags and remove "post: " prefix
    const collectionTagNames = finalCollection?.contentfulMetadata?.tags
      ?.map(tag => tag.name.toLowerCase().replace(/^post:\s*/, '')) ?? [];
    console.log('- Collection tag names (lowercase, cleaned):', collectionTagNames);
    
    if (collectionTagNames.length > 0) {
      console.log('- Applying tag-based filtering...');
      postsToFilter = posts.filter((post) => {
        // Check if post has any categories that match the collection's tag names
        const postCategories = post.categories?.map(category => category.toLowerCase()) ?? [];
        const hasMatch = postCategories.some(category => collectionTagNames.includes(category));
        
        if (hasMatch) {
          console.log(`  ✅ "${post.title}" matches - categories:`, post.categories, 'matches:', postCategories.filter(cat => collectionTagNames.includes(cat)));
        } else {
          console.log(`  ❌ "${post.title}" no match - categories:`, post.categories);
        }
        
        return hasMatch;
      });
      console.log('- Posts after tag filtering:', postsToFilter.length);
    } else {
      console.log('- No collection tags found, showing all posts');
    }
    
    // Then apply search and category filters
    const filtered = postsToFilter.filter((post) => {
      // Search filter: check if title contains search query
      const matchesSearch =
        !searchQuery || post.title?.toLowerCase().includes(searchQuery.toLowerCase());
      // Category filter: check if post has matching category
      const matchesCategory =
        !activeFilter ||
        post.categories?.some((category) => category.toLowerCase() === activeFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    console.log('Final filtered posts:', filtered.length);
    console.log('Active sort option:', activeSortOption);
    
    // Then sort the filtered posts
    const sortedResult = sortPosts(filtered, activeSortOption);
    console.log('Posts after sorting:', sortedResult.length);
    console.log('First 3 post titles after sorting:', sortedResult.slice(0, 3).map(p => `${p.title} (${p.datePublished})`));
    
    return sortedResult;
  })();

  // Keep the old name for backward compatibility
  const filteredPosts = filteredAndSortedPosts;
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
