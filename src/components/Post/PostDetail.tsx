'use client';

import React, { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { AirImage } from '@/components/Image/AirImage';
import { getPostById, getRelatedPosts } from '@/components/Post/PostApi';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { RichTextRenderer } from '@/components/Post/components/RichTextRenderer';
import { PostCard } from '@/components/Post/PostCard';

import type { Post } from '@/components/Post/PostSchema';
import { ImageBetweenWrapper } from '@/components/ImageBetween/ImageBetweenWrapper';
import { Article, Box, Container, Text } from '@/components/global/matic-ds';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post: initialPost }: PostDetailProps) {
  const post = useContentfulLiveUpdates(initialPost);
  const inspectorProps = useContentfulInspectorMode({ entryId: post.sys.id });
  const [fullPostData, setFullPostData] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  // Fetch full post data on component mount (like ContentGridItem does)
  useEffect(() => {
    const fetchFullPostData = async () => {
      if (!post.sys?.id) {
        return;
      }

      try {
        const fullData = await getPostById(post.sys.id);
        if (fullData) {
          setFullPostData(fullData);
          
          // Fetch related posts if we have categories
          if (fullData.categories && fullData.categories.length > 0) {
            try {
              const related = await getRelatedPosts(fullData.categories, post.sys.id, 3);
              setRelatedPosts(related.items);
            } catch (error) {
              console.error('Error fetching related posts:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching full post data:', error);
      }
    };

    void fetchFullPostData();
  }, [post.sys.id]);

  // Use full post data if available, otherwise fall back to initial post
  const displayPost = fullPostData ?? post;

  const _formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PageLayout 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      header={displayPost.pageLayout?.header ?? undefined} 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      footer={displayPost.pageLayout?.footer ?? undefined}
    >
      <ImageBetweenWrapper
        contentTop={
        <Container className="h-full">
          <Box direction="col" className="h-full">
            <Text>Resources / {displayPost.categories[0]}</Text>
            <h1 className="text-display-sm md:text-display-md">{displayPost.title}</h1>
          </Box>
        </Container>
        }
        asset={
          displayPost.mainImage && (
            <div {...inspectorProps({ fieldId: 'mainImage' })} className="min-h-[33.75rem] gap-[1.5rem] flex flex-col">
              <AirImage
                link={displayPost.mainImage.link}
                altText={displayPost.mainImage.altText ?? displayPost.title}
                className="w-full flex-1 object-cover"
              />
              <Box direction="row" className="gap-[0.75rem]">
                {displayPost.categories.map((category, index) => (
                  <Text className="uppercase px-[0.75rem] py-[0.5rem] bg-subtle w-fit" key={index}>{category}</Text>
                ))}
              </Box>
            </div>
          )
        }
        contentBottom={
          <Container>
            <Article className="">
              <div {...inspectorProps({ fieldId: 'content' })}>
                <RichTextRenderer content={displayPost.content} />
              </div>
            </Article>
          </Container>
        }
      />
      {relatedPosts.length > 0 && (
        <Container>
          <Box direction="col" gap={8} className="mb-12">
            <h2 className="text-headline-lg">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.sys.id} sys={{ id: relatedPost.sys.id }} />
              ))}
            </div>
          </Box>
        </Container>
      )}
    </PageLayout>
  );
}
