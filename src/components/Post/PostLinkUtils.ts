/**
 * Post Link Utilities
 * 
 * Helper functions for handling Post navigation and external links
 */

import type { Post } from './PostSchema';

/**
 * Determines if a post should open externally
 */
export function shouldOpenExternally(post: Post): boolean {
  return Boolean(post.externalLink && post.externalLink.trim() !== '');
}

/**
 * Gets the appropriate href for a post (internal or external)
 */
export function getPostHref(post: Post): string {
  if (shouldOpenExternally(post) && post.externalLink) {
    return post.externalLink;
  }
  
  // Default internal link
  const category = post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized';
  return `/post/${category}/${post.slug}`;
}

/**
 * Gets the appropriate target for a post link
 */
export function getPostTarget(post: Post): '_blank' | '_self' {
  return shouldOpenExternally(post) ? '_blank' : '_self';
}

/**
 * Gets the appropriate rel attribute for external links
 */
export function getPostRel(post: Post): string | undefined {
  return shouldOpenExternally(post) ? 'noopener noreferrer' : undefined;
}

/**
 * Props for creating a proper post link
 */
export interface PostLinkProps {
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
}

/**
 * Gets all the props needed for a post link
 */
export function getPostLinkProps(post: Post): PostLinkProps {
  return {
    href: getPostHref(post),
    target: getPostTarget(post),
    rel: getPostRel(post)
  };
}
