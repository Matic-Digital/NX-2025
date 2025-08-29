'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getCollectionById } from '@/lib/contentful-api/collection';
import { getAllPostsMinimal } from '@/lib/contentful-api/post';
import { PostCard } from '@/components/global/PostCard';
import type { Collection } from '@/types/contentful/Collection';
import type { Post } from '@/types/contentful/Post';

interface CollectionProps {
  collectionData?: Collection;
  sys?: {
    id: string;
  };
  __typename?: string;
}

export default function Collection({ collectionData, sys, __typename }: CollectionProps) {
  console.log('Collection component rendered with:', { collectionData, sys });
  const [collection, setCollection] = useState<Collection | null>(collectionData ?? null);
  const [isLoading, setIsLoading] = useState(!collectionData && !!sys?.id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Contentful Live Preview integration
  const updatedCollection = useContentfulLiveUpdates(collection);
  const inspectorProps = useContentfulInspectorMode({
    entryId: collection?.sys?.id
  });

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

    // Calculate pagination
    const itemsPerPage = finalCollection.itemsPerPage ?? 6; // Default to 6 if not set
    const totalPages = Math.ceil(posts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    return (
      <div {...inspectorProps}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          {currentPosts.map((post) => (
            <div key={post.sys.id} className="flex">
              <PostCard {...post} />
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  // For non-Post Collections, return null or minimal display
  return null;
}
