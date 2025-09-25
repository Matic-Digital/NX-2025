import { collectionStyles } from '../utils/CollectionStyles';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search posts by title..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={collectionStyles.getSearchInputClasses()}
      />
    </div>
  );
}
