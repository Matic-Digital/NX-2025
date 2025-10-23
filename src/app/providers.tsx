'use client';

// Types
import { type ReactNode } from 'react';
// Contentful Live Preview
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  // Initialize React Query client
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};
