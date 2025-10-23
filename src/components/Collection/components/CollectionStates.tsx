import { SearchBar } from '@/components/Collection/components/SearchBar';

/**
 * Pure presentation components for collection states
 * Handle only UI rendering for different states
 */

interface StateProps {
  searchBarEnabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  contentTypes?: string[];
}

export const LoadingState = ({
  searchBarEnabled,
  searchQuery = '',
  onSearchChange,
  contentTypes
}: StateProps) => (
  <div>
    {searchBarEnabled && onSearchChange && (
      <SearchBar
        key="loading-search-bar"
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        contentTypes={contentTypes}
      />
    )}
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">Loading collection...</div>
    </div>
  </div>
);

export const ErrorState = ({
  message,
  searchBarEnabled,
  searchQuery = '',
  onSearchChange,
  contentTypes
}: { message: string } & StateProps) => (
  <div>
    {searchBarEnabled && onSearchChange && (
      <SearchBar
        key="error-search-bar"
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        contentTypes={contentTypes}
      />
    )}
    <div className="flex items-center justify-center p-8">
      <div className="text-red-500">{message}</div>
    </div>
  </div>
);

export const EmptyState = ({
  searchBarEnabled,
  searchQuery = '',
  onSearchChange,
  contentTypes
}: StateProps) => (
  <div>
    {searchBarEnabled && onSearchChange && (
      <SearchBar
        key="empty-search-bar"
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        contentTypes={contentTypes}
      />
    )}
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">No results found</div>
    </div>
  </div>
);

export const EmptySearchState = ({
  searchQuery,
  searchBarEnabled,
  onSearchChange,
  contentTypes
}: { searchQuery: string } & StateProps) => (
  <div>
    {searchBarEnabled && onSearchChange && (
      <SearchBar
        key="empty-search-search-bar"
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        contentTypes={contentTypes}
      />
    )}
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-muted-foreground mb-2">
        No results found for &ldquo;{searchQuery}&rdquo;
      </div>
      <div className="text-sm text-muted-foreground">Try adjusting your search terms</div>
    </div>
  </div>
);
