import React from 'react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu';

import { Text } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { LocaleDropdown } from '@/components/LocaleDropdown/LocaleDropdown';
import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { MegaMenuCard } from '@/components/MegaMenu/MegaMenuCard';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import {
  getRecentPostsForMegaMenu,
  getRecentPostsForMegaMenuByCategory
} from '@/components/Post/PostApi';

import type { Menu as MenuType } from '@/components/Menu/MenuSchema';
import type { Post } from '@/components/Post/PostSchema';

interface MenuProps {
  menu: MenuType;
  variant?: 'default' | 'overflow';
  megaMenuTags?: Array<{ id: string; name: string }>;
}

export function Menu({ menu, variant = 'default', megaMenuTags }: MenuProps) {
  const { setMegaMenuContent, activeMegaMenuId, closeMegaMenu } = useMegaMenuContext();
  const [recentPosts, setRecentPosts] = React.useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = React.useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] = React.useState<string | null>(null);

  // Extract menu items from the menu
  const menuItems = menu?.itemsCollection?.items ?? [];

  // Fetch recent posts for overflow variant
  React.useEffect(() => {
    if (variant === 'overflow') {
      setPostsLoading(true);

      // Extract categories from Contentful tags using same logic as Collection component
      const postTagCategories =
        megaMenuTags
          ?.filter(
            (tag) =>
              tag.name.toLowerCase().startsWith('post:') || tag.name.toLowerCase().includes('post')
          )
          ?.map((tag) => tag.name.replace(/^post:/i, '').trim()) ?? [];

      const category = postTagCategories[0]; // Use first matching category

      // Debug logging to match Collection component
      console.log('🔍 MegaMenu post filtering debug:');
      console.log('- MegaMenu tags:', megaMenuTags);
      console.log('- Post tag categories:', postTagCategories);
      console.log('- Selected category:', category);

      const fetchFunction = category
        ? () => getRecentPostsForMegaMenuByCategory(category, 1)
        : () => getRecentPostsForMegaMenu(1);

      console.log(
        '- Using function:',
        category ? 'getRecentPostsForMegaMenuByCategory' : 'getRecentPostsForMegaMenu'
      );

      fetchFunction()
        .then((response) => setRecentPosts(response.items))
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  }, [variant, megaMenuTags]);

  // Helper function to convert Post to MegaMenuCard props
  const postToMegaMenuCard = (post: Post) => ({
    kicker: post.categories?.[0] ?? 'Blog',
    title: post.title,
    imageUrl: post.mainImage?.link ?? '',
    altText: post.mainImage?.altText ?? post.title,
    link: `/post/${post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized'}/${post.slug}`
  });

  const handleRegularMenuItemHover = () => {
    // Close any open mega menu when hovering regular menu items
    if (activeMegaMenuId) {
      closeMegaMenu(activeMegaMenuId);
      setMegaMenuContent(null);
    }
  };

  // For overflow variant, render without NavigationMenu wrapper
  if (variant === 'overflow') {
    const hasMegaMenus = menuItems.some((item) => item.__typename === 'MegaMenu');

    return (
      <div className="group/navbar">
        {hasMegaMenus ? (
          // If there are MegaMenu items, render them normally
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              if (item.__typename === 'MegaMenu') {
                return (
                  <MegaMenu
                    key={item.sys.id}
                    megaMenuId={item.sys.id}
                    title={item.title}
                    overflow={true}
                  />
                );
              } else {
                const linkUrl = item.internalLink
                  ? `/${item.internalLink.slug}`
                  : item.externalLink;
                const linkTarget = item.externalLink ? '_blank' : '_self';
                const linkRel = item.externalLink ? 'noopener noreferrer' : undefined;

                return (
                  <a
                    key={item.sys.id}
                    href={linkUrl}
                    target={linkTarget}
                    rel={linkRel}
                    className="cursor-pointer px-[0.75rem] py-[0.38rem] group"
                    onMouseEnter={handleRegularMenuItemHover}
                  >
                    <Text
                      className="text-foreground transition-all duration-300 group-hover:text-background"
                      style={{
                        textShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textShadow =
                          '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textShadow = 'none';
                      }}
                    >
                      {item.text}
                    </Text>
                  </a>
                );
              }
            })}
          </div>
        ) : (
          // If only MenuItem types, create 2-column layout with associated image
          <div className="flex gap-4 items-stretch">
            {/* First column: Associated Image (flexible, grows) */}
            <div className="flex-1 flex">
              <div className="w-full h-[29.1875rem] relative overflow-hidden">
                {(() => {
                  // Find the hovered menu item or default to first item with associated image
                  const targetItem = hoveredMenuItem
                    ? menuItems.find(
                        (item) => item.__typename === 'MenuItem' && item.sys.id === hoveredMenuItem
                      )
                    : menuItems.find(
                        (item) => item.__typename === 'MenuItem' && item.associatedImage
                      );

                  if (
                    targetItem &&
                    targetItem.__typename === 'MenuItem' &&
                    targetItem.associatedImage
                  ) {
                    return (
                      <>
                        <AirImage
                          key={targetItem.sys.id}
                          link={targetItem.associatedImage.link}
                          altText={targetItem.associatedImage.altText ?? targetItem.title}
                          className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ease-in-out" />
                        <div className="absolute bottom-4 left-4 text-background transition-opacity duration-300 ease-in-out">
                          <h3 className="text-6xl font-normal leading-[90%] tracking-[0.04rem]">
                            {targetItem.text}
                          </h3>
                        </div>
                      </>
                    );
                  }

                  // Fallback to recent post if no associated images
                  if (!postsLoading && recentPosts.length > 0 && recentPosts[0]) {
                    return (
                      <div className="transition-opacity duration-300 ease-in-out">
                        <MegaMenuCard {...postToMegaMenuCard(recentPosts[0])} fullHeight={true} />
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            </div>
            {/* Second column: Menu items (fixed max-width) */}
            <div className="flex flex-col max-w-[30.8rem] h-full min-h-[21.25rem] justify-between">
              <div className="flex flex-col">
                {menuItems
                  .filter((item) => item.__typename === 'MenuItem')
                  .map((item) => {
                    // TypeScript type narrowing after filter
                    if (item.__typename !== 'MenuItem') return null;

                    return (
                      <div
                        key={item.sys.id}
                        onMouseEnter={() => setHoveredMenuItem(item.sys.id)}
                        onMouseLeave={() => setHoveredMenuItem(null)}
                      >
                        <MenuItem menuItem={item} layout="horizontal" />
                      </div>
                    );
                  })}
              </div>

              {/* LocaleDropdown positioned at bottom of menu items column */}
              <div className="flex justify-end mt-4">
                <LocaleDropdown />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group/navbar">
      <NavigationMenu>
        <NavigationMenuList className="gap-2 xl:gap-[0.75rem] flex-wrap xl:flex-nowrap">
          {menuItems.map((item) => {
            // TypeScript now properly discriminates based on __typename
            if (item.__typename === 'MegaMenu') {
              // MegaMenu will lazy load its own items
              return (
                <MegaMenu
                  key={item.sys.id}
                  megaMenuId={item.sys.id}
                  title={item.title}
                  overflow={false}
                />
              );
            } else {
              // Simple link for MenuItem - just show the title as a link
              const linkUrl = item.internalLink ? `/${item.internalLink.slug}` : item.externalLink;
              const linkTarget = item.externalLink ? '_blank' : '_self';
              const linkRel = item.externalLink ? 'noopener noreferrer' : undefined;

              return (
                <a
                  key={item.sys.id}
                  href={linkUrl}
                  target={linkTarget}
                  rel={linkRel}
                  className="group cursor-pointer px-2 xl:px-4 py-2 text-background transition-all duration-300 hover:text-gray-300"
                  onMouseEnter={handleRegularMenuItemHover}
                >
                  <div className="flex items-center relative hover:after:scale-x-100 after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white after:scale-x-0 after:transition-transform after:duration-200 after:ease-out after:origin-left">
                    <Text
                      className="text-background transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
                      style={{
                        textShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textShadow =
                          '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textShadow = 'none';
                      }}
                    >
                      {item.text}
                    </Text>
                  </div>
                </a>
              );
            }
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
