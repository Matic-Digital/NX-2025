'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getSolutionsByIds } from '@/lib/contentful-api/solution';
import { Box } from '@/components/global/matic-ds';
import type { Solution } from '@/types/contentful/Solution';
import { Button } from './ui/button';

interface SolutionCardProps extends Partial<Solution> {
  solutionId?: string;
  index?: number;
}

export function SolutionCard(props: SolutionCardProps) {
  const { solutionId, ...restProps } = props;
  const [fetchedData, setFetchedData] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(!!solutionId);
  const [error, setError] = useState<string | null>(null);

  console.log('SolutionCard', { props: props, fetchedData: fetchedData });

  // Fetch data if solutionId is provided
  useEffect(() => {
    if (!solutionId) return;

    async function fetchSolution() {
      try {
        setLoading(true);
        const solutions = await getSolutionsByIds([solutionId!]);
        if (solutions.length > 0 && solutions[0]) {
          setFetchedData(solutions[0]);
        } else {
          setError('Solution not found');
        }
      } catch (err) {
        console.error('Failed to fetch solution:', err);
        setError(err instanceof Error ? err.message : 'Failed to load solution');
      } finally {
        setLoading(false);
      }
    }

    void fetchSolution();
  }, [solutionId]);

  // Use fetched data if available, otherwise use props data
  const solutionData = useContentfulLiveUpdates(fetchedData ?? (restProps as Solution));
  const inspectorProps = useContentfulInspectorMode({ entryId: solutionData?.sys?.id });
  const { title, description, variant, slug } = solutionData;
  console.log('SolutionCard', { title, description, variant, slug });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading solution...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!solutionData) {
    return null;
  }

  const DefaultItem = () => {
    return <div>default</div>;
  };

  const BackgroundPrimaryHoverItem = () => {
    return (
      <div className="group rounded-xxs bg-subtle relative min-h-[24rem] min-w-[24rem] overflow-hidden">
        {/* Card Content */}
        <Box
          direction="col"
          gap={4}
          className="lg:group-hover:bg-primary relative z-20 h-full cursor-pointer p-6 lg:transition-all lg:duration-300"
        >
          {/* Text Content */}
          <Box direction="col" gap={4} className="h-full justify-between">
            <Box direction="col" gap={3}>
              <h3
                className="text-headline-sm line-clamp-2 lg:transition-colors lg:duration-300 lg:group-hover:text-white"
                {...inspectorProps({ fieldId: 'heading' })}
              >
                {title}
              </h3>
              {description && (
                <p
                  className="text-body-sm text-text-subtle line-clamp-4 opacity-100 lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:text-white lg:group-hover:opacity-100"
                  {...inspectorProps({ fieldId: 'description' })}
                >
                  {description}
                </p>
              )}
            </Box>
            <Link href={`/solutions/${slug}`}>
              <Button
                variant="outline"
                className="lg:group-hover:bg-background lg:group-hover:text-foreground mt-auto lg:transition-colors lg:group-hover:border-transparent"
              >
                See Details
              </Button>
            </Link>
          </Box>
        </Box>
      </div>
    );
  };

  switch (variant) {
    case 'BackgroundPrimaryHover':
      return <BackgroundPrimaryHoverItem />;
    default:
      return <DefaultItem />;
  }
}
