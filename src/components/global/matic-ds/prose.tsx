import { cn } from '@/lib/utils';

import type { ArticleProps } from './types';

/**
 * Prose component for rendering content with proper typography styles
 * @example
 * ```tsx
 * // With children
 * <Prose>
 *   <h1>Title</h1>
 *   <p>Beautifully styled text content</p>
 *   <ul>
 *     <li>List item 1</li>
 *     <li>List item 2</li>
 *   </ul>
 * </Prose>
 *
 * // With HTML content
 * <Prose html={{ __html: htmlContent }} />
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Content to be styled
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Optional ID for the prose container
 * @param {{ __html: string }} [props.html] - HTML content to be rendered using dangerouslySetInnerHTML
 * @returns {JSX.Element} Prose component
 */
export const Prose = ({ children, className, id, html }: ArticleProps) => {
  return (
    <div
      dangerouslySetInnerHTML={html}
      className={cn(
        'matic spaced',
        [
          'prose',
          'mx-auto',
          'max-w-prose',
          'text-base',
          'leading-7',
          'prose-headings:m-0',
          'prose-headings:tracking-wide',
          'prose-h1:text-[2.75rem]',
          'lg:prose-h1:text-[6.25rem]',
          'prose-h1:font-extrabold',
          'prose-h2:text-[2rem]',
          'lg:prose-h2:text-[5.5rem]',
          'prose-h2:font-bold',
          'prose-h3:text-[1.5rem]',
          'lg:prose-h3:text-[4rem]',
          'prose-h3:font-bold',
          'prose-h4:text-[1.875rem]',
          'lg:prose-h4:text-[2.875rem]',
          'prose-h4:font-bold',
          'prose-p:text-[1rem]',
          'lg:prose-p:text-[1.25rem]',
          'prose-p:font-light',
          'prose-a:text-[1rem]',
          'lg:prose-a:text-[1.25rem]',
          'prose-a:font-light',
          'prose-a:hover:opacity-80',
          'prose-blockquote:text-[1rem]',
          'lg:prose-blockquote:text-[1.25rem]',
          'prose-figcaption:text-[1rem]',
          'lg:prose-figcaption:text-[1.25rem]',
          'prose-strong:text-[1rem]',
          'lg:prose-strong:text-[1.25rem]',
          'prose-strong:font-bold',
          'prose-em:text-[1rem]',
          'lg:prose-em:text-[1.25rem]',
          'prose-em:font-light',
          'prose-kbd:text-[1rem]',
          'lg:prose-kbd:text-[1.25rem]',
          'prose-kbd:font-light',
          'prose-code:text-[1rem]',
          'lg:prose-code:text-[1.25rem]',
          'prose-code:font-light',
          'prose-pre:text-[1rem]',
          'lg:prose-pre:text-[1.25rem]',
          'prose-pre:font-light',
          'prose-ol:mt-8',
          'prose-ol:list-decimal',
          'prose-ol:pl-6',
          'prose-ul:mt-8',
          'prose-ul:list-disc',
          'prose-ul:pl-6',
          'prose-li:text-[1rem]',
          'lg:prose-li:text-[1.25rem]',
          'prose-li:font-light',
          'prose-th:text-[1rem]',
          'lg:prose-th:text-[1.25rem]',
          'prose-th:font-medium',
          'prose-td:text-[1rem]',
          'lg:prose-td:text-[1.25rem]',
          'prose-td:font-light'
        ].join(' '),
        className
      )}
      id={id}
    >
      {children}
    </div>
  );
};
