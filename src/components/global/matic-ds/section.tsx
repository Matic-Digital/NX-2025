import { cn } from '@/lib/utils';
import type { SectionProps } from './types';

/**
 * Section component for grouping related content
 * @example
 * ```tsx
 * <Section>
 *   <Container>
 *     <h2>Section Title</h2>
 *     <p>Section content</p>
 *   </Container>
 * </Section>
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Optional ID for the section
 * @returns {JSX.Element} Section component
 */
export const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section className={cn('section', className)} id={id}>
      {children}
    </section>
  );
};
