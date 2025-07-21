'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';

interface HeroProps {
  sys: {
    id: string;
  };
  name?: string;
  description?: string;
  __typename?: string; // Add typename for GraphQL identification
}

/**
 * Hero component that displays a title, description, and optional image
 * Supports Contentful Live Preview for real-time updates
 */
export function Hero(props: HeroProps) {
  // Always call hooks at the top level, before any conditional returns
  // Use the Contentful Live Updates hook to get real-time updates
  const hero = useContentfulLiveUpdates<HeroProps>(props);

  // Use the Contentful Inspector Mode hook for field tagging
  // Use optional chaining to safely access nested properties
  const inspectorProps = useContentfulInspectorMode({
    entryId: hero?.sys?.id || ''
  });

  // Add a check to ensure props has the required structure
  if (!hero?.sys?.id) {
    console.error('Hero component received invalid props:', props);
    return null;
  }

  console.log('Hero props:', props);
  console.log('Live updated hero:', hero);

  return (
    <Container className="bg-background py-16 md:py-24">
      <Box className="flex-col items-center text-center">
        {hero.name && (
          <h1
            className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl"
            {...inspectorProps({ fieldId: 'name' })}
          >
            {hero.name}
          </h1>
        )}

        {hero.description && (
          <p
            className="text-muted-foreground mb-8 max-w-2xl text-lg md:text-xl"
            {...inspectorProps({ fieldId: 'description' })}
          >
            {hero.description}
          </p>
        )}
      </Box>
    </Container>
  );
}
