/**
 * Contentful API Integration Module
 * Provides functions for fetching and managing blog articles from Contentful CMS
 */

import { ContentfulError, GraphQLError, NetworkError } from '@/lib/errors';
import { memoizedFetchGraphQL as _memoizedFetchGraphQL } from '@/lib/api-cache';
import { enhancedMemoizedFetchGraphQL } from '@/lib/enhanced-api-cache';

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
  cacheConfig?: { next: { revalidate?: number; tags?: string[] } }
): Promise<GraphQLResponse<T>> {
  try {
    // Validate query string to prevent injection
    if (typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Invalid GraphQL query');
    }
    
    // Validate variables object
    if (variables && typeof variables !== 'object') {
      throw new Error('Invalid GraphQL variables');
    }
    
    // Sanitize string variables to prevent injection
    const sanitizedVariables: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string') {
        // Basic validation - reject strings with potential GraphQL injection patterns
        if (value.includes('__typename') || value.includes('fragment') || value.includes('{')) {
           
          console.warn(`Potentially malicious GraphQL variable detected: ${key}`);
          // eslint-disable-next-line security/detect-object-injection
          sanitizedVariables[key] = value.replace(/[{}]/g, ''); // Remove curly braces
        } else {
          // eslint-disable-next-line security/detect-object-injection
          sanitizedVariables[key] = value;
        }
      } else {
        // eslint-disable-next-line security/detect-object-injection
        sanitizedVariables[key] = value;
      }
    }
    // Use explicit cache settings based on preview mode
    // For preview content, use no-store to ensure fresh content
    // For production content, use force-cache when not explicitly configured
    const cacheSettings = preview
      ? { cache: 'no-store' as const }
      : cacheConfig?.next
        ? { next: cacheConfig.next }
        : { cache: 'force-cache' as const };

    const environment = process.env.CONTENTFUL_ENVIRONMENT ?? 'development';
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = preview 
      ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
      : process.env.CONTENTFUL_ACCESS_TOKEN;

    if (!spaceId || !accessToken) {
      throw new Error(`Missing Contentful credentials: spaceId=${!!spaceId}, accessToken=${!!accessToken}`);
    }

    const requestBody = { query, variables: sanitizedVariables };
    const url = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environment}`;
    
    // Debug logging removed

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody),
      ...cacheSettings
    });

    if (!response.ok) {
      // Log the full error response for debugging
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Contentful API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url,
          environment
        });
      } catch (e) {
        console.error('Could not read error response:', e);
      }
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
          console.warn('GraphQL errors detected:', criticalErrors);
        }

        throw new GraphQLError('GraphQL query execution error', criticalErrors);
      }
      // Silently handle broken references - no logging to prevent console spam
    }

    return json;
  } catch (error: unknown) {
    // Enhanced error logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('API request failed with detailed error:', {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Re-throw NetworkError and GraphQLError as they are already properly formatted
    if (error instanceof NetworkError || error instanceof GraphQLError) {
      throw error;
    }

    // For any other errors, wrap in ContentfulError with more details
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ContentfulError(`Failed to fetch data from Contentful: ${errorMessage}`, error as Error);
  }
}

/**
 * Memoized version of fetchGraphQL to reduce duplicate API calls during SSR
 * Use this for component APIs that might be called multiple times with same parameters
 */
export async function fetchGraphQLMemoized<T>(
  query: string,
  variables: Record<string, unknown> = {},
  preview = false,
  cacheConfig?: { next: { revalidate?: number; tags?: string[] } }
): Promise<GraphQLResponse<T>> {
  return enhancedMemoizedFetchGraphQL(
    (q, v, p) => fetchGraphQL<T>(q, v, p, cacheConfig),
    query,
    variables,
    preview
  );
}
