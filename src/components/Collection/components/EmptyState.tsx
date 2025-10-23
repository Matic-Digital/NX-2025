import { collectionStyles } from '../utils/CollectionStyles';

interface EmptyStateProps {
  activeFilter: string | null;
  searchQuery: string;
  onFilterChange: (filter: string | null) => void;
  onSearchChange: (query: string) => void;
}

export function EmptyState({
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange
}: EmptyStateProps) {
  return (
    <div className={collectionStyles.getEmptyStateClasses()}>
      <div className="mb-4">
        <svg
          className={collectionStyles.getEmptyStateIconClasses()}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className={collectionStyles.getEmptyStateTitleClasses()}>No posts found</h3>
      <p className={collectionStyles.getEmptyStateDescriptionClasses()}>
        {activeFilter && searchQuery
          ? `No posts match "${searchQuery}" in the "${activeFilter}" category.`
          : activeFilter
            ? `No posts found in the "${activeFilter}" category.`
            : searchQuery
              ? `No posts match "${searchQuery}".`
              : 'No posts are currently available.'}
      </p>
      {Boolean(activeFilter ?? searchQuery) && (
        <div className={collectionStyles.getEmptyStateButtonContainerClasses()}>
          {activeFilter && (
            <button
              onClick={() => onFilterChange(null)}
              className={collectionStyles.getEmptyStateButtonClasses()}
            >
              Clear Category Filter
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={collectionStyles.getEmptyStateButtonClasses()}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
