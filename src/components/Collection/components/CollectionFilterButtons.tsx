'use client';

import { FilterButtons } from '@/components/Collection/components/FilterButtons';

interface CollectionFilterButtonsProps {
  categories: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  isEnabled?: boolean;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function CollectionFilterButtons({
  categories,
  activeFilter,
  onFilterChange,
  isEnabled = true,
  className = '',
  showLabel = false,
  label = 'Filter by category:'
}: CollectionFilterButtonsProps) {
  if (!isEnabled || categories.length === 0) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      {showLabel && (
        <p className="text-sm text-gray-600 mb-3">{label}</p>
      )}
      <FilterButtons
        categories={categories}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
