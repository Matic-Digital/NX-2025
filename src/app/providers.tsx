'use client';

// Types
import { type ReactNode } from 'react';
// Contentful Live Preview
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
// Lazy load TanStack Query - only when forms are used
import { lazy, Suspense } from 'react';

const LazyQueryProvider = lazy(async () => {
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  });

  return {
    default: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  };
});
// State Management
import { Provider as JotaiProvider } from 'jotai';
// Theme
import { ThemeProvider } from 'next-themes';
import { Provider as WrapBalancerProvider } from 'react-wrap-balancer';

// Utils
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { DevTools } from 'jotai-devtools';
// import 'jotai-devtools/styles.css';

/**
 * Global providers wrapper component
 * Configures React Query for data fetching and Jotai for state management
 *
 * @param children - Child components to be wrapped with providers
 */
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyQueryProvider>
        <JotaiProvider>
          {/* <DevTools theme="dark" /> */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            enableColorScheme
            storageKey="matic-ui-theme"
          >
            <ContentfulLivePreviewProvider
              locale="en-US"
              enableInspectorMode={true}
              enableLiveUpdates={true}
            >
              <WrapBalancerProvider>{children}</WrapBalancerProvider>
            </ContentfulLivePreviewProvider>
          </ThemeProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </JotaiProvider>
      </LazyQueryProvider>
    </Suspense>
  );
};
