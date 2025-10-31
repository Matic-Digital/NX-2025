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
// Scroll Management
import { ScrollRestoration } from '@/components/ScrollRestoration/ScrollRestoration';

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
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
          <span className="text-foreground text-lg font-medium">Loading...</span>
        </div>
      </div>
    }>
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
              <ScrollRestoration />
              <WrapBalancerProvider>{children}</WrapBalancerProvider>
            </ContentfulLivePreviewProvider>
          </ThemeProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </JotaiProvider>
      </LazyQueryProvider>
    </Suspense>
  );
};
