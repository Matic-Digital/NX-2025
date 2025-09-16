'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import AirImage from '@/components/media/AirImage';
import { getPostById } from '@/components/Post/PostApi';
import type { PostSchema } from '@/components/Post/PostSchema';
import Link from 'next/link';
import { categoryColorMap } from '@/components/Post/PostCategories';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

// Helper function to format date as "Month Day, Year"
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

interface PostCardProps {
  sys: {
    id: string;
  };
  variant?: string;
}

// TODO: need to use variant here to display row on
export function PostCard({ sys, variant }: PostCardProps) {
  const [postData, setPostData] = useState<PostSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const isRowVariant = variant === 'row';
  const isFeaturedVariant = variant === 'featured';

  useEffect(() => {
    async function fetchPostData() {
      try {
        setLoading(true);
        const data = await getPostById(sys.id);
        if (data) {
          setPostData(data);
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchPostData();
  }, [sys.id]);

  const post = useContentfulLiveUpdates(postData);
  const inspectorProps = useContentfulInspectorMode({ entryId: post?.sys?.id });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-lg">Post not found</div>
      </div>
    );
  }

  return (
    <Link
      href={`/post/${post.slug}`}
      {...inspectorProps({ fieldId: 'slug' })}
      className="group flex h-full flex-col"
    >
      <Box
        direction="col"
        gap={0}
        className={cn(
          // Mobile: always column layout, Large: row layout only for row variant
          'h-full flex-col',
          isRowVariant && '',
          isFeaturedVariant && 'h-full'
        )}
      >
        <AirImage
          link={post.mainImage?.link}
          altText={post.mainImage?.altText}
          className={cn(
            // Mobile: consistent height for all cards, Large: different heights for variants
            'min-h-[16rem] w-full object-cover',
            isRowVariant && '2xl:max-h-64',
            isFeaturedVariant && 'lg:min-h-[24rem] xl:min-h-[32rem]'
          )}
        />
        <Box direction="col" gap={0} className={cn('bg-subtle h-full justify-between')}>
          <Box
            direction="col"
            gap={0}
            className={cn(
              // Mobile: consistent padding for all cards, Large: different padding for variants
              'gap-[0.75rem] p-[1.5rem]',
              isRowVariant && '2xl:gap-[0.25rem] 2xl:p-[1rem]',
              isFeaturedVariant && 'lg:gap-[1rem] lg:p-[2rem]'
            )}
          >
            <p className="text-body-xs uppercase" {...inspectorProps({ fieldId: 'categories' })}>
              {post.categories.map((category, index) => (
                <span key={index}>
                  <span className={categoryColorMap(category) + ' group-hover:text-primary'}>
                    {category}
                  </span>
                  {index < post.categories.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <h2
              className={cn(
                // Mobile: consistent sizing for all cards, Large: different sizes for variants
                'text-headline-xs group-hover:text-primary leading-[120%]',
                isFeaturedVariant && 'lg:text-headline-lg xl:text-headline-xl',
                isRowVariant && '2xl:text-headline-xs 2xl:leading-[110%]'
              )}
              {...inspectorProps({ fieldId: 'title' })}
            >
              {post.title}
            </h2>
          </Box>
          <Box
            direction="row"
            gap={2}
            className={cn(
              // Mobile: consistent padding, Large: different padding for variants
              'items-center justify-between pl-[1.5rem]',
              isRowVariant && '2xl:pl-[1rem]'
            )}
          >
            <p
              className="text-body-xs text-[#525252]"
              {...inspectorProps({ fieldId: 'datePublished' })}
            >
              {formatDate(post.datePublished)}
            </p>
            <Box
              direction="col"
              gap={0}
              className={cn(
                // Mobile: consistent padding, Large: different padding for variants
                'bg-background group-hover:bg-primary p-[1.25rem] group-hover:text-white',
                isRowVariant && '2xl:p-[1rem]'
              )}
            >
              <ArrowUpRight className="size-12 stroke-1 group-hover:stroke-white" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
