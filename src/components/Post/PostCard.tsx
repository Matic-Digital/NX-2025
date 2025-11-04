'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { getPostById } from '@/components/Post/PostApi';
import { PostCardSkeleton } from '@/components/Post/PostCardSkeleton';
import { getPostLinkProps, shouldOpenExternally } from '@/components/Post/PostLinkUtils';

import type { Post } from '@/components/Post/PostSchema';

interface PostCardProps {
  sys: {
    id: string;
  };
  variant?: 'row' | 'featured' | 'default';
}

// Props for when we have full Post data (server-side enriched)
interface PostCardWithDataProps {
  variant?: 'row' | 'featured' | 'default';
}

type PostCardAllProps = (PostCardProps | (Post & PostCardWithDataProps));

// TODO: need to use variant here to display row on
export function PostCard(props: PostCardAllProps) {
  // Check if we have full post data (server-side enriched) or just reference (client-side)
  const hasFullData = 'title' in props && 'slug' in props;
  const [postData] = useState<Post | null>(hasFullData ? (props as Post) : null);
  const [loading, setLoading] = useState(!hasFullData);
  
  const variant = 'variant' in props ? props.variant : 'default';
  const isRowVariant = variant === 'row';
  const isFeaturedVariant = variant === 'featured';

  useEffect(() => {
    // Show skeleton immediately for minimal data, then wait for server-side enrichment
    if (hasFullData) {
      setLoading(false); // Have full data, stop loading
      return;
    }

    // If we have sys.id, show skeleton while waiting for server-side enrichment
    const sys = 'sys' in props ? props.sys : null;
    if (sys?.id) {
      setLoading(true); // Show skeleton for better UX
    } else {
      setLoading(false); // No ID, show error state
    }
  }, [hasFullData, props]);

  const post = useContentfulLiveUpdates(postData);
  const inspectorProps = useContentfulInspectorMode({ entryId: post?.sys?.id });

  if (loading) {
    return <PostCardSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex h-full items-center justify-center p-4 bg-red-50 border border-red-200">
        <div className="text-center">
          <div className="text-lg text-red-600">Post not found</div>
          <div className="text-sm text-red-500 mt-1">
            hasFullData: {hasFullData.toString()}<br/>
            propsKeys: {Object.keys(props).join(', ')}<br/>
            postData: {postData ? 'exists' : 'null'}
          </div>
        </div>
      </div>
    );
  }

  const linkProps = getPostLinkProps(post);
  const isExternal = shouldOpenExternally(post);

  return (
    <Link
      href={linkProps.href}
      target={linkProps.target}
      rel={linkProps.rel}
      {...inspectorProps({ fieldId: isExternal ? 'externalLink' : 'slug' })}
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
                  <span className="text-[#525252] group-hover:text-primary">{category}</span>
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
