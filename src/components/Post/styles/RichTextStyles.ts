import { cn } from '@/lib/utils';

/**
 * Pure styling utilities for Rich Text content
 * Contains all CSS class generation logic for rich text elements
 */

export const richTextStyles = {
  /**
   * Get CSS classes for main content container
   */
  getContentContainerClasses: () => {
    return 'prose prose-lg max-w-none mb-12';
  },

  /**
   * Get CSS classes for headings (h1-h6)
   */
  getHeadingClasses: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const baseClasses = 'font-bold text-gray-900 leading-tight mb-4 mt-8';
    
    switch (level) {
      case 1:
        return cn(baseClasses, 'text-4xl md:text-5xl mt-12');
      case 2:
        return cn(baseClasses, 'text-3xl md:text-4xl');
      case 3:
        return cn(baseClasses, 'text-2xl md:text-3xl');
      case 4:
        return cn(baseClasses, 'text-xl md:text-2xl');
      case 5:
        return cn(baseClasses, 'text-lg md:text-xl');
      case 6:
        return cn(baseClasses, 'text-base md:text-lg');
      default:
        return baseClasses;
    }
  },

  /**
   * Get CSS classes for paragraphs
   */
  getParagraphClasses: () => {
    return 'text-gray-700 leading-relaxed mb-6 text-base md:text-lg';
  },

  /**
   * Get CSS classes for bold text
   */
  getBoldClasses: () => {
    return 'font-semibold text-gray-900';
  },

  /**
   * Get CSS classes for italic text
   */
  getItalicClasses: () => {
    return 'italic';
  },

  /**
   * Get CSS classes for underlined text
   */
  getUnderlineClasses: () => {
    return 'underline decoration-2 underline-offset-2';
  },

  /**
   * Get CSS classes for code (inline)
   */
  getInlineCodeClasses: () => {
    return 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono';
  },

  /**
   * Get CSS classes for hyperlinks
   */
  getLinkClasses: () => {
    return 'text-primary hover:text-primary/80 underline decoration-2 underline-offset-2 transition-colors';
  },

  /**
   * Get CSS classes for blockquotes
   */
  getBlockquoteClasses: () => {
    return 'border-l-4 border-primary bg-gray-50 pl-6 pr-4 py-4 my-8 italic text-gray-700';
  },

  /**
   * Get CSS classes for unordered lists
   */
  getUnorderedListClasses: () => {
    return 'list-disc list-outside mb-6 space-y-2 text-gray-700 pl-6';
  },

  /**
   * Get CSS classes for ordered lists
   */
  getOrderedListClasses: () => {
    return 'list-decimal list-outside mb-6 space-y-2 text-gray-700 pl-6';
  },

  /**
   * Get CSS classes for list items
   */
  getListItemClasses: () => {
    return 'text-base md:text-lg leading-relaxed ml-0';
  },

  /**
   * Get CSS classes for horizontal rules
   */
  getHorizontalRuleClasses: () => {
    return 'border-0 h-px bg-gray-300 my-12';
  },

  /**
   * Get CSS classes for tables
   */
  getTableClasses: () => {
    return 'w-full border-collapse border border-gray-300 my-8';
  },

  /**
   * Get CSS classes for table headers
   */
  getTableHeaderClasses: () => {
    return 'bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900';
  },

  /**
   * Get CSS classes for table cells
   */
  getTableCellClasses: () => {
    return 'border border-gray-300 px-4 py-2 text-gray-700';
  },

  /**
   * Get CSS classes for embedded assets (images)
   */
  getEmbeddedAssetClasses: () => {
    return 'my-8';
  },

  /**
   * Get CSS classes for embedded asset images
   */
  getEmbeddedImageClasses: () => {
    return 'w-full h-auto rounded-lg shadow-lg';
  },

  /**
   * Get CSS classes for embedded asset captions
   */
  getEmbeddedCaptionClasses: () => {
    return 'text-sm text-gray-600 mt-2 text-center italic';
  },

  /**
   * Get CSS classes for superscript
   */
  getSuperscriptClasses: () => {
    return 'text-xs align-super';
  },

  /**
   * Get CSS classes for subscript
   */
  getSubscriptClasses: () => {
    return 'text-xs align-sub';
  },

  /**
   * Get CSS classes for strikethrough
   */
  getStrikethroughClasses: () => {
    return 'line-through decoration-2';
  }
};
