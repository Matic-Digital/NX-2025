'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getAllPostsMinimal } from '@/lib/contentful-api/post';
import { getAllPagesMinimal } from '@/lib/contentful-api/page';
import { getCollectionById } from '@/lib/contentful-api/collection';
import type { Collection } from '@/types/contentful/Collection';
import type { Post } from '@/types/contentful/Post';
import type { Page } from '@/types/contentful/Page';
import { PostCard } from '@/components/global/PostCard';
import { PageCard } from '@/components/global/PageCard';

interface CollectionProps {
  collectionData?: Collection;
  sys?: {
    id: string;
  };
  __typename?: string;
}

export default function Collection({ collectionData, sys, __typename }: CollectionProps) {
  const [collection, setCollection] = useState<Collection | null>(collectionData ?? null);
  const [isLoading, setIsLoading] = useState(!collectionData && !!sys?.id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Contentful Live Preview integration
  const updatedCollection = useContentfulLiveUpdates(collection);
  const inspectorProps = useContentfulInspectorMode({
    entryId: collection?.sys?.id
  });

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

  // Fetch collection data if not provided but sys.id is available
  useEffect(() => {
    if (!collectionData && sys?.id) {
      const fetchCollection = async () => {
        try {
          setIsLoading(true);
          const fetchedCollection = await getCollectionById(sys.id);
          setCollection(fetchedCollection);
        } catch (error) {
          console.error('Error fetching collection:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchCollection();
    }
  }, [collectionData, sys?.id]);

  // Fetch posts when collection content type is "Post"
  useEffect(() => {
    const finalCollection = collection ?? collectionData;
    if (finalCollection?.contentType?.includes('Post')) {
      const fetchPosts = async () => {
        try {
          setLoadingPosts(true);
          const postsResponse = await getAllPostsMinimal();
          setPosts(postsResponse.items ?? []);
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setLoadingPosts(false);
        }
      };

      void fetchPosts();
    }
  }, [collection, collectionData]);

  // Fetch pages when collection content type is "Page"
  useEffect(() => {
    const finalCollection = collection ?? collectionData;
    if (finalCollection?.contentType?.includes('Page')) {
      const fetchPages = async () => {
        try {
          setLoadingPages(true);
          const pagesResponse = await getAllPagesMinimal();
          setPages(pagesResponse.items ?? []);
        } catch (error) {
          console.error('Error fetching pages:', error);
        } finally {
          setLoadingPages(false);
        }
      };

      void fetchPages();
    }
  }, [collection, collectionData]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const finalCollection = updatedCollection ?? collection;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!finalCollection) {
    return null;
  }

  // If Collection content type includes "Post", render PostCards
  if (finalCollection?.contentType?.includes('Post')) {
    if (loadingPosts) {
      return <div>Loading posts...</div>;
    }

    if (posts.length === 0) {
      return <div>No posts found</div>;
    }

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

    // Calculate pagination
    const itemsPerPage = finalCollection.itemsPerPage ?? 6; // Default to 6 if not set
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    return (
      <div {...inspectorProps}>
        {/* Search bar - only show if searchBar is enabled */}
        {finalCollection.searchBar && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
            />
          </div>
        )}

        {/* Display clickable tag filters above the list */}
        {postTagCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {/* "All" button */}
              <button
                onClick={() => handleFilterChange(null)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activeFilter === null
                    ? 'bg-primary border-primary text-white'
                    : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                }`}
              >
                All
              </button>

              {/* Category filter buttons */}
              {postTagCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    activeFilter === category
                      ? 'bg-primary border-primary text-white'
                      : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentPosts.map((post) => (
            <div key={post.sys.id} className="flex">
              <PostCard sys={post.sys} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  // If Collection content type includes "Page", render PageCards
  if (finalCollection?.contentType?.includes('Page')) {
    if (loadingPages) {
      return <div>Loading pages...</div>;
    }

    if (pages.length === 0) {
      return <div>No pages found</div>;
    }

    // Calculate pagination
    const itemsPerPage = finalCollection.itemsPerPage ?? 6; // Default to 6 if not set
    const totalPages = Math.ceil(pages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPages = pages.slice(startIndex, endIndex);

    return (
      <div {...inspectorProps}>
        <div className="mb-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentPages.map((page) => (
            <div key={page.sys.id} className="flex">
              <PageCard {...page} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  // For Collections that don't match Post or Page, return null or minimal display
  return null;
}
