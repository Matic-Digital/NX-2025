'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import AirImage from '@/components/media/AirImage';
import type { Post } from '@/types/contentful/Post';
import Link from 'next/link';

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

const categoryColorMap = (category: string) => {
  switch (category) {
    case 'Press Release':
      return 'text-[#6236FF]';
    case 'Blog':
      return 'text-[#BBDEFB]';
    case 'Case Study':
      return 'text-[#C8E6C9]';
    case 'Data Sheet':
      return 'text-[#D1C4E9]';
    case 'Featured':
      return 'text-[#FFF9C4]';
    case 'In The News':
      return 'text-[#1975FF]';
    case 'Resources':
      return 'text-[#FFE0B2]';
    case 'Shug Speaks':
      return 'text-[#F8BBD0]';
    case 'Video':
      return 'text-[#D7CCC8]';
    default:
      return 'text-gray-400';
  }
};

export function PostCard(props: Post) {
  const post = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: post?.sys?.id });

  console.log('post props', props);

  return (
    <Link
      href={`/resources/${post.slug}`}
      {...inspectorProps({ fieldId: 'slug' })}
      className="flex h-full group"
    >
      <Box direction="col" gap={0} className="">
        <AirImage
          link={post.mainImage?.link}
          altText={post.mainImage?.altText}
          className="min-h-[11.8rem] w-full object-cover"
        />
        <Box direction="col" gap={0} className="h-full justify-between bg-[#f6f6f6]">
          <Box direction="col" gap={0} className="gap-[0.5rem] p-[1.5rem]">
            <p className="text-body-xs uppercase" {...inspectorProps({ fieldId: 'categories' })}>
              {post.categories.map((category, index) => (
                <span key={index}>
                  <span className={categoryColorMap(category) + ' group-hover:text-primary'}>{category}</span>
                  {index < post.categories.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <h2
              className="text-headline-xs group-hover:text-primary leading-[120%]"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {' '}
              {post.title}
            </h2>
          </Box>
          <Box direction="row" gap={2} className="items-center justify-between pl-[1.5rem]">
            <p
              className="text-body-xs text-[#9A9A9A]"
              {...inspectorProps({ fieldId: 'datePublished' })}
            >
              {formatDate(post.datePublished)}
            </p>
            <Box direction="col" gap={0} className="bg-white p-[1.25rem]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="stroke-[#5B5B5B] group-hover:stroke-primary"
              >
                <g clipPath="url(#clip0_7391_79602)">
                  <path
                    d="M1 1H19M19 1V19M19 1L1 19"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_7391_79602">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </Box>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
