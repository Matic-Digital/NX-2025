import { cn } from '@/lib/utils';
import type { ContainerProps } from './types';

/**
 * Container component that wraps content with consistent maximum width and padding
 * @example
 * ```tsx
 * <Container>
 *   <h1>Heading</h1>
 *   <p>Content</p>
 * </Container>
 *
 * // With custom width
 * <Container width="full">
 *   <h1>Full Width Content</h1>
 * </Container>
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be contained
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Optional ID for the container
 * @param {'boxed' | 'full'} [props.width] - Container width variant
 * @returns {JSX.Element} Container component
 */
export const Container = ({ children, className, id, width }: ContainerProps) => {
  return (
    <div
      className={cn(
        'container mx-auto px-6',
        {
          'max-w-full': width === 'full',
          'sm:px-6': width !== 'full',
          'md:px-9': width !== 'full'
        },
        className
      )}
      id={id}
    >
      {children}
    </div>
  );
};
