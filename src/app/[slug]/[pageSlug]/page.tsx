/**
 * Nested Page Component
 *
 * This component handles dynamic routing for Pages that belong to a PageList.
 * It fetches both the PageList and the Page by their respective slugs and renders
 * the appropriate components based on the content structure defined in Contentful.
 *
 * Key features:
 * - Nested dynamic routing using Next.js file-based routing with [slug]/[pageSlug] parameters
 * - Server-side rendering of content from Contentful
 * - Component mapping to render different content types
 * - Error handling for content that doesn't exist (404 Not Found)
 * - Support for both static site generation and dynamic rendering
 * - Breadcrumb navigation to reflect the hierarchical structure
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPageBySlugInPageList } from '@/lib/api';
import { Hero } from '@/components/global/Hero';
import { Footer } from '@/components/global/Footer';
import { PageLayout } from '@/components/layout/PageLayout';
import type { Hero as _HeroType } from '@/types/contentful/Hero';
import type { Page } from '@/types/contentful/Page';
import type { PageList } from '@/types/contentful/PageList';

// Define the component mapping for pageContent items
const componentMap = {
  Hero: Hero
  // Add other component types here as they are created
};

// Define props for the nested page component
interface NestedPageProps {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Generate static params for static site generation
export async function generateStaticParams() {
  // This would typically fetch all pages and page lists to pre-render
  // For now, we'll return an empty array as we're focusing on dynamic rendering
  return [];
}

// Define appropriate caching behavior for nested dynamic routes
export const dynamic = 'force-static'; // Prefer static rendering where possible
export const revalidate = 3600; // Revalidate every hour

// The nested page component
export default async function NestedPage({ params, searchParams }: NestedPageProps) {
  // Await the params Promise (required in Next.js)
  const resolvedParams = await params;
  await searchParams; // We need to await this even if we don't use it

  // Access params in a way that's compatible with Next.js async components
  const pageListSlug = resolvedParams?.slug; // Using slug instead of pageListSlug to match parent route
  const pageSlug = resolvedParams?.pageSlug;
  const preview = false; // Set to true if you want to enable preview mode

  let page: Page | null = null;
  let pageList: PageList | null = null;

  try {
    console.log(`Attempting to fetch page: ${pageSlug} in PageList: ${pageListSlug}`);

    // Fetch the page and pageList data based on the slugs
    const result = await getPageBySlugInPageList(pageListSlug, pageSlug, preview);
    page = result.page;
    pageList = result.pageList;

    // If no page or pageList is found, or the page doesn't belong to the pageList, return a 404
    if (!page || !pageList) {
      console.log(`Page not found: ${pageSlug} in PageList: ${pageListSlug}`);
      notFound();
    }

    console.log(`Successfully found page: ${pageSlug} in PageList: ${pageListSlug}`);
  } catch (error) {
    console.error(`Error fetching page: ${pageSlug} in PageList: ${pageListSlug}`, error);
    notFound();
  }

  // At this point, we know page and pageList are not null because we would have called notFound() above
  // TypeScript doesn't know this though, so we need to assert that they are not null
  if (!page || !pageList) {
    notFound();
  }

  // Get the page-specific header and footer if they exist
  const pageHeader = page.header;
  const pageFooter = page.footer;

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <main>
        {/* Breadcrumb navigation */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="mx-1 h-3 w-3 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <a
                    href={`/${pageList.slug}`}
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    {pageList.name}
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="mx-1 h-3 w-3 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {page.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <h1 className="sr-only ">{page.name}</h1>

        {/* Render the page content components */}
        {page.pageContentCollection?.items.map((component) => {
          if (!component) return null;

          // Type guard to check if component has __typename
          if (!('__typename' in component)) {
            console.warn('Component missing __typename:', component);
            return null;
          }

          // We've checked that __typename exists with the 'in' operator
          const typeName = component.__typename!;

          // Check if we have a component for this type
          if (typeName && typeName in componentMap) {
            const ComponentType = componentMap[typeName as keyof typeof componentMap];
            return <ComponentType key={component.sys.id} {...component} />;
          }

          // Log a warning if we don't have a component for this type
          console.warn(`No component found for type: ${typeName}`);
          return null;
        })}
      </main>

      {/* Render the page-specific footer if available */}
      {pageFooter && <Footer footerData={pageFooter} />}
    </PageLayout>
  );
}
