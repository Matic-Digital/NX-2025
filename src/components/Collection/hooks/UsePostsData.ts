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

  // Fetch posts when collection content type is "Post"
  useEffect(() => {
    if (finalCollection?.contentType?.includes('Post')) {
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
        console.warn('Error in catch block:', error);
      } finally {
          setIsLoading(false);
        }
      };

      void fetchPosts();
    }
  }, [finalCollection]);

  return {
    posts,
    isLoading,
    setPosts
  };
}
