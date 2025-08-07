/**
 * Contentful API Integration Module
 * Provides functions for fetching and managing blog articles from Contentful CMS
 */

import type { GraphQLResponse } from '@/types/contentful';

import { ContentfulError, NetworkError, GraphQLError } from './errors';

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

    // Debug: Log the environment variable value
    console.log('CONTENTFUL_ENVIRONMENT:', process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT);
    const environment = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'development';
    console.log('Using environment:', environment);

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
        const responseBody = await clonedResponse.text();
        console.error('GraphQL error response body:', responseBody);
      } catch (cloneError) {
        // If cloning fails, just log the error and continue
        console.error('Error cloning response:', cloneError);
      }

      // This matches the test expectation
      throw new NetworkError(`Network error: ${response.statusText}`, response);
    }

    const json = (await response.json()) as GraphQLResponse<T>;

    // Check for GraphQL errors - ensure we're checking the array length
    if (json.errors && json.errors.length > 0) {
      console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
      throw new GraphQLError('GraphQL query execution error', json.errors);
    }

    return json;
  } catch (error: unknown) {
    console.error('Error in fetchGraphQL:', error);

    // Log additional information about the query that failed
    console.error('Failed query:', query);
    console.error('Variables:', JSON.stringify(variables, null, 2));

    // Re-throw NetworkError and GraphQLError as they are already properly formatted
    if (error instanceof NetworkError || error instanceof GraphQLError) {
      throw error;
    }

    // For any other errors, wrap in ContentfulError
    throw new ContentfulError('Failed to fetch data from Contentful', error as Error);
  }
}
