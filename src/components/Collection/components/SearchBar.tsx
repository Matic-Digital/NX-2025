import { useLayoutEffect, useRef } from 'react';

import { collectionStyles } from '../utils/CollectionStyles';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  contentTypes?: string[];
}

export function SearchBar({ searchQuery, onSearchChange, contentTypes }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasActiveRef = useRef(false);
  const cursorPositionRef = useRef<number>(0);

  // Track if input was active before re-render
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) {
      const isActive = document.activeElement === input;
      if (isActive) {
        wasActiveRef.current = true;
        cursorPositionRef.current = input.selectionStart ?? 0;
      }
    }
  });

  // Restore focus after re-render if it was previously active
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && wasActiveRef.current && document.activeElement !== input) {
      input.focus();
      input.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      wasActiveRef.current = false;
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    cursorPositionRef.current = input.selectionStart ?? 0;
    wasActiveRef.current = true;
    onSearchChange(e.target.value);
  };

  const handleFocus = () => {
    wasActiveRef.current = true;
  };

  const handleBlur = () => {
    wasActiveRef.current = false;
  };

  // Generate dynamic placeholder text based on content types
  const getPlaceholderText = () => {
    if (!contentTypes || contentTypes.length === 0) {
      return 'Search content by title...';
    }
    
    // Convert content types to lowercase for better readability
    const lowerCaseTypes = contentTypes.map(type => type.toLowerCase() + 's');
    
    // If all common content types are present, use generic text
    const hasPost = contentTypes.includes('Post');
    const hasPage = contentTypes.includes('Page');
    
    if (hasPost && hasPage && contentTypes.length === 2) {
      return 'Search content by title...';
    }
    
    // Create a readable list of content types
    if (lowerCaseTypes.length === 1) {
      return `Search ${lowerCaseTypes[0]} by title...`;
    } else if (lowerCaseTypes.length === 2) {
      return `Search ${lowerCaseTypes[0]} and ${lowerCaseTypes[1]} by title...`;
    } else {
      const lastType = lowerCaseTypes.pop();
      return `Search ${lowerCaseTypes.join(', ')}, and ${lastType ?? ''} by title...`;
    }
  };

  return (
    <div className="mb-6">
      <input
        ref={inputRef}
        type="text"
        placeholder={getPlaceholderText()}
        value={searchQuery}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={collectionStyles.getSearchInputClasses()}
        autoComplete="off"
      />
    </div>
  );
}
