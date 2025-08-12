'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';
import { getContentById } from '@/lib/contentful-api/content';
import { AirImage } from '@/components/media/AirImage';
import type { Content } from '@/types/contentful/Content';
import type { PostSliderItem } from '@/types/contentful/Post';
import { Box, Container } from '@/components/global/matic-ds';
import { Button } from './ui/button';

interface ContentOverlayProps {
  children: React.ReactNode;
}

export function Content(props: Content) {
  const [content, setContent] = useState<Content>(props);
  const [loading, setLoading] = useState(false);
  const liveContent = useContentfulLiveUpdates(content);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveContent?.sys?.id });

  useEffect(() => {
    console.log('🎉 Content useEffect running with ID:', props.sys.id);

    const fetchContent = async () => {
      try {
        setLoading(true);
        console.log('🎉 Starting fetch for content ID:', props.sys.id);
        const data = await getContentById(props.sys.id);
        if (data?.item) {
          console.log('🎉 Data received, setting content to:', data.item);
          setContent(data.item);
        } else {
          console.error('No content data returned for ID:', props.sys.id);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        console.log('🎉 Content fetching complete for ID:', props.sys.id);
        setLoading(false);
      }
    };

    void fetchContent();
  }, [props.sys.id]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading content...</div>
      </div>
    );
  }

  // If no content, show a message
  if (!liveContent?.sys) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">No content found</div>
        <div className="mt-2 text-sm text-gray-500">
          {content
            ? `Content exists but liveContent is invalid: ${JSON.stringify(content).substring(0, 100)}...`
            : 'No content data'}
        </div>
      </div>
    );
  }

  if (liveContent && 'item' in liveContent && liveContent.item) {
    const item = liveContent.item;

    const ContentOverlay = ({ children }: ContentOverlayProps) => (
      <div
        className="flex h-full w-full max-w-[558px] p-10 backdrop-blur-[14px]"
        style={{
          background:
            'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
        }}
      >
        {children}
      </div>
    );

    // Post Content
    if ('__typename' in item && item.__typename === 'Post') {
      const postItem = item as unknown as PostSliderItem;

      return (
        <Container className="relative my-10 h-[502px] !p-0">
          <AirImage
            link={postItem.mainImage?.link}
            altText={postItem.mainImage?.altText}
            className="absolute h-full w-full object-cover"
          />
          <ContentOverlay>
            <Box
              direction="col"
              gap={12}
              className="w-full items-center justify-center text-center"
            >
              <Box direction="col" gap={5}>
                <Box direction="col" gap={1.5}>
                  {postItem.categories && (
                    <p
                      className="text-body-sm text-text-on-invert uppercase"
                      {...inspectorProps({ fieldId: 'categories' })}
                    >
                      {postItem.categories}
                    </p>
                  )}
                  <h2
                    className="text-headline-lg text-text-on-invert leading-tight"
                    {...inspectorProps({ fieldId: 'title' })}
                  >
                    {postItem.title}
                  </h2>
                </Box>
                {postItem.excerpt && (
                  <p
                    className="text-body-xs letter-spacing-[0.14px] text-text-on-invert leading-normal"
                    {...inspectorProps({ fieldId: 'excerpt' })}
                  >
                    {postItem.excerpt}
                  </p>
                )}
              </Box>

              <Button
                variant="white"
                {...inspectorProps({ fieldId: 'button' })}
                className="w-fit"
                asChild
              >
                <Link href={postItem.slug}>Explore More</Link>
              </Button>
            </Box>
          </ContentOverlay>
        </Container>
      );
    }
  }

  // Generic Content
  return (
    <article className="prose max-w-none">
      <h2 {...inspectorProps({ fieldId: 'title' })}>{liveContent.title}</h2>
      <p className="text-sm text-gray-500">Content type: {liveContent.__typename}</p>
    </article>
  );
}
