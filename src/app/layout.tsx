// Global styles
import '@/styles/globals.css';

// Dependencies
import { Inter } from 'next/font/google';
import { type Metadata } from 'next';

// Components
import { Providers } from '@/app/providers';
<<<<<<< Updated upstream
=======
import { draftMode } from 'next/headers';

import { Main } from '@/components/global/matic-ds';
import { Footer } from '@/components/global/Footer';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Check if we're in preview/draft mode
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  // Only fetch header/footer if not in preview mode
  let defaultHeader = null;
  let defaultFooter = null;

  if (!isPreview) {
    // Fetch the default Header with the specific ID
    defaultHeader = await getHeaderById('2M7Meoj7QefWD7Y8EhliGU', false);

    // Fetch the default Footer with the specific ID
    try {
      defaultFooter = await getFooterById('5kECu6nUbEquZVRCuEU9Ev', false);
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  }
>>>>>>> Stashed changes

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
