import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  forceLeftAlign?: boolean;
}

/**
 * Simple markdown renderer for SectionHeading descriptions
 * Supports:
 * - ### for h3 headings with specific styles
 * - --- for horizontal dividers
 * - Regular text as paragraphs
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className, forceLeftAlign = false }) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle h3 headings (###)
      if (trimmedLine.startsWith('###')) {
        const headingText = trimmedLine.replace(/^###\s*/, '');
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-[1.25rem] font-normal leading-[160%] mb-0 mt-0 text-foreground"
            style={{
              fontSize: '1.25rem',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '160%'
            }}
          >
            {headingText}
          </h3>
        );
        return;
      }

      // Handle horizontal dividers (---)
      if (trimmedLine === '---') {
        elements.push(
          <div key={`divider-${index}`} className="my-4">
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
        return;
      }

      // Handle regular text (skip empty lines) - style as paragraphs
      if (trimmedLine) {
        elements.push(
          <p key={`text-${index}`} className="mb-0 mt-0 text-foreground">
            {trimmedLine}
          </p>
        );
      }
    });

    return elements;
  };

  const parsedElements = parseMarkdown(content);

  // If no markdown elements found, return original content
  if (parsedElements.length === 0) {
    return <span className={className}>{content}</span>;
  }

  // Remove text-center and xl:text-right classes if forceLeftAlign is true
  const alignmentAdjustedClassName = forceLeftAlign 
    ? className?.replace(/text-center|xl:text-right/g, '').trim()
    : className;

  return (
    <div className={`${alignmentAdjustedClassName} text-left [&>*]:mb-0 [&>*]:mt-0`}>
      {parsedElements.map((element, index) => (
        <React.Fragment key={index}>
          {element}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Helper function to check if content contains markdown
 */
export const hasMarkdown = (content: string): boolean => {
  return content.includes('###') || content.includes('---');
};
