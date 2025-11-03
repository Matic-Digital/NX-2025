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
        
        {/* Critical CSS to prevent header layout shifts */}
        {/* eslint-disable-next-line react/no-danger -- Critical CSS injection required for layout shift prevention */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Prevent header layout shifts on initial render */
            .header-container {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 100 !important;
              width: 100% !important;
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
        
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
