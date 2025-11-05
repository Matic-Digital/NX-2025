import { EmptyState } from '@/components/Collection/components/EmptyState';
import { Pagination } from '@/components/Collection/components/Pagination';
import { SearchBar } from '@/components/Collection/components/SearchBar';
import { collectionStyles } from '@/components/Collection/utils/CollectionStyles';
import { PostCard } from '@/components/Post/PostCard';

import type { Post as PostType } from '@/components/Post/PostSchema';

interface PostCollectionProps {
  filteredPosts: PostType[];
  currentPosts: PostType[];
  currentPage: number;
  totalPages: number;
  activeFilter: string | null;
  searchQuery: string;
  postTagCategories?: string[]; // Made optional since it's not used
  onFilterChange: (filter: string | null) => void;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  searchBarEnabled: boolean;
}

export function PostCollection({
  currentPosts,
  currentPage,
  totalPages,
  activeFilter,
  searchQuery,
  postTagCategories: _postTagCategories, // Prefix with underscore to indicate intentionally unused
  onFilterChange,
  onSearchChange,
  onPageChange,
  isLoading,
  searchBarEnabled
}: PostCollectionProps) {
  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div>
      {/* Search bar - only show if searchBar is enabled */}
      {searchBarEnabled && <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />}

      <div className={collectionStyles.getGridClasses()}>
        {currentPosts.length === 0 ? (
          <EmptyState
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={onFilterChange}
            onSearchChange={onSearchChange}
          />
        ) : (
          currentPosts.map((post) => (
            <div key={post.sys.id}>
              <PostCard {...post} />
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
