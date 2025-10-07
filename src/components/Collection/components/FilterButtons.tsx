import { collectionStyles } from '../utils/CollectionStyles';

interface FilterButtonsProps {
  categories: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function FilterButtons({ categories, activeFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <div className={collectionStyles.getFilterContainerClasses()}>
      {/* "All" button */}
      <button
        onClick={() => onFilterChange(null)}
        className={collectionStyles.getFilterButtonClasses(activeFilter === null)}
      >
        All
      </button>

      {/* Category filter buttons */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          className={collectionStyles.getFilterButtonClasses(activeFilter === category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
