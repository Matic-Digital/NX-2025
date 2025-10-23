import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { getPostSEOBySlug } from '@/lib/contentful-seo-api';
import {
  extractCanonicalUrl,
  extractIndexing,
  extractOpenGraphDescription,
  extractOpenGraphImage,
  extractOpenGraphTitle,
  extractSEODescription,
  extractSEOTitle
} from '@/lib/metadata-utils';
import { generateSchema } from '@/lib/schema-generator';

import { getAllPostsMinimal, getPostBySlug } from '@/components/Post/PostApi';
import { PostDetail } from '@/components/Post/PostDetail';
import { JsonLdSchema } from '@/components/Schema/JsonLdSchema';

import type { ContentfulPageSEO } from '@/lib/metadata-utils';

// Enable dynamic routing for localized slugs that might not be pre-generated
export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
  searchParams: Promise<{
    locale?: string;
  }>;
}

export async function generateStaticParams() {
  const locales = ['en-US', 'pt-BR', 'es']; // Add your available locales
  const allParams: { category: string; slug: string }[] = [];

  // Generate params for each locale
  for (const locale of locales) {
    try {
      // Fetch posts for this specific locale
      const postsResponse = await getAllPostsMinimal(false, locale);

      const localeParams = postsResponse.items.map((post) => {
        // Get the first category as the primary category for the URL
        const primaryCategory =
          post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';

        return {
          category: primaryCategory,
          slug: post.slug
        };
      });

      allParams.push(...localeParams);
    } catch {}
  }

  return allParams;
}

export async function generateMetadata({ params, searchParams }: PostPageProps) {
  const resolvedParams = await params;
  const _resolvedSearchParams = await searchParams;
  const postSEO = (await getPostSEOBySlug(resolvedParams.slug, false)) as
    | (ContentfulPageSEO & { title?: string; excerpt?: string })
    | null;

  if (!postSEO) {
    return {
      title: 'Post Not Found'
    };
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  const postUrl = `${baseUrl}/post/${resolvedParams.category}/${resolvedParams.slug}`;

  // Extract SEO data using utility functions
  const postData = postSEO as ContentfulPageSEO & { title?: string; excerpt?: string };
  const title = extractSEOTitle(postSEO, postData.title ?? 'Nextracker Blog Post');
  const description = extractSEODescription(postSEO, postData.excerpt ?? 'Nextracker Blog Post');
  const ogTitle = extractOpenGraphTitle(postSEO, title);
  const ogDescription = extractOpenGraphDescription(postSEO, description);
  const canonicalUrl = extractCanonicalUrl(postSEO);
  const shouldIndex = extractIndexing(postSEO, true);

  // Handle OG image from Post SEO data
  const openGraphImage = extractOpenGraphImage(postSEO, baseUrl, title);

  const ogImages = openGraphImage
    ? [
        {
          url: openGraphImage.url,
          width: openGraphImage.width,
          height: openGraphImage.height,
          alt: openGraphImage.title ?? ogTitle
        }
      ]
    : [];

  return {
    title,
    description,
    keywords: (postSEO as Record<string, unknown>).seoFocusKeyword as string, // Keep existing field if it exists
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex
      }
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
      type: 'article',
      publishedTime: (postSEO as Record<string, unknown>).datePublished as string,
      siteName: 'Nextracker',
      url: postUrl
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: openGraphImage ? [openGraphImage.url] : []
    },
    alternates: {
      canonical: canonicalUrl ?? postUrl
    }
  };
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { isEnabled } = await draftMode();

  const post = await getPostBySlug(resolvedParams.slug, isEnabled, resolvedSearchParams.locale);

  if (!post) {
    notFound();
  }

  // Verify the category matches (optional validation)
  const primaryCategory =
    post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';
  if (primaryCategory !== resolvedParams.category) {
    // Optionally redirect to correct URL or just continue
    // For now, we'll just continue to show the post
  }

  // Generate schema for the post
  const postPath = `/post/${resolvedParams.category}/${resolvedParams.slug}`;
  const postSchema = generateSchema('post', post, postPath);

  return (
    <>
      <JsonLdSchema schema={postSchema} id="post-schema" />
      <PostDetail post={post} />
    </>
  );
}
