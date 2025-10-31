import { useEffect, useRef, useState } from 'react';
import { collectionStyles } from '../utils/CollectionStyles';

interface FilterButtonsProps {
  categories: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function FilterButtons({ categories, activeFilter, onFilterChange }: FilterButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const [_isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Auto-scroll to center the active button
  useEffect(() => {
    if (activeButtonRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeButton = activeButtonRef.current;

      // Calculate the scroll position to center the active button
      const containerWidth = container.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;

      const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      // Smooth scroll to center the active button
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeFilter]);

  const handleFilterClick = (filter: string | null) => {
    // Only prevent click if user dragged more than 5 pixels (intentional drag)
    if (dragDistance > 5) return;
    onFilterChange(filter);
  };

  // Touch/drag handlers for mobile scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || !e.touches[0]) return;
    setIsDragging(false);
    setDragDistance(0);
    setStartX(e.touches[0].clientX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || !e.touches[0]) return;
    const x = e.touches[0].clientX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    setDragDistance(distance);
    
    if (distance > 5) {
      setIsDragging(true);
      const walk = (x - startX) * 2; // Scroll speed multiplier
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    // Reset drag state immediately - no delay needed
    setIsDragging(false);
    // Keep dragDistance for a brief moment to prevent accidental clicks
    setTimeout(() => setDragDistance(0), 50);
  };

  // Mouse drag handlers for desktop (optional)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setDragDistance(0);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isMouseDown) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    setDragDistance(distance);
    
    if (distance > 5) {
      setIsDragging(true);
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsDragging(false);
    // Keep dragDistance for a brief moment to prevent accidental clicks
    setTimeout(() => setDragDistance(0), 50);
  };

  return (
    <div
      ref={containerRef}
      className="mb-6 flex gap-3 sm:gap-[1.5rem] overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
