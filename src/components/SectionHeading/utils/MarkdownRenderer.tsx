import React from 'react';

import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  forceLeftAlign?: boolean;
}

/**
 * Markdown renderer that:
 * - Groups `### Heading` + following lines into sections
 * - Displays sections in a responsive grid (2–4 cols)
 * - Supports --- dividers for linear text
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  forceLeftAlign = false
}) => {
  // Parse markdown into sections
  const parseSections = (text: string) => {
    const lines = text.split('\n');
    const sections: { heading: string; body: string[] }[] = [];
    let current: { heading: string; body: string[] } | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('###')) {
        // Start a new section
        if (current) sections.push(current);
        current = { heading: trimmed.replace(/^###\s*/, ''), body: [] };
      } else if (trimmed && current) {
        current.body.push(trimmed);
      }
    });

    if (current) sections.push(current);
    return sections;
  };

  // If no `###`, fall back to simple line renderer
  const parseFallback = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('###')) {
        return (
          <h3
            key={`h3-${i}`}
            className="text-[1.25rem] font-normal leading-[160%] text-foreground mb-2"
          >
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        );
      }

      if (trimmed === '---') {
        return (
          <div key={`divider-${i}`} className="my-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="560"
              height="2"
              viewBox="0 0 560 2"
              fill="none"
              className="w-full max-w-[560px] text-foreground"
            >
              <path d="M0 1H560" stroke="currentColor" />
            </svg>
          </div>
        );
      }

      if (trimmed) {
        return (
          <p key={`p-${i}`} className="text-foreground">
            {trimmed}
          </p>
        );
      }

      return null;
    });
  };

  const sections = parseSections(content);

  // Remove text-center and xl:text-right classes if forceLeftAlign is true
  const alignmentAdjustedClassName = forceLeftAlign
    ? className?.replace(/text-center|xl:text-right/g, '').trim()
    : className;

  if (sections.length > 0) {
    // Grid mode
    return (
      <div
        className={cn('grid grid-cols-1 gap-6 md:grid-cols-2 mt-12', alignmentAdjustedClassName)}
      >
        {sections.map((sec, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <h3 className="text-[1.25rem] font-normal leading-[160%] text-foreground">
              {sec.heading}
            </h3>
            <hr className="border-primary" />
            {sec.body.length > 0 && (
              <p className="text-body-md text-foreground">{sec.body.join(' ')}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Fallback mode
  return (
    <div className={cn('[&>*]:mb-0 [&>*]:mt-0', alignmentAdjustedClassName, 'text-left')}>
      {parseFallback(content)}
    </div>
  );
};

/**
 * Helper function to check if content contains markdown
 */
export const hasMarkdown = (content: string): boolean => {
  return content.includes('###') || content.includes('---');
};
