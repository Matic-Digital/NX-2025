'use client';

import React, { useEffect, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Text } from '@/components/global/matic-ds';

import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { MegaMenuCard } from '@/components/MegaMenu/MegaMenuCard';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import { getRecentPostsForMegaMenu } from '@/components/Post/PostApi';

import type { MegaMenu as MegaMenuType } from '@/components/MegaMenu/MegaMenuSchema';
import type { Post } from '@/components/Post/PostSchema';

interface MegaMenuProps {
  megaMenu?: MegaMenuType;
  megaMenuId?: string;
  title?: string;
  overflow?: boolean;
}

export function MegaMenu({ megaMenu, megaMenuId, title, overflow }: MegaMenuProps) {
  const [loadedMegaMenu, setLoadedMegaMenu] = useState<MegaMenuType | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { setOverflowMenuOpen, openMegaMenu, setMegaMenuContent, clearCloseTimeout } = useMegaMenuContext();

  const menuId = megaMenuId ?? megaMenu?.sys?.id ?? 'unknown';

  useEffect(() => {
    if (!megaMenu && megaMenuId) {
      setLoading(true);
      getMegaMenuById(megaMenuId)
        .then(setLoadedMegaMenu)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [megaMenu, megaMenuId]);

  // Fetch recent posts for MegaMenu display
  useEffect(() => {
    setPostsLoading(true);
    const limit = overflow ? 1 : 3; // 1 post for overflow, 3 for regular mega menu
    getRecentPostsForMegaMenu(limit)
      .then((response) => setRecentPosts(response.items))
      .catch(console.error)
      .finally(() => setPostsLoading(false));
  }, [overflow]);

  const currentMegaMenu = megaMenu ?? loadedMegaMenu;
  const displayTitle = title ?? currentMegaMenu?.title ?? 'Menu';
  const menuItems = currentMegaMenu?.itemsCollection?.items ?? [];

  // Helper function to convert Post to MegaMenuCard props
  const postToMegaMenuCard = (post: Post) => ({
    kicker: post.categories?.[0] ?? 'Blog',
    title: post.title,
    imageUrl: post.mainImage?.link ?? '',
    altText: post.mainImage?.altText ?? post.title,
    link: `/post/${post.categories?.[0]?.toLowerCase().replace(/\s+/g, '-') ?? 'uncategorized'}/${post.slug}`
  });

  const handleMouseEnter = () => {
    // Clear any pending close timeout immediately
    clearCloseTimeout();
    setIsHovered(true);
    openMegaMenu(menuId);
    setOverflowMenuOpen(false);
    
    // Set the content for this mega menu
    const content = (
      <div className="p-8">
        <div className="flex flex-col gap-8">
          <div className="flex">
            <h2 className="mb-4 flex-grow text-[1.5rem] text-white">{displayTitle}</h2>
            <div className="grid auto-rows-min grid-cols-3 gap-4">
              {menuItems.map((menuItem) => (
                <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
              ))}
            </div>
          </div>
          {!postsLoading && recentPosts.length > 0 && (
            <div>
              <div className="grid grid-cols-3 gap-4">
                {recentPosts.slice(0, 3).map((post) => (
                  <MegaMenuCard key={post.sys.id} {...postToMegaMenuCard(post)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
    setMegaMenuContent(content);
  };

  const handleMouseLeave = () => {
    // Don't close immediately - let the portal handle the hover logic
    setIsHovered(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentMegaMenu) {
    return null;
  }

  // For overflow variant, render as 2-column layout with MegaMenuCard first
  if (overflow) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-foreground mb-2 text-lg font-semibold">{displayTitle}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* First column: MegaMenuCard */}
          <div>
            {!postsLoading && recentPosts.length > 0 && recentPosts[0] && (
              <MegaMenuCard {...postToMegaMenuCard(recentPosts[0])} />
            )}
          </div>
          {/* Second column: Menu items */}
          <div className="flex flex-col gap-2">
            {menuItems.map((menuItem) => (
              <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="cursor-pointer px-4 py-2 text-white transition-all duration-300 hover:text-gray-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex gap-[0.75rem] items-center">
          <Text 
            className="text-white transition-all duration-300"
            style={{
              textShadow: isHovered 
                ? '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)'
                : 'none'
            }}
          >
            {displayTitle}
          </Text>
          <ChevronDown className="size-4 text-white" />
        </div>
      </div>
    </div>
  );
}
