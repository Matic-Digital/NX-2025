import { Pagination } from '@/components/Collection/components/Pagination';
import { SearchBar } from '@/components/Collection/components/SearchBar';
import { collectionStyles } from '@/components/Collection/utils/CollectionStyles';
import { PageCard } from '@/components/Page/PageCard';

import type { Page } from '@/components/Page/PageSchema';

interface PageCollectionProps {
  currentPages: Page[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  variant?: 'default' | 'search';
  searchBarEnabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function PageCollection({
  currentPages,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  variant = 'default',
  searchBarEnabled = false,
  searchQuery = '',
  onSearchChange
}: PageCollectionProps) {
  if (isLoading) {
    return <div>Loading pages...</div>;
  }

  // Empty state is now handled by the parent Collection component
  // This component only renders when there are pages to show

  // Search variant uses a different layout
  if (variant === 'search') {
    return (
      <div>
        {/* Search bar - only show if searchBar is enabled */}
        {searchBarEnabled && onSearchChange && (
          <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
        )}

        <div className="space-y-0">
          {currentPages.map((page) => (
            <PageCard key={page.sys.id} {...page} variant="search" />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Search bar - only show if searchBar is enabled */}
      {searchBarEnabled && onSearchChange && (
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
      )}

      <div className={collectionStyles.getGridClasses()}>
        {currentPages.map((page) => (
          <div key={page.sys.id} className="flex">
            <PageCard {...page} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
