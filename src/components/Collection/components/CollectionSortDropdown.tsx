'use client';

import { ChevronDown } from 'lucide-react';

export type SortOption = {
  value: string;
  label: string;
};

interface CollectionSortDropdownProps {
  sortOptions: SortOption[];
  activeSortOption: string;
  onSortChange: (sortValue: string) => void;
  isEnabled?: boolean;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function CollectionSortDropdown({
  sortOptions,
  activeSortOption,
  onSortChange,
  isEnabled = true,
  className = '',
  showLabel = false,
  label = 'Sort by:'
}: CollectionSortDropdownProps) {
  if (!isEnabled || sortOptions.length === 0) {
    return null;
  }

  // Remove unused variable
  // const activeOption = sortOptions.find(option => option.value === activeSortOption);

  return (
    <div className={`mb-6 ${className}`}>
      {showLabel && (
        <p className="text-sm text-gray-600 mb-3">{label}</p>
      )}
      <div className="relative inline-block">
        <select
          value={activeSortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white p-[0.75rem] pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}
