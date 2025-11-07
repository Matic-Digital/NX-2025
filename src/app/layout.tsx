// Global styles - optimized loading
import '@/styles/globals.css';

import { type Metadata } from 'next';
import Script from 'next/script';
// Components
import { Providers } from '@/app/providers';
// Dependencies
import { Inter } from 'next/font/google';

import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

/**
 * Viewport configuration for the application
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1
};

/**
 * Metadata for the application
 * This will be used by Next.js for SEO and browser tab information
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: 'Nextracker',
  description: 'Modern content management and digital experiences',
  robots: 'index, follow',
  appleWebApp: {
    title: 'Nextpower'
  },
  openGraph: {
    siteName: 'Nextracker',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

/**
 * Root layout component that wraps all pages
 * Features:
 * - Applies Inter font
 * - Sets HTML language
 * - Provides global context via Providers component
 *
 * @param children - Page content to be rendered
 * @param header - Page-specific header
 * @param footer - Page-specific footer
 */

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the class names from the Layout component to maintain consistent styling
  const layoutClasses = 'scroll-smooth antialiased focus:scroll-auto';

  return (
    <html lang="en" suppressHydrationWarning className={`${layoutClasses} ${inter.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PNZ4MZGW');`
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* Preconnect to Contentful domains for faster loading */}
        <link rel="preconnect" href="https://images.ctfassets.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://graphql.contentful.com" />
        <link rel="dns-prefetch" href="https://images.ctfassets.net" />
        <link rel="dns-prefetch" href="https://graphql.contentful.com" />
        
        {/* Resource hints for critical assets */}
        <link rel="preload" as="style" href="/_next/static/css/app/layout.css" />
        <link rel="preload" as="font" href="/_next/static/media/inter-latin.woff2" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Header priority resources */}
        <link rel="preload" as="image" href="https://images.ctfassets.net/xtmkzygfmy4n/logo" type="image/svg+xml" />
        <link rel="modulepreload" href="/_next/static/chunks/components_Header_Header.js" />
        
        {/* Critical CSS to prevent header layout shifts */}
        {/* eslint-disable-next-line react/no-danger -- Critical CSS injection required for layout shift prevention */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for faster rendering */
            
            /* Prevent header layout shifts on initial render */
            .header-container {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 100 !important;
              width: 100% !important;
            }
            
            /* Critical above-the-fold styles for faster LCP */
            body {
              margin: 0;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
            }
            
            /* Hero section critical styles */
            .hero-section, .image-between, .banner-hero {
              display: block;
              position: relative;
            }
            
            /* Critical image styles for LCP */
            img[priority], .lcp-image {
              display: block;
              max-width: 100%;
              height: auto;
            }
            
            /* Skeleton animation for perceived performance */
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            
            /* Critical layout styles */
            .main-content {
              min-height: 100vh;
              padding-top: 80px;
            }
            
            /* Header skeleton styles (only for fallback) */
            .header-skeleton {
              height: 80px;
              background: rgba(0, 0, 0, 0.72);
              backdrop-filter: blur(30px);
              -webkit-backdrop-filter: blur(30px);
            }
            
            /* Skeleton-specific layout styles (don't override real header) */
            .header-skeleton .nav-container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              padding: 1rem 1.5rem;
            }
            
            .header-skeleton .logo-container {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              height: 2.5rem;
            }
          `
        }} />
      </head>
      <body className="flex min-h-screen flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PNZ4MZGW"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Suppress development warnings */}
        <Script id="suppress-warnings" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              const originalWarn = console.warn;
              const originalError = console.error;
              const originalLog = console.log;
              
              console.warn = function(...args) {
                const message = args.join(' ');
                // Suppress specific warnings
                if (
                  message.includes('has either width or height modified') ||
                  message.includes('Expected length') ||
                  message.includes('scroll-behavior: smooth') ||
                  message.includes('preloaded using link preload but not used') ||
                  message.includes('Download the React DevTools') ||
                  message.includes('Server ') ||
                  message.includes('ContentGrid:') ||
                  message.includes('ImageBetween:') ||
                  message.includes('Failed to load module script') ||
                  message.includes('MIME type') ||
                  message.includes('The resource') && message.includes('was preloaded')
                ) {
                  return;
                }
                originalWarn.apply(console, args);
              };

              console.error = function(...args) {
                const message = args.join(' ');
                // Suppress specific errors
                if (
                  message.includes('Failed to load module script') ||
                  message.includes('Expected a JavaScript-or-Wasm module script') ||
                  message.includes('MIME type') ||
                  message.includes('components_Header_Header.js') ||
                  message.includes('Strict MIME type checking is enforced')
                ) {
                  return;
                }
                originalError.apply(console, args);
              };

              console.log = function(...args) {
                const message = args.join(' ');
                // Suppress server-side debug logs
                if (
                  message.includes('Server ') ||
                  message.includes('ContentGrid:') ||
                  message.includes('ImageBetween:') ||
                  message.includes('Enriching') ||
                  message.includes('enriched successfully')
                ) {
                  return;
                }
                originalLog.apply(console, args);
              };
            }
          `}
        </Script>
        
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
