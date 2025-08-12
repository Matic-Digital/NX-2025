'use client';

import { useEffect, useState } from 'react';
import type { Header as HeaderType, Footer as FooterType } from '@/types/contentful';
import { Header } from '@/components/global/Header';
import { Footer } from '@/components/global/Footer';
import { Main } from '@/components/global/matic-ds';
// Import the layout CSS
import '@/styles/layout.css';
import { getHeaderById } from '@/lib/contentful-api/header';
import { getFooterById } from '@/lib/contentful-api/footer';

interface PageLayoutProps {
  header?: HeaderType | null;
  footer?: FooterType | null;
  children: React.ReactNode;
}

/**
 * PageLayout component
 *
 * This client component handles adding CSS classes to the body element
 * when page-specific header and footer are present, which helps hide
 * the default header and footer in the root layout.
 */
export function PageLayout({ header, footer, children }: PageLayoutProps) {
  const [fullHeader, setFullHeader] = useState<HeaderType | null>(null);
  const [fullFooter, setFullFooter] = useState<FooterType | null>(null);

  // Fetch full header and footer data
  useEffect(() => {
    async function fetchHeaderFooter() {
      try {
        // Only fetch if we have IDs
        if (header?.sys?.id) {
          const headerData = await getHeaderById(header.sys.id);
          setFullHeader(headerData);
        }

        if (footer?.sys?.id) {
          const footerData = await getFooterById(footer.sys.id);
          setFullFooter(footerData);
        }
      } catch (error) {
        console.error('Error fetching header/footer:', error);
      }
    }

    // Use void to explicitly mark the promise as handled
    void fetchHeaderFooter();
  }, [header?.sys?.id, footer?.sys?.id]);

  // Add body classes
  useEffect(() => {
    if (fullHeader) {
      document.body.classList.add('page-has-header');
    }
    if (fullFooter) {
      document.body.classList.add('page-has-footer');
    }

    return () => {
      document.body.classList.remove('page-has-header', 'page-has-footer');
    };
  }, [fullHeader, fullFooter]);

  return (
    <>
      {fullHeader && <Header {...fullHeader} />}
      <Main className="-mt-25">{children}</Main>
      {fullFooter && <Footer {...fullFooter} />}
    </>
  );
}
