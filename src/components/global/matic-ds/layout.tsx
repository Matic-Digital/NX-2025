import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';

/**
 * Layout component that wraps content with global styles
 * Note: This component no longer uses the <html> tag to avoid Next.js App Router conflicts
 * Instead, use this component to wrap content within the body tag in your app/layout.tsx
 *
 * @example
 * ```tsx
 * <html lang="en">
 *   <body>
 *     <Layout>
 *       <Main>
 *         <Section>
 *           <Container>Content</Container>
 *         </Section>
 *       </Main>
 *     </Layout>
 *   </body>
 * </html>
 * ```
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be rendered within the layout
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Layout component
 */

export const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className={cn('scroll-smooth antialiased focus:scroll-auto', className)}>{children}</div>
  );
};
