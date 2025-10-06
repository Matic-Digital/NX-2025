import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import { getPostBySlug, getAllPostsMinimal } from '@/components/Post/PostApi';
import { PostDetail } from '@/components/Post/PostDetail';

interface PostPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const postsResponse = await getAllPostsMinimal();
  
  return postsResponse.items.map((post) => {
    // Get the first category as the primary category for the URL
    const primaryCategory = post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';
    
    return {
      category: primaryCategory,
      slug: post.slug,
    };
  });
}

export async function generateMetadata({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    keywords: post.seoFocusKeyword,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images: post.openGraphImage?.link ? [post.openGraphImage.link] : undefined,
      type: 'article',
      publishedTime: post.datePublished,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images: post.openGraphImage?.link ? [post.openGraphImage.link] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const { isEnabled } = await draftMode();
  const post = await getPostBySlug(resolvedParams.slug, isEnabled);

  if (!post) {
    notFound();
  }

  // Verify the category matches (optional validation)
  const primaryCategory = post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';
  if (primaryCategory !== resolvedParams.category) {
    // Optionally redirect to correct URL or just continue
    // For now, we'll just continue to show the post
  }

  return <PostDetail post={post} />;
}
