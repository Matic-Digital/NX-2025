import { useEffect, useState } from 'react';

// Import removed - using API route instead

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Post as PostType } from '@/components/Post/PostSchema';

interface UsePostsDataProps {
  collection: Collection | null;
  collectionData?: Collection;
}

export function usePostsData({ collection, collectionData }: UsePostsDataProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const finalCollection = collection ?? collectionData;
  
  // Check if we have server-enriched collection data
  const hasServerData = finalCollection && Object.keys(finalCollection).length > 3;
  
  // Check if we have server-enriched posts (from Collection API)
  const hasServerEnrichedPosts = finalCollection && 'enrichedPosts' in finalCollection && Array.isArray((finalCollection as any).enrichedPosts);

  // Use server-enriched posts or fetch client-side as fallback
  useEffect(() => {
    if (!hasServerData) {
      console.warn('Collection missing server-side data - showing skeleton. Collection ID:', finalCollection?.sys?.id);
      setIsLoading(false);
      return;
    }

    if (finalCollection?.contentType?.includes('Post')) {
      // Use server-enriched posts if available (preferred)
      if (hasServerEnrichedPosts) {
        setPosts((finalCollection as any).enrichedPosts);
        setIsLoading(false);
        return;
      }

      // Fallback to client-side API call if no server-enriched posts
      const fetchPosts = async () => {
        try {
          setIsLoading(true);
          // Use API route to get server-side enriched Posts
          const response = await fetch('/api/components/Post/all');
          if (response.ok) {
            const data = await response.json();
            setPosts(data.posts?.items ?? []);
          } else {
            throw new Error('Failed to fetch posts from API');
          }
        } catch (error) {
          console.warn('Collection: Error fetching posts:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchPosts();
    } else {
      setIsLoading(false);
    }
  }, [finalCollection, hasServerData, hasServerEnrichedPosts]);

  return {
    posts,
    isLoading,
    setPosts
  };
}
