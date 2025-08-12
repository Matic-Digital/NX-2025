// Global styles
import '@/styles/globals.css';

// Dependencies
import { Inter } from 'next/font/google';
import { type Metadata } from 'next';

// Components
import { Providers } from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

/**
 * Metadata for the application
 * This will be used by Next.js for SEO and browser tab information
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: 'Nextracker',
  description: 'Modern content management and digital experiences',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
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
      <head>{/* This script prevents flash of wrong theme */}</head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
