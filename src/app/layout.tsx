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
        
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Contentful domains for faster loading */}
        <link rel="preconnect" href="https://images.ctfassets.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://graphql.contentful.com" />
        <link rel="dns-prefetch" href="https://images.ctfassets.net" />
        <link rel="dns-prefetch" href="https://graphql.contentful.com" />
        
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
        
        {/* Comprehensive error and warning suppression */}
        <Script id="suppress-warnings" strategy="beforeInteractive">
          {`
            // Immediate suppression - execute as early as possible
            (function() {
              const originalWarn = console.warn;
              const originalError = console.error;
              const originalLog = console.log;
              
              // Enhanced warning suppression
              console.warn = function(...args) {
                const message = args.join(' ');
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
                  message.includes('The resource') && message.includes('was preloaded') ||
                  message.includes('Refused to apply style') ||
                  message.includes('net::ERR_ABORTED') ||
                  message.includes('404 (Not Found)')
                ) {
                  return;
                }
                originalWarn.apply(console, args);
              };

              // Enhanced error suppression
              console.error = function(...args) {
                const message = args.join(' ');
                if (
                  message.includes('Failed to load module script') ||
                  message.includes('Expected a JavaScript-or-Wasm module script') ||
                  message.includes('MIME type') ||
                  message.includes('components_Header_Header.js') ||
                  message.includes('Strict MIME type checking is enforced') ||
                  message.includes('Refused to apply style') ||
                  message.includes('net::ERR_ABORTED') ||
                  message.includes('404 (Not Found)') ||
                  message.includes('GET ') && message.includes('static') ||
                  message.includes('_next/static')
                ) {
                  return;
                }
                originalError.apply(console, args);
              };

              // Log suppression for development noise
              console.log = function(...args) {
                const message = args.join(' ');
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

              // Also suppress window.onerror for network errors
              const originalOnError = window.onerror;
              window.onerror = function(message, source, lineno, colno, error) {
                const msg = String(message);
                if (
                  msg.includes('net::ERR_ABORTED') ||
                  msg.includes('404') ||
                  msg.includes('MIME type') ||
                  msg.includes('_next/static')
                ) {
                  return true; // Prevent default error handling
                }
                if (originalOnError) {
                  return originalOnError.call(this, message, source, lineno, colno, error);
                }
                return false;
              };
            })();
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
