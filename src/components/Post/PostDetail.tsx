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
import { HubspotForm } from '@/components/Forms/HubspotForm/HubspotForm';

import type { Post } from '@/components/Post/PostSchema';
import { ImageBetweenWrapper } from '@/components/ImageBetween/ImageBetweenWrapper';
import { Article, Box, Container, Text } from '@/components/global/matic-ds';
import Link from 'next/link';

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

  // Helper function to determine breadcrumb routing
  const getBreadcrumbInfo = (category: string) => {
    const isNewsCategory = category === 'In the News' || category === 'Press Release';
    const baseRoute = isNewsCategory ? '/newsroom' : '/resources';
    
    // Use category name as-is for hash (spaces will be URL-encoded as %20)
    const categoryHash = category;
    
    return {
      parentRoute: baseRoute,
      parentLabel: isNewsCategory ? 'Newsroom' : 'Resources',
      categoryRoute: `${baseRoute}#${categoryHash}`
    };
  };

  // Handle different templates
  if (displayPost.template === 'Gated Content') {
    return (
      <PageLayout 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        header={displayPost.pageLayout?.header ?? undefined} 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        footer={displayPost.pageLayout?.footer ?? undefined}
      >
        {/* Banner Section with Title */}
        <div className='h-[28.64rem] flex flex-col mb-[3rem] relative overflow-hidden'>
          {/* Background Image */}
          {displayPost.bannerBackground?.link ? (
            <AirImage 
              link={displayPost.bannerBackground.link} 
              altText={displayPost.bannerBackground.altText ?? displayPost.bannerBackground.title ?? 'Post banner'} 
              className="w-full h-full absolute inset-0 z-0 object-cover"
            />
          ) : (
            <div className="w-full h-full absolute inset-0 z-0 bg-blue-500" />
          )}
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 z-10 bg-black/30" />
          
          {/* Title Content */}
          <Container className='flex-grow flex flex-col pb-[3rem] relative z-20'>
            <div className='flex-grow flex flex-col justify-end'>
              <h1 className='text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg' {...inspectorProps({ fieldId: 'title' })}>
                {displayPost.title}
              </h1>
            </div>
          </Container>
        </div>

        <Container>
          <Box direction="col" gap={8} className="w-full">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[2.5rem]">
              {/* Left Column - Rich Content */}
              <div>
                <div 
                  {...inspectorProps({ fieldId: 'content' })} 
                  className="w-full max-w-full"
                  style={{ 
                    width: '100%', 
                    maxWidth: '100%', 
                    minWidth: 0,
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <Article className="w-full max-w-full overflow-hidden">
                    <RichTextRenderer content={displayPost.content} />
                  </Article>
                </div>
              </div>

              {/* Right Column - Gated Content Form */}
              {displayPost.gatedContentForm && (
                <div className="w-full pb-[7.5rem]">
                  {displayPost.testimonial && (
                    <Box direction="col" gap={8} className="w-full mb-8 bg-[#f6f6f6] p-[2rem]" {...inspectorProps({ fieldId: 'testimonial' })}>
                      <blockquote className="text-[#525252]">
                        &ldquo;{displayPost.testimonial.quote}&rdquo;
                      </blockquote>
                      <div className="flex flex-col">
                        <p className="text-[1rem] text-black font-normal leading-[120%] tracking-[0.02rem]">{displayPost.testimonial.authorName}</p>
                        <p className="text-[1rem] text-black font-normal leading-[120%] tracking-[0.02rem]">{displayPost.testimonial.authorTitle}</p>
                      </div>
                    </Box>
                  )}
                  
                  {/* Main Image */}
                  {displayPost.mainImage?.link && (
                    <div className="w-full mb-8" {...inspectorProps({ fieldId: 'mainImage' })}>
                      <AirImage 
                        link={displayPost.mainImage.link} 
                        altText={displayPost.mainImage.altText ?? displayPost.mainImage.title ?? 'Post image'} 
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  <div className="w-full" {...inspectorProps({ fieldId: 'gatedContentForm' })}>
                    <HubspotForm 
                      hubspotForm={displayPost.gatedContentForm}
                      theme="light"
                      hideHeader={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </Box>
        </Container>
      </PageLayout>
    );
  }

  // Default template
  return (
    <PageLayout 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      header={displayPost.pageLayout?.header ?? undefined} 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      footer={displayPost.pageLayout?.footer ?? undefined}
    >
      <ImageBetweenWrapper
        backgroundImage={displayPost.bannerBackground ? {
          link: displayPost.bannerBackground.link,
          altText: displayPost.bannerBackground.altText ?? ''
        } : undefined}
        contentTop={
          <Container className="h-full">
            <Box direction="col" className="h-full">
              {displayPost.categories && displayPost.categories.length > 0 && displayPost.categories[0] && (
                <div className={`flex items-center gap-2 mb-4 ${displayPost.bannerBackground ? 'text-white' : 'text-gray-600'}`}>
                  <Link 
                    href={getBreadcrumbInfo(displayPost.categories[0]).parentRoute}
                    className={`hover:underline transition-colors ${displayPost.bannerBackground ? 'hover:text-gray-200' : 'hover:text-gray-800'}`}
                  >
                    {getBreadcrumbInfo(displayPost.categories[0]).parentLabel}
                  </Link>
                  <span>/</span>
                  <Link 
                    href={getBreadcrumbInfo(displayPost.categories[0]).categoryRoute}
                    className={`hover:underline transition-colors ${displayPost.bannerBackground ? 'hover:text-gray-200' : 'hover:text-gray-800'}`}
                  >
                    {displayPost.categories[0]}
                  </Link>
                </div>
              )}
              <h1 className={`text-display-sm md:text-display-md leading-none ${displayPost.bannerBackground ? 'text-white' : ''}`}>{displayPost.title}</h1>
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
              <Box direction="row" className="gap-[0.75rem] mb-8">
                {displayPost.categories.map((category, index) => (
                  <Text className="uppercase px-[0.75rem] py-[0.5rem] bg-subtle w-fit" key={index}>{category}</Text>
                ))}
              </Box>
            </div>
          )
        }
        contentBottom={
          <Container>
            <Article 
              className="w-full max-w-full overflow-hidden"
            >
              <div 
                {...inspectorProps({ fieldId: 'content' })} 
                className="w-full max-w-full"
                style={{ 
                  width: '100%', 
                  maxWidth: '100%', 
                  minWidth: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
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
