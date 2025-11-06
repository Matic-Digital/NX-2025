'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { getSolutionsByIds } from '@/components/Solution/SolutionApi';

import type { Solution } from '@/components/Solution/SolutionSchema';

interface SolutionCardProps extends Partial<Solution> {
  solutionId?: string;
  index?: number;
}

export function SolutionCard(props: SolutionCardProps) {
  const { solutionId, ...restProps } = props;
  const [fetchedData, setFetchedData] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(!!solutionId);
  const [error, setError] = useState<string | null>(null);

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
      } catch (_err) {
        setError(_err instanceof Error ? _err.message : 'Failed to load solution');
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
    return (
      <Box
        direction="col"
        gap={4}
        className={cn('bg-subtle h-full min-h-[350px] w-full p-8 lg:bg-primary')}
      >
        <Box direction="col" gap={2}>
          <h3 className={cn('!text-headline-sm lg:text-text-on-invert')}>{title}</h3>
          <p className={cn('!text-body-sm lg:text-text-on-invert')}>{description}</p>
        </Box>
      </Box>
    );
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
            <Link href={slug?.startsWith('/') || slug?.startsWith('solutions/') ? `/${slug}` : `/solutions/${slug}`}>
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
