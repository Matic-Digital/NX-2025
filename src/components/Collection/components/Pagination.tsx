import { collectionStyles } from '../utils/CollectionStyles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Function to scroll to top of collection section
  const scrollToCollection = () => {
    // First try to find the collection container
    const collectionElement = document.querySelector('[data-collection-container]');
    
    if (collectionElement) {
      // Look for a parent Section element that contains the collection
      const parentSection = collectionElement.closest('section') || 
                           collectionElement.closest('[data-section]') ||
                           collectionElement.closest('.section');
      
      // If we found a parent section, scroll to that; otherwise scroll to the collection itself
      const targetElement = parentSection || collectionElement;
      
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback to other selectors
      const fallbackElement = document.querySelector('.collection-container') ||
                              document.querySelector('main') ||
                              document.body;
      
      if (fallbackElement) {
        fallbackElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    }
  };

  // Handle page change with scroll
  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollToCollection();
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 4) {
      // Show all pages if total is 4 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show 3 pages around current + last page with ellipses
      if (currentPage <= 2) {
        // Show first 3 pages + ellipses + last page
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        // Show first page + ellipses + last 3 pages
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current-1, current, current+1 + ellipses + last page
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        if (currentPage + 1 < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={collectionStyles.getPaginationClasses()}>
      {/* Previous Arrow */}
      <button
        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`${collectionStyles.getPaginationButtonClasses(currentPage === 1)} flex items-center justify-center w-10 h-10 transition-all duration-200`}
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.02081rem"
          height="1.02081rem"
          viewBox="0 0 18 18"
          fill="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <path
            d="M0.833374 9.00001H17.1667M17.1667 9.00001L9.00004 0.833344M17.1667 9.00001L9.00004 17.1667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-[0.75rem]">
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={`w-[3rem] aspect-square flex items-center justify-center text-sm font-medium rounded-none transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-primary text-white animate-pulse'
                    : 'bg-subtle text-black hover:bg-gray-100 hover:text-primary'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Arrow */}
      <button
        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`${collectionStyles.getPaginationButtonClasses(currentPage === totalPages)} flex items-center justify-center w-10 h-10 transition-all duration-200`}
        aria-label="Next page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.02081rem"
          height="1.02081rem"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M0.833374 9.00001H17.1667M17.1667 9.00001L9.00004 0.833344M17.1667 9.00001L9.00004 17.1667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
