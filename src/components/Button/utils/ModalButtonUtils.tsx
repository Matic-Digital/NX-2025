import { Mail } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

/**
 * Icon mapping utilities for ModalCtaButton
 * Centralized icon management
 */

export const iconMap = {
  Email: Mail
} as const;

export type IconType = keyof typeof iconMap;

/**
 * Get icon component by name
 */
export const getIconComponent = (iconName?: string): LucideIcon | null => {
  if (!iconName) return null;

  const IconComponent = iconMap[iconName as IconType];
  return IconComponent || null;
};

/**
 * Render icon with consistent styling
 */
export const renderIcon = (iconName?: string, className = 'ml-2 h-4 w-4') => {
  const IconComponent = getIconComponent(iconName);

  if (!IconComponent) return null;

  return <IconComponent className={className} />;
};
