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
 * - Theme toggle for light/dark mode
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
import { Menu, ChevronDown } from 'lucide-react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';

import { Container, Box } from '@/components/global/matic-ds';
import type { Header as HeaderType, Page, PageList } from '@/types/contentful';

// Navigation menu components from shadcn
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';

// Sheet components for mobile menu from shadcn
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetClose } from '@/components/ui/sheet';

// Theme toggle component
import { ThemeToggle } from '@/components/global/ThemeToggle';

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
  // Use Contentful Live Preview to get real-time updates
  const header = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: header?.sys?.id });

  // State to track which dropdown is open
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Handle mouse enter for PageList button or dropdown
  const handleMouseEnter = (id: string) => {
    setOpenDropdown(id);
  };

  // Handle mouse leave for the entire header navigation area
  const handleNavMouseLeave = () => {
    // Close all dropdowns when leaving the entire navigation area
    setOpenDropdown(null);
  };

  return (
    <ErrorBoundary>
      <Container className="sticky top-0 z-50">
        <header
          className="mt-6 w-[95%] rounded-xl border border-b border-slate-400 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-md:py-1.5 lg:w-full"
          {...inspectorProps({ fieldId: 'name' })}
        >
          <Box className="items-center justify-between">
            {/* Logo Section */}
            {header?.logo?.url && (
              <Link href="/" className="flex items-center gap-2 py-4">
                <div {...inspectorProps({ fieldId: 'logo' })}>
                  <Image
                    src={header.logo.url}
                    alt={header.logo.title ?? 'Site Logo'}
                    width={header.logo.width ?? 40}
                    height={header.logo.height ?? 40}
                    className="h-10 w-auto object-contain"
                    priority
                  />
                </div>
                <span className="text-xl font-bold">{header.name}</span>
              </Link>
            )}

            {/* Desktop Navigation */}
            <div className="hidden items-center md:flex" onMouseLeave={handleNavMouseLeave}>
              <NavigationMenu className="mr-4">
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
                            {page.name}
                          </Link>
                        </NavigationMenuItem>
                      );
                    }
                    // Handle PageList items (with dropdown)
                    else if (item.__typename === 'PageList') {
                      const pageList = item as PageList;
                      return (
                        <div
                          key={pageList.sys.id}
                          className="relative"
                          onMouseEnter={() => handleMouseEnter(pageList.sys.id)}
                        >
                          <Link
                            href={`/${pageList.slug}`}
                            className={`${navigationMenuTriggerStyle()} ${isActive(`/${pageList.slug}`) || openDropdown === pageList.sys.id ? 'bg-accent' : ''}`}
                          >
                            {pageList.name}
                          </Link>
                          {/* Custom dropdown that appears when state is set */}
                          <div
                            className={`absolute left-0 top-full z-50 mt-1 rounded-md border bg-background shadow-md ${openDropdown === pageList.sys.id ? 'block' : 'hidden'}`}
                            onMouseEnter={() => handleMouseEnter(pageList.sys.id)}
                          >
                            <div className="m-0 max-h-[60vh] w-[220px] overflow-auto p-0">
                              <div className="m-0 bg-background p-0 text-foreground">
                                {pageList.pagesCollection?.items &&
                                pageList.pagesCollection.items.length > 0 ? (
                                  <ul className="m-0 w-full list-none p-0">
                                    {pageList.pagesCollection.items.map((page) => (
                                      <li key={page.sys.id} className="m-0 w-full p-0">
                                        <Link
                                          href={`/${pageList.slug}/${page.slug}`}
                                          className={`block w-full select-none px-4 py-2 text-sm font-medium no-underline outline-none transition-colors ${isActive(`/${pageList.slug}/${page.slug}`) ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'} focus:bg-accent focus:text-accent-foreground`}
                                        >
                                          {page.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="p-3 text-sm text-muted-foreground">
                                    No pages available
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="ml-2 flex h-10 w-10 items-center justify-center rounded-md bg-transparent p-0 text-base hover:bg-slate-200 dark:hover:bg-slate-800"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </button>
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
                                      ? 'font-semibold text-primary'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {page.name}
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
                                      ? 'font-semibold text-primary'
                                      : 'text-foreground'
                                  }`}
                                >
                                  <span
                                    onClick={() => (window.location.href = `/${pageList.slug}`)}
                                    className="flex-grow"
                                  >
                                    {pageList.name}
                                  </span>
                                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                </summary>
                                <ul className="mt-2 space-y-2 pl-4">
                                  {pageList.pagesCollection?.items.map((page) => (
                                    <li key={page.sys.id}>
                                      <SheetClose asChild>
                                        <Link
                                          href={`/${pageList.slug}/${page.slug}`}
                                          className={`block py-1 text-sm ${
                                            isActive(`/${pageList.slug}/${page.slug}`)
                                              ? 'font-medium text-primary'
                                              : 'text-muted-foreground'
                                          }`}
                                        >
                                          {page.name}
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
            </div>
          </Box>
        </header>
      </Container>
    </ErrorBoundary>
  );
}
