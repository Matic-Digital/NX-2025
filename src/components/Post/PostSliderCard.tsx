'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { getPostById } from '@/components/Post/PostApi';
import { categoryColorMap } from '@/components/Post/PostCategories';

import type { Post, PostSliderItem } from '@/components/Post/PostSchema';

interface ContentOverlay {
  children: React.ReactNode;
}

const ContentOverlay = ({ children }: ContentOverlay) => (
  <div className="absolute right-0 bottom-0 left-0 md:relative md:h-full">
    <div
      className="flex w-full flex-col justify-end rounded-[2px] p-10 backdrop-blur-[14px] md:h-full md:max-w-[393px]"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  </div>
);

interface PostSliderCardProps {
  item: PostSliderItem;
  index: number;
  current: number;
  context?: 'ImageBetween' | 'ContentGrid' | 'default';
}

export function PostSliderCard({ item, index, current, context = 'default' }: PostSliderCardProps) {
  const [postData, setPostData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPostData() {
      try {
        setLoading(true);
        const data = await getPostById(item.sys.id);
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
  }, [item.sys.id]);

  const post = useContentfulLiveUpdates(postData);
  const inspectorProps = useContentfulInspectorMode({ entryId: post?.sys?.id });

  const baseCardClasses = cn(
    'text-primary-foreground relative h-[669px] transition-all duration-500',
    {
      'opacity-80': index !== current - 1
    }
  );

  // Guard clause: return fallback if loading or no post data
  if (loading) {
    return (
      <div className={baseCardClasses}>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={baseCardClasses}>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg">Post not found</div>
        </div>
      </div>
    );
  }

  // ImageBetween variant - styled exactly like PostCard but with slider width
  if (context === 'ImageBetween') {
    return (
      <Link
        href={`/post/${post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized'}/${post.slug}`}
        {...inspectorProps({ fieldId: 'slug' })}
        className="group flex h-[35rem] mt-26 flex-col"
      >
        <Box
          direction="col"
          gap={0}
          className="h-full flex-col"
        >
          <AirImage
            link={post.mainImage?.link}
            altText={post.mainImage?.altText}
            className="min-h-[16rem] lg:flex-1 lg:min-h-0 w-full object-cover"
          />
          <Box direction="col" gap={0} className="bg-subtle lg:flex-shrink-0 h-full lg:h-auto justify-between">
            <Box
              direction="col"
              gap={0}
              className="gap-[0.75rem] p-[1.5rem]"
            >
              <p className="text-body-xs uppercase" {...inspectorProps({ fieldId: 'categories' })}>
                {post.categories?.map((category, index) => (
                  <span key={index}>
                    <span className="text-[#525252] group-hover:text-primary">
                      {category}
                    </span>
                    {index < (post.categories?.length ?? 0) - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
              <h2
                className="text-headline-xs group-hover:text-primary leading-[120%]"
                {...inspectorProps({ fieldId: 'title' })}
              >
                {post.title}
              </h2>
            </Box>
            <Box
              direction="row"
              gap={2}
              className="items-center justify-between pl-[1.5rem]"
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
                className="bg-background group-hover:bg-primary p-[1.25rem] group-hover:text-white"
              >
                <ArrowUpRight className="size-12 stroke-1 group-hover:stroke-white" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Link>
    );
  }

  // Default variant (original design for ContentGrid and other contexts)
  return (
    <div className={baseCardClasses}>
      <AirImage
        link={post.mainImage?.link}
        altText={post.mainImage?.altText}
        className="absolute h-full w-full object-cover"
      />
      <ContentOverlay>
        <Box direction="col" gap={5}>
          <Box direction="col" gap={1.5}>
            {post.categories && (
              <p
                className="text-body-sm text-white uppercase"
                {...inspectorProps({ fieldId: 'categories' })}
              >
                {post.categories.map((category, index) => (
                  <span key={index}>
                    <span className="text-white group-hover:text-primary">
                      {category}
                    </span>
                    {index < (post.categories?.length ?? 0) - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}
            <h2
              className="text-headline-sm leading-tight text-white"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {post.title}
            </h2>
          </Box>
          {post.excerpt && (
            <p
              className="text-body-xs letter-spacing-[0.14px] leading-normal text-white"
              {...inspectorProps({ fieldId: 'excerpt' })}
            >
              {post.excerpt}
            </p>
          )}

          <Link href={`/post/${post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized'}/${post.slug}`} className="">
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Read More
            </Button>
          </Link>
        </Box>
      </ContentOverlay>
    </div>
  );
}
