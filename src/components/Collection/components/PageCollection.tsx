import { Pagination } from '@/components/Collection/components/Pagination';
import { collectionStyles } from '@/components/Collection/utils/CollectionStyles';
import { PageCard } from '@/components/Page/PageCard';

import type { Page } from '@/components/Page/PageSchema';

interface PageCollectionProps {
  currentPages: Page[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function PageCollection({
  currentPages,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: PageCollectionProps) {
  if (isLoading) {
    return <div>Loading pages...</div>;
  }

  if (currentPages.length === 0) {
    return <div>No pages found</div>;
  }

  return (
    <div>
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
