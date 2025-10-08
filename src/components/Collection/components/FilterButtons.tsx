import { useEffect, useRef } from 'react';
import { collectionStyles } from '../utils/CollectionStyles';

interface FilterButtonsProps {
  categories: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function FilterButtons({ categories, activeFilter, onFilterChange }: FilterButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to center the active button
  useEffect(() => {
    if (activeButtonRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeButton = activeButtonRef.current;
      
      // Calculate the scroll position to center the active button
      const containerWidth = container.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      
      const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      
      // Smooth scroll to center the active button
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeFilter]);

  const handleFilterClick = (filter: string | null) => {
    onFilterChange(filter);
  };

  return (
    <div 
      ref={containerRef}
      className="mb-6 flex gap-3 sm:gap-[1.5rem] overflow-x-auto scrollbar-hide pb-2"
    >
      {/* "All" button */}
      <button
        ref={activeFilter === null ? activeButtonRef : null}
        onClick={() => handleFilterClick(null)}
        className={`${collectionStyles.getFilterButtonClasses(activeFilter === null)} flex-shrink-0 whitespace-nowrap`}
      >
        All
      </button>

      {/* Category filter buttons */}
      {categories.map((category) => (
        <button
          key={category}
          ref={activeFilter === category ? activeButtonRef : null}
          onClick={() => handleFilterClick(category)}
          className={`${collectionStyles.getFilterButtonClasses(activeFilter === category)} flex-shrink-0 whitespace-nowrap`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
