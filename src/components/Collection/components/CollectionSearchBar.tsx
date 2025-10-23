'use client';

import { SearchBar } from '@/components/Collection/components/SearchBar';

interface CollectionSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  contentTypes?: string[];
  isEnabled?: boolean;
  className?: string;
}

export function CollectionSearchBar({
  searchQuery,
  onSearchChange,
  contentTypes = [],
  isEnabled = true,
  className = ''
}: CollectionSearchBarProps) {
  if (!isEnabled) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        contentTypes={contentTypes}
      />
    </div>
  );
}
