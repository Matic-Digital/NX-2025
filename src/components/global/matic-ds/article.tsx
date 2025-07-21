import { cn } from '@/lib/utils';
import type { ArticleProps } from './types';

/**
 * Article component for rendering article content with optional HTML injection
 * @example
 * ```tsx
 * // With children
 * <Article>
 *   <h1>Article Title</h1>
 *   <p>Article content</p>
 * </Article>
 *
 * // With HTML content
 * <Article html={{ __html: htmlContent }} />
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Article content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Optional ID for the article
 * @param {{ __html: string }} [props.html] - HTML content to be rendered using dangerouslySetInnerHTML
 * @returns {JSX.Element} Article component
 */
export const Article = ({ children, className, id, html }: ArticleProps) => {
  return (
    <article dangerouslySetInnerHTML={html} className={cn('matic spaced', className)} id={id}>
      {children}
    </article>
  );
};
