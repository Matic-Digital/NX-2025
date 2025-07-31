import { notFound } from 'next/navigation';
import { ContentfulRichText } from '@/components/global/ContentfulRichText';
import { getPostBySlug } from '@/lib/contentful-api/post';
import { Box, Container } from '@/components/global/matic-ds';
import type { Metadata } from 'next';
import AirImage from '@/components/media/AirImage';

// Define the params type for generateMetadata and page (Next.js 15+)
interface PostPageParams {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata based on the post
export async function generateMetadata({ params }: PostPageParams): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.'
    };
  }

  // Create SEO metadata from post data
  return {
    title: post.seoTitle ?? post.title ?? 'Post',
    description: post.seoDescription ?? post.excerpt ?? 'Post description',
    keywords: post.seoFocusKeyword ?? undefined,
    openGraph: post.openGraphImage
      ? {
          images: [
            {
              url: post.openGraphImage.link ?? undefined,
              alt: post.openGraphImage.altText ?? post.title
            }
          ]
        }
      : undefined
  };
}

// Post detail page component
export default async function PostPage({ params }: PostPageParams) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Handle case where post is not found
  if (!post) {
    notFound();
  }

  return (
    <Container>
      <AirImage
        link={post.mainImage?.link}
        altText={post.mainImage?.altText}
        className="min-h-[11.8rem] w-full object-cover"
      />
      <Box direction="col" gap={0}>
        <h1 className="text-headline-xs text-black">Title: {post.title}</h1>
        <p>Slug: {post.slug}</p>
        <p>Excerpt: {post.excerpt}</p>
        <p>Categories: {post.categories.join(', ')}</p>
        <p>Tags: {post.tags?.join(', ')}</p>
        <p>Published Date: {post.datePublished}</p>
        <ContentfulRichText content={post.content} />
        <p>SEO Title: {post.seoTitle}</p>
        <p>SEO Description: {post.seoDescription}</p>
        <p>SEO Focus Keyword: {post.seoFocusKeyword}</p>
      </Box>
    </Container>
  );
}
