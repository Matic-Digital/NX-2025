// Global styles
import '@/styles/globals.css';

// Dependencies
import { Inter } from 'next/font/google';
import { type Metadata } from 'next';

// Components
import { Providers } from '@/app/providers';

import { Main } from '@/components/global/matic-ds';
import { Footer } from '@/components/global/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/global/Header';
import { getHeaderById } from '@/lib/contentful-api/header';
import { getFooterById } from '@/lib/contentful-api/footer';

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
  icons: [{ rel: 'icon', url: '/favicon.ico' }]
};

/**
 * Root layout component that wraps all pages
 * Features:
 * - Applies Inter font
 * - Sets HTML language
 * - Provides global context via Providers component
 *
 * @param children - Page content to be rendered
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Fetch the default Header with the specific ID
  const defaultHeader = await getHeaderById('2M7Meoj7QefWD7Y8EhliGU', false);

  // Fetch the default Footer with the specific ID
  let defaultFooter = null;
  try {
    defaultFooter = await getFooterById('5kECu6nUbEquZVRCuEU9Ev', false);
  } catch (error) {
    console.error('Error fetching footer data:', error);
  }

  // Get the class names from the Layout component to maintain consistent styling
  const layoutClasses = 'scroll-smooth antialiased focus:scroll-auto';

  return (
    <html lang="en" suppressHydrationWarning className={`${layoutClasses} ${inter.variable}`}>
      <head>{/* This script prevents flash of wrong theme */}</head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {/* 
            Create a sticky header container that will always be present.
            The content will be either the default header or replaced by the page-specific header.
          */}
          <div id="header-container" className="sticky top-0 z-50">
            {defaultHeader && <Header {...defaultHeader} />}
          </div>

          <Main className="-mt-29 pt-4">{children}</Main>

          <div id="default-footer" className="default-layout-component">
            {defaultFooter && <Footer footerData={defaultFooter} />}
          </div>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
