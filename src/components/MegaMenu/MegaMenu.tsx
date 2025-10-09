'use client';

import React, { useEffect, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Text } from '@/components/global/matic-ds';

import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { MegaMenuCard } from '@/components/MegaMenu/MegaMenuCard';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import { getRecentPostsForMegaMenu, getRecentPostsForMegaMenuByCategory } from '@/components/Post/PostApi';

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

  const currentMegaMenu = megaMenu ?? loadedMegaMenu;

  // Fetch recent posts for MegaMenu display
  useEffect(() => {
    setPostsLoading(true);
    const limit = overflow ? 1 : 3; // 1 post for overflow, 3 for regular mega menu
    
    // Extract categories from Contentful tags using same logic as Collection component
    const postTagCategories = currentMegaMenu?.contentfulMetadata?.tags
      ?.filter(tag => 
        tag.name.toLowerCase().startsWith('post:') || tag.name.toLowerCase().includes('post')
      )
      ?.map(tag => tag.name.replace(/^post:/i, '').trim()) ?? [];
    
    const category = postTagCategories[0]; // Use first matching category
    
    // Debug logging to match Collection component
    console.log('🔍 MegaMenu post filtering debug:');
    console.log('- MegaMenu:', currentMegaMenu?.title);
    console.log('- MegaMenu tags:', currentMegaMenu?.contentfulMetadata?.tags);
    console.log('- Post tag categories:', postTagCategories);
    console.log('- Selected category:', category);
    
    const fetchFunction = category 
      ? () => getRecentPostsForMegaMenuByCategory(category, limit)
      : () => getRecentPostsForMegaMenu(limit);
    
    console.log('- Using function:', category ? 'getRecentPostsForMegaMenuByCategory' : 'getRecentPostsForMegaMenu');
    
    fetchFunction()
      .then((response) => setRecentPosts(response.items))
      .catch(console.error)
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
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-8">
            <h2 className="text-lg sm:text-xl xl:text-[1.5rem] text-white xl:flex-shrink-0 xl:w-64">{displayTitle}</h2>
            <div className="grid auto-rows-min grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 xl:flex-grow">
              {menuItems.map((menuItem) => (
                <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
              ))}
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
        className="group cursor-pointer px-2 xl:px-4 py-2 text-white transition-all duration-300 hover:text-gray-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex items-center relative hover:after:scale-x-100 after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white after:transition-transform after:duration-200 after:ease-out after:origin-left ${isHovered ? 'after:scale-x-100' : 'after:scale-x-0'}`}>
          <Text 
            className="text-white transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
            style={{
              textShadow: isHovered 
                ? '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)'
                : 'none'
            }}
          >
            {displayTitle}
          </Text>
          <ChevronDown className="size-3 xl:size-4 text-white ml-2" />
        </div>
      </div>
    </div>
  );
}
