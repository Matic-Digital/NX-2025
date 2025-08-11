/**
 * Header Component
 *
 * This component renders a responsive navigation header based on content from Contentful.
 * It displays a logo and navigation links, with support for nested dropdown menus for
 * PageList content types. The component is integrated with Contentful's Live Preview
 * functionality for real-time content updates in the preview environment.
 *
 * Features:
 * - Responsive design with different layouts for desktop and mobile
 * - Support for nested navigation with dropdowns for PageList items
 * - Active link highlighting based on current route
 * - Contentful Live Preview integration for real-time updates
 */

'use client';

import * as React from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Container, Box } from '@/components/global/matic-ds';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Page } from '@/types/contentful/Page';
import type { PageList } from '@/types/contentful/PageList';

// Navigation menu components from shadcn
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu';

// Sheet components for mobile menu from shadcn
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetClose } from '@/components/ui/sheet';

// No need for an empty interface, just use the HeaderType directly
type HeaderProps = HeaderType;

/**
 * Header component that displays a navigation bar with logo and links
 * Supports Contentful Live Preview for real-time updates
 * Features:
 * - Desktop: Full navigation menu with dropdowns for page lists
 * - Mobile: Hamburger menu with slide-out sheet
 * - Sticky positioning with blur effect
 * - Consistent branding across breakpoints
 */
export function Header(props: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Important: We'll use CSS-only dark mode with the 'dark:' variant
  // This prevents hydration mismatches by ensuring server and client render the same HTML

  // Use Contentful Live Preview to get real-time updates
  const header = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: header?.sys?.id });

  // Handle scroll events to add frosted glass effect to header
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Clean up event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (!header) {
    return (
      <header className="bg-background/95 px-6 py-4">
        <Container>
          <Box direction="row" className="items-center justify-between">
            <p>No header found</p>
          </Box>
        </Container>
      </header>
    );
  }

  return (
    <ErrorBoundary>
      <Container
        className={`sticky top-0 z-50 pt-6 ${isScrolled ? 'transition-all duration-300' : ''}`}
      >
        <header
          className={`px-6 max-md:py-1.5 lg:w-full ${isScrolled ? '' : ''} ${isScrolled ? 'bg-black/40 backdrop-blur-2xl transition-all duration-300' : ''}`}
          {...inspectorProps({ fieldId: 'name' })}
        >
          <Box className="items-center justify-between">
            {/* Logo Section */}
            {header?.logo?.url && (
              <Link href="/" className="flex items-center gap-2 py-4">
                <Box gap={4}>
                  <div {...inspectorProps({ fieldId: 'logo' })}>
                    <Image
                      src={header.logo.url}
                      alt={header.logo.title ?? 'Site Logo'}
                      width={header.logo.width ?? 40}
                      height={header.logo.height ?? 40}
                      className="h-10 w-auto rounded-full object-contain"
                      priority
                    />
                  </div>
                  <span className="text-headline-xs text-text-on-invert">{header.name}</span>
                </Box>
              </Link>
            )}

            {/* Desktop Navigation */}
            <div className="hidden items-center lg:flex">
              <NavigationMenu
                className={`rounded-xxs mr-4 ${!isScrolled ? 'bg-black/40 backdrop-blur-2xl' : ''}`}
              >
                <NavigationMenuList>
                  {header?.navLinksCollection?.items.map((item) => {
                    // Handle Page items
                    if (item.__typename === 'Page') {
                      const page = item as Page;
                      return (
                        <NavigationMenuItem key={page.sys.id}>
                          <Link
                            href={`/${page.slug}`}
                            className={navigationMenuTriggerStyle({
                              className: isActive(`/${page.slug}`) ? 'bg-accent' : ''
                            })}
                          >
                            {page.title}
                          </Link>
                        </NavigationMenuItem>
                      );
                    }
                    // Handle PageList items (with dropdown)
                    else if (item.__typename === 'PageList') {
                      const pageList = item as PageList;
                      return (
                        <NavigationMenuItem key={pageList.sys.id}>
                          <NavigationMenuTrigger
                            className={isActive(`/${pageList.slug}`) ? 'bg-accent' : ''}
                          >
                            {pageList.title}
                          </NavigationMenuTrigger>
                          {/* Dropdown content */}
                          <NavigationMenuContent>
                            <div className="m-0 max-h-[60vh] w-[220px] overflow-auto p-0">
                              <div className="bg-background text-foreground m-0 rounded-md p-0">
                                {pageList.pagesCollection?.items &&
                                pageList.pagesCollection.items.length > 0 ? (
                                  <ul className="m-0 w-full list-none p-0">
                                    {pageList.pagesCollection.items.map((page) => (
                                      <li key={page.sys.id} className="m-0 w-full p-0">
                                        <Link
                                          href={'link' in page ? page.link : `/${page.slug}`}
                                          className={`block w-full px-4 py-2 text-sm font-medium no-underline outline-hidden transition-colors select-none ${isActive(`/${pageList.slug}/${'link' in page ? page.link : page.slug}`) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'} focus:bg-accent focus:text-accent-foreground rounded-sm`}
                                        >
                                          {page.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-muted-foreground p-3 text-sm">
                                    No pages available
                                  </p>
                                )}
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }
                    return null;
                  })}
                </NavigationMenuList>
              </NavigationMenu>

              <Search className="text-text-on-invert" />
            </div>

            {/* Mobile Navigation */}
            <Box direction="row" gap={2} className="items-center lg:hidden">
              <Button
                variant="ghost"
                className={`text-text-on-invert rounded-xxs ml-2 flex size-10 items-center justify-center bg-black/40 p-2 backdrop-blur-2xl`}
                aria-label="Open menu"
              >
                <Search className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`text-text-on-invert rounded-xxs ml-2 flex items-center justify-center bg-black/40 p-2 backdrop-blur-2xl`}
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="text-left text-lg font-semibold">Menu</SheetHeader>
                  <nav className="mt-6">
                    <ul className="space-y-4">
                      {header?.navLinksCollection?.items.map((item) => {
                        if (item.__typename === 'Page') {
                          const page = item as Page;
                          return (
                            <li key={page.sys.id}>
                              <SheetClose asChild>
                                <Link
                                  href={`/${page.slug}`}
                                  className={`block py-2 text-base ${
                                    isActive(`/${page.slug}`)
                                      ? 'text-primary font-semibold'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {page.title}
                                </Link>
                              </SheetClose>
                            </li>
                          );
                        } else if (item.__typename === 'PageList') {
                          const pageList = item as PageList;
                          return (
                            <li key={pageList.sys.id} className="py-2">
                              <details className="group">
                                <summary
                                  className={`flex cursor-pointer items-center justify-between text-base ${
                                    isActive(`/${pageList.slug}`)
                                      ? 'text-primary font-semibold'
                                      : 'text-foreground'
                                  }`}
                                >
                                  <span
                                    onClick={() => (window.location.href = `/${pageList.slug}`)}
                                    className="grow"
                                  >
                                    {pageList.title}
                                  </span>
                                  {/* <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /> */}
                                  <NavigationMenuTrigger />
                                </summary>
                                <ul className="mt-2 space-y-2 pl-4">
                                  {pageList.pagesCollection?.items.map((page) => (
                                    <li key={page.sys.id}>
                                      <SheetClose asChild>
                                        <Link
                                          href={
                                            'link' in page
                                              ? page.link
                                              : `/${pageList.slug}/${page.slug}`
                                          }
                                          className={`block py-1 text-sm ${
                                            isActive(
                                              `/${pageList.slug}/${'link' in page ? page.link : page.slug}`
                                            )
                                              ? 'text-primary font-medium'
                                              : 'text-muted-foreground'
                                          }`}
                                        >
                                          {page.title}
                                        </Link>
                                      </SheetClose>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>
            </Box>
          </Box>
        </header>
      </Container>
    </ErrorBoundary>
  );
}
