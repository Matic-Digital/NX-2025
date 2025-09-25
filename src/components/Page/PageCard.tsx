'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

import AirImage from '@/components/Image/AirImage';
import { getPageById } from '@/components/Page/PageApi';

import type { Page } from '@/components/Page/PageSchema';

interface PageCardProps extends Partial<Page> {
  sys: {
    id: string;
  };
  variant?: string;
}

export function PageCard(props: PageCardProps) {
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(!props.title); // Only load if we don't have title data
  const isRowVariant = props.variant === 'row';
  const isFeaturedVariant = props.variant === 'featured';

  useEffect(() => {
    // Only fetch if we don't have the required data
    if (!props.title) {
      async function fetchPageData() {
        try {
          setLoading(true);
          const data = await getPageById(props.sys.id);
          if (data) {
            setPageData(data);
          }
        } catch (error) {
          console.error('Error fetching page data:', error);
        } finally {
          setLoading(false);
        }
      }

      void fetchPageData();
    }
  }, [props.sys.id, props.title]);

  // Use provided props data if available, otherwise use fetched data
  const page = useContentfulLiveUpdates(pageData ?? (props as Page));
  const inspectorProps = useContentfulInspectorMode({ entryId: page?.sys?.id });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-lg">Loading page...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-lg">Page not found</div>
      </div>
    );
  }

  return (
    <Link
      href={`/${page?.slug}`}
      {...inspectorProps({ fieldId: 'slug' })}
      className="group flex h-full flex-col"
    >
      <Box
        direction="col"
        gap={0}
        className={cn(
          // Mobile: always column layout, Large: row layout only for row variant
          'flex-col',
          isRowVariant && '2xl:max-h-64 2xl:flex-row',
          isFeaturedVariant && 'h-full'
        )}
      >
        <AirImage
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion
          link={(page?.openGraphImage as any)?.link}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion
          altText={(page?.openGraphImage as any)?.altText ?? page?.title}
          className={cn(
            // Mobile: consistent height for all cards, Large: different heights for variants
            'min-h-[16rem] w-full object-cover',
            isRowVariant && '2xl:max-h-64',
            isFeaturedVariant && 'lg:min-h-[24rem] xl:min-h-[32rem]'
          )}
        />
        <Box direction="col" gap={0} className={cn('bg-subtle h-full justify-between')}>
          <Box
            direction="col"
            gap={0}
            className={cn(
              // Mobile: consistent padding for all cards, Large: different padding for variants
              'gap-[0.75rem] p-[1.5rem]',
              isRowVariant && '2xl:gap-[0.25rem] 2xl:p-[1rem]',
              isFeaturedVariant && 'lg:gap-[1rem] lg:p-[2rem]'
            )}
          >
            <p
              className="text-body-xs text-primary uppercase"
              {...inspectorProps({ fieldId: '__typename' })}
            >
              Page
            </p>
            <h2
              className={cn(
                // Mobile: consistent sizing for all cards, Large: different sizes for variants
                'text-headline-xs group-hover:text-primary leading-[120%]',
                isFeaturedVariant && 'lg:text-headline-lg xl:text-headline-xl',
                isRowVariant && '2xl:text-headline-xs 2xl:leading-[110%]'
              )}
              {...inspectorProps({ fieldId: 'title' })}
            >
              {page?.title}
            </h2>
            {page?.description && (
              <p
                className={cn(
                  'text-body-sm text-text-subtle line-clamp-3',
                  isRowVariant && '2xl:text-body-xs 2xl:line-clamp-2',
                  isFeaturedVariant && 'lg:text-body-md'
                )}
                {...inspectorProps({ fieldId: 'description' })}
              >
                {page.description}
              </p>
            )}
          </Box>
          <Box
            direction="row"
            gap={2}
            className={cn(
              // Mobile: consistent padding, Large: different padding for variants
              'items-center justify-between pl-[1.5rem]',
              isRowVariant && '2xl:pl-[1rem]'
            )}
          >
            <p className="text-body-xs text-[#525252]">View Page</p>
            <Box
              direction="col"
              gap={0}
              className={cn(
                // Mobile: consistent padding, Large: different padding for variants
                'bg-background group-hover:bg-primary p-[1.25rem] group-hover:text-white',
                isRowVariant && '2xl:p-[1rem]'
              )}
            >
              <ArrowUpRight className="size-12 stroke-1 group-hover:stroke-white" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
