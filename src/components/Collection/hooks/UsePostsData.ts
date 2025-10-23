import { useEffect, useState } from 'react';

import { getAllPostsMinimal } from '@/components/Post/PostApi';

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
          const postsResponse = await getAllPostsMinimal();
          setPosts(postsResponse.items ?? []);
        } catch {
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
