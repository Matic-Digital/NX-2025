/**
 * Contentful API Integration Module
 * Provides functions for fetching and managing blog articles from Contentful CMS
 */

import { ContentfulError, GraphQLError, NetworkError } from '@/lib/errors';

import type { GraphQLResponse } from '@/types';

/**
 * Executes GraphQL queries against Contentful's API with caching
 * @param query - GraphQL query string
 * @param variables - GraphQL variables
 * @param preview - Whether to use preview or production content
 * @returns Promise resolving to typed API response
 * @throws Error on network or GraphQL errors
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  preview = false,
  cacheConfig?: { next: { revalidate: number } }
): Promise<GraphQLResponse<T>> {
  try {
    // Use explicit cache settings based on preview mode
    // For preview content, use no-store to ensure fresh content
    // For production content, use force-cache when not explicitly configured
    const cacheSettings = preview
      ? { cache: 'no-store' as const }
      : cacheConfig?.next
        ? { next: cacheConfig.next }
        : { cache: 'force-cache' as const };

    const environment = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'development';

    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${environment}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            preview
              ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
              : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
          }`
        },
        body: JSON.stringify({ query, variables }),
        ...cacheSettings
      }
    );

    if (!response.ok) {
      try {
        // Try to clone the response to read the body without consuming it
        const clonedResponse = response.clone();
        const _responseBody = await clonedResponse.text();
      } catch {
        // If cloning fails, just log the error and continue
      }

      // This matches the test expectation
      throw new NetworkError(`Network error: ${response.statusText}`, response);
    }

    const json = (await response.json()) as GraphQLResponse<T>;

    // Check for GraphQL errors - ensure we're checking the array length
    if (json.errors && json.errors.length > 0) {
      // Filter out broken reference errors that shouldn't crash the app
      const criticalErrors = json.errors.filter((error) => {
        const message = error.message || '';
        // Allow queries to continue if they only have broken reference errors
        return !message.includes('Link from entry') || !message.includes('cannot be resolved');
      });

      // Only throw if there are critical errors (not just broken references)
      if (criticalErrors.length > 0) {
        // Check if this is an authentication error that will be handled by fallback
        const hasAuthError = criticalErrors.some(
          (error) =>
            error.message?.toLowerCase().includes('authentication failed') ||
            error.message?.toLowerCase().includes('access token') ||
            error.message?.toLowerCase().includes('invalid token')
        );

        // Only log GraphQL errors in development mode, but skip auth errors that have fallbacks
        if (process.env.NODE_ENV === 'development' && !hasAuthError) {
        }

        throw new GraphQLError('GraphQL query execution error', criticalErrors);
      }
      // Silently handle broken references - no logging to prevent console spam
    }

    return json;
  } catch (error: unknown) {
    // Only log errors in development mode to avoid console spam in production
    if (process.env.NODE_ENV === 'development') {
    }

    // Re-throw NetworkError and GraphQLError as they are already properly formatted
    if (error instanceof NetworkError || error instanceof GraphQLError) {
      throw error;
    }

    // For any other errors, wrap in ContentfulError
    throw new ContentfulError('Failed to fetch data from Contentful', error as Error);
  }
}
