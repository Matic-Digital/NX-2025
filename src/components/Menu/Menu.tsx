import React from 'react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Text } from '@/components/global/matic-ds';
import {
  NavigationMenu,
  NavigationMenuList
} from '@/components/ui/navigation-menu';

import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { MegaMenuCard } from '@/components/MegaMenu/MegaMenuCard';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import { getRecentPostsForMegaMenu } from '@/components/Post/PostApi';

import type { Menu as MenuType } from '@/components/Menu/MenuSchema';
import type { Post } from '@/components/Post/PostSchema';

interface MenuProps {
  menu: MenuType;
  variant?: 'default' | 'overflow';
}

export function Menu({ menu, variant = 'default' }: MenuProps) {
  const { itemsCollection } = menu;
  const menuItems = itemsCollection?.items ?? [];
  const { closeMegaMenu, setMegaMenuContent, activeMegaMenuId } = useMegaMenuContext();
  const [recentPosts, setRecentPosts] = React.useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = React.useState(false);

  // Fetch recent posts for overflow variant
  React.useEffect(() => {
    if (variant === 'overflow') {
      setPostsLoading(true);
      getRecentPostsForMegaMenu(1) // Only 1 post for overflow
        .then((response) => setRecentPosts(response.items))
        .catch(console.error)
        .finally(() => setPostsLoading(false));
    }
  }, [variant]);

  // Helper function to convert Post to MegaMenuCard props
  const postToMegaMenuCard = (post: Post) => ({
    kicker: post.categories?.[0] ?? 'Blog',
    title: post.title,
    imageUrl: post.mainImage?.link ?? '',
    altText: post.mainImage?.altText ?? post.title,
    link: `/post/${post.slug}`
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
    const hasMegaMenus = menuItems.some(item => item.__typename === 'MegaMenu');
    
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
                const linkUrl = item.internalLink ? `/${item.internalLink.slug}` : item.externalLink;
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
                      className="text-foreground transition-all duration-300 group-hover:text-white"
                      style={{
                        textShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textShadow = '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)';
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
          // If only MenuItem types, create 2-column layout with MegaMenuCard
          <div className="flex gap-4 items-stretch">
            {/* First column: MegaMenuCard (flexible, grows) */}
            <div className="flex-1 flex">
              {!postsLoading && recentPosts.length > 0 && recentPosts[0] && (
                <div className="w-full h-full">
                  <MegaMenuCard {...postToMegaMenuCard(recentPosts[0])} fullHeight={true} />
                </div>
              )}
            </div>
            {/* Second column: Menu items (fixed max-width) */}
            <div className="flex flex-col max-w-[30.8rem] h-full min-h-[21.25rem] justify-between">
              {menuItems.filter(item => item.__typename === 'MenuItem').map((item) => {
                // TypeScript type narrowing after filter
                if (item.__typename !== 'MenuItem') return null;
                
                return (
                  <MenuItem 
                    key={item.sys.id} 
                    menuItem={item}
                    layout="horizontal"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group/navbar">
      <NavigationMenu>
        <NavigationMenuList className="gap-[0.75rem]">
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
                  className="cursor-pointer px-[0.75rem] py-[0.38rem] group"
                  onMouseEnter={handleRegularMenuItemHover}
                >
                  <Text 
                    className="text-white transition-all duration-300"
                    style={{
                      textShadow: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textShadow = '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)';
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
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
