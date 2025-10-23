import Link from 'next/link';

import { Box, Container } from '@/components/global/matic-ds';

/**
 * NotFound component
 * Displayed when a page or resource is not found (404 error)
 * Features:
 * - Centered error message
 * - Link to return to homepage
 * - Responsive layout with minimum height
 * - Tailwind styling for consistent appearance
 */
export default function NotFound() {
  return (
    <Container>
      <Box direction="col" gap={4} className="min-h-[50vh] items-center justify-center">
        <h2>Not Found</h2>
        <p>Could not find the requested resource</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Return Home
        </Link>
      </Box>
    </Container>
  );
}
