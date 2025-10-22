'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocale, getContentWithFallback, getEntryWithFallback } from '@/lib/contentful-locale';

// Generic content type for Contentful entries
type ContentfulContent = Record<string, unknown>;

// Query parameters for Contentful API
type ContentfulQuery = Record<string, unknown>;

/**
 * Hook for managing locale state and locale-aware content fetching
 */
export function useLocale() {
  const [currentLocale, setCurrentLocale] = useState<string>('en-US');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale on mount
  useEffect(() => {
    const locale = getCurrentLocale();
    setCurrentLocale(locale);
    setIsLoading(false);
  }, []);

  // Update locale and persist to localStorage
  const updateLocale = useCallback((newLocale: string) => {
    setCurrentLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('contentful-locale', newLocale);
    }
  }, []);

  // Get content with locale fallback
  const getLocalizedContent = useCallback(async <T = ContentfulContent>(
    contentType: string,
    query: ContentfulQuery = {}
  ): Promise<T[]> => {
    return getContentWithFallback<T>(contentType, query, currentLocale);
  }, [currentLocale]);

  // Get single entry with locale fallback
  const getLocalizedEntry = useCallback(async <T = ContentfulContent>(
    entryId: string
  ): Promise<T | null> => {
    return getEntryWithFallback<T>(entryId, currentLocale);
  }, [currentLocale]);

  return {
    currentLocale,
    updateLocale,
    getLocalizedContent,
    getLocalizedEntry,
    isLoading,
  };
}

/**
 * Hook for fetching localized content with automatic refetching on locale change
 */
export function useLocalizedContent<T = ContentfulContent>(
  contentType: string,
  query: ContentfulQuery = {},
  dependencies: unknown[] = []
) {
  const { currentLocale, getLocalizedContent } = useLocale();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getLocalizedContent<T>(contentType, query);
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      setData([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, query, getLocalizedContent, ...dependencies]);

  // Fetch content when locale changes or dependencies change
  useEffect(() => {
    void fetchContent();
  }, [fetchContent, currentLocale]);

  return {
    data,
    loading,
    error,
    refetch: fetchContent,
    currentLocale,
  };
}

/**
 * Hook for fetching a single localized entry
 */
export function useLocalizedEntry<T = ContentfulContent>(entryId: string) {
  const { currentLocale, getLocalizedEntry } = useLocale();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntry = useCallback(async () => {
    if (!entryId) return;
    
    try {
      setLoading(true);
      setError(null);
      const entry = await getLocalizedEntry<T>(entryId);
      setData(entry);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch entry'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [entryId, getLocalizedEntry]);

  // Fetch entry when locale changes or entryId changes
  useEffect(() => {
    void fetchEntry();
  }, [fetchEntry, currentLocale]);

  return {
    data,
    loading,
    error,
    refetch: fetchEntry,
    currentLocale,
  };
}
