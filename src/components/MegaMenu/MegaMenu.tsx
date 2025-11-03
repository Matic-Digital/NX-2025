'use client';

import React, { useEffect, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Text } from '@/components/global/matic-ds';

import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { MegaMenuCard } from '@/components/MegaMenu/MegaMenuCard';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import {
  getRecentPostsForMegaMenu,
  getRecentPostsForMegaMenuByCategory
} from '@/components/Post/PostApi';

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
  const {
    setOverflowMenuOpen,
    openMegaMenu,
    setMegaMenuContent,
    clearCloseTimeout,
    activeMegaMenuId
  } = useMegaMenuContext();

  const menuId = megaMenuId ?? megaMenu?.sys?.id ?? 'unknown';

  // Determine if this mega menu should show active state (hovered OR currently open)
  const isActive = isHovered || activeMegaMenuId === menuId;

  useEffect(() => {
    if (!megaMenu && megaMenuId) {
      setLoading(true);
      void getMegaMenuById(megaMenuId)
        .then(setLoadedMegaMenu)
        .finally(() => setLoading(false));
    }
  }, [megaMenu, megaMenuId]);

  const currentMegaMenu = megaMenu ?? loadedMegaMenu;

  // Fetch recent posts for MegaMenu display
  useEffect(() => {
    setPostsLoading(true);
    const limit = overflow ? 1 : 3; // 1 post for overflow, 3 for regular mega menu

    // Extract categories from Contentful tags using same logic as Collection component
    const postTagCategories =
      currentMegaMenu?.contentfulMetadata?.tags
        ?.filter(
          (tag) =>
            tag.name.toLowerCase().startsWith('post:') || tag.name.toLowerCase().includes('post')
        )
        ?.map((tag) => tag.name.replace(/^post:/i, '').trim()) ?? [];

    const category = postTagCategories[0]; // Use first matching category

    // Debug logging to match Collection component

    const fetchFunction = category
      ? () => getRecentPostsForMegaMenuByCategory(category, limit)
      : () => getRecentPostsForMegaMenu(limit);

    void fetchFunction()
      .then((response) => setRecentPosts(response.items))
      .finally(() => setPostsLoading(false));
  }, [overflow, currentMegaMenu]);
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
      <div className="p-4 sm:p-6 xl:p-8">
        <div className="flex flex-col gap-6 xl:gap-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-8 min-h-[280px] xl:min-h-[320px]">
            <h2 className="text-lg sm:text-xl xl:text-[1.5rem] text-white xl:flex-shrink-0 xl:w-64">
              {displayTitle}
            </h2>
            <div className="xl:flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 h-[200px] xl:h-[240px] content-start">
                {Array.from({ length: 6 }, (_, index) => {
                  const menuItem = menuItems.at(index);
                  return menuItem ? (
                    <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
                  ) : (
                    <div key={`placeholder-${index}`} className="invisible min-h-[90px] xl:min-h-[110px]" />
                  );
                })}
              </div>
            </div>
          </div>
          {!postsLoading && recentPosts.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-white">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span className="text-sm">Loading menu...</span>
        </div>
      </div>
    );
  }

  if (!currentMegaMenu) {
    return null;
  }

  // For overflow variant, render as 2-column layout with MegaMenuCard first
  if (overflow) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-foreground mb-2 text-lg font-semibold">{displayTitle}</h3>
        <div className="grid grid-cols-2 gap-4 min-h-[280px] xl:min-h-[320px]">
          {/* First column: MegaMenuCard */}
          <div>
            {!postsLoading && recentPosts.length > 0 && recentPosts[0] && (
              <MegaMenuCard {...postToMegaMenuCard(recentPosts[0])} />
            )}
          </div>
          {/* Second column: Menu items */}
          <div className="flex flex-col gap-2 h-[200px] xl:h-[240px] content-start overflow-y-auto">
            {Array.from({ length: 6 }, (_, index) => {
              const menuItem = menuItems.at(index);
              return menuItem ? (
                <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
              ) : (
                <div key={`placeholder-${index}`} className="invisible min-h-[30px]" />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="group cursor-pointer px-2 xl:px-4 py-2 text-white transition-all duration-300 hover:text-gray-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex items-center relative hover:after:scale-x-100 after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white after:transition-transform after:duration-200 after:ease-out after:origin-left ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'}`}
        >
          <Text
            className="text-white transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
            style={{
              textShadow: isActive
                ? '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)'
                : 'none'
            }}
          >
            {displayTitle}
          </Text>
          <ChevronDown
            className={`size-3 xl:size-4 text-white ml-2 transition-transform duration-200 ${isActive ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </div>
    </div>
  );
}
