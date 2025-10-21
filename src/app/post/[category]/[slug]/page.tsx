import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import { getPostBySlug, getAllPostsMinimal } from '@/components/Post/PostApi';
import { PostDetail } from '@/components/Post/PostDetail';

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
        const primaryCategory = post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';
        
        return {
          category: primaryCategory,
          slug: post.slug,
        };
      });
      
      allParams.push(...localeParams);
    } catch (error) {
      console.error(`Error generating params for locale ${locale}:`, error);
    }
  }
  
  return allParams;
}

export async function generateMetadata({ params, searchParams }: PostPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const post = await getPostBySlug(resolvedParams.slug, false, resolvedSearchParams.locale);
  
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

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { isEnabled } = await draftMode();
  
  console.log(`🔍 PostPage: Loading post with slug "${resolvedParams.slug}" and locale "${resolvedSearchParams.locale ?? 'auto-detect'}"`);
  
  const post = await getPostBySlug(resolvedParams.slug, isEnabled, resolvedSearchParams.locale);

  if (!post) {
    console.log(`❌ Post not found for slug: ${resolvedParams.slug} in locale: ${resolvedSearchParams.locale ?? 'auto-detect'}`);
    notFound();
  }
  
  console.log(`✅ Post loaded successfully: ${post.title}`);

  // Verify the category matches (optional validation)
  const primaryCategory = post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';
  if (primaryCategory !== resolvedParams.category) {
    // Optionally redirect to correct URL or just continue
    // For now, we'll just continue to show the post
  }

  return <PostDetail post={post} />;
}
