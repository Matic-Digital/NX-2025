import { collectionStyles } from '../utils/CollectionStyles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className={collectionStyles.getPaginationClasses()}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={collectionStyles.getPaginationButtonClasses(currentPage === 1)}
      >
        Previous
      </button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={collectionStyles.getPaginationButtonClasses(currentPage === totalPages)}
      >
        Next
      </button>
    </div>
  );
}
