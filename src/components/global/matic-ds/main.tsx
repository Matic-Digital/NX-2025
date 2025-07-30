import { cn } from '@/lib/utils';
import type { MainProps } from './types';

/**
 * Main component for the primary content area of the page
 * @example
 * ```tsx
 * <Main>
 *   <Section>
 *     <Container>
 *       <h1>Page Title</h1>
 *       <p>Main content</p>
 *     </Container>
 *   </Section>
 * </Main>
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Main content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Optional ID for the main element
 * @returns {JSX.Element} Main component
 */
export const Main = ({ children, className, id }: MainProps) => {
  return (
    <main className={cn(className)} id={id}>
      {children}
    </main>
  );
};
