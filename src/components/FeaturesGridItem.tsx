'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import type { FeaturesGridItem as FeaturesGridItemType } from '@/types/contentful/FeaturesGrid';

export function FeaturesGridItem(props: FeaturesGridItemType) {
  const { icon, title, description, link, sys } = props;
  const inspectorProps = useContentfulInspectorMode({ entryId: sys?.id });

  // Render the appropriate icon based on the icon name
  const renderIcon = () => {
    return (
      <div className="group-hover:bg-primary mb-4 inline-flex h-16 w-16 items-center justify-center bg-black p-2">
        <Image
          src={icon.url}
          alt={`${icon.title} icon`}
          className="h-full w-full"
          width={icon.width}
          height={icon.height}
          {...inspectorProps({ fieldId: 'icon' })}
        />
      </div>
    );
  };

  return (
    <Link href={`/${link.slug}`} className="block">
      <Box direction="col" className="hover:bg-muted/50 group h-full p-4 transition-all">
        {renderIcon()}

        <Box
          gap={0}
          className="group-hover:text-primary text-headline-xs mb-2 flex items-center transition-all"
        >
          <h2 className="text-headline-xs transition-all" {...inspectorProps({ fieldId: 'title' })}>
            {title}
          </h2>
          <span className="text-primary hidden transition-all group-hover:block">
            <ArrowUpRight className="size-12 stroke-1" />
          </span>
        </Box>

        <p
          className="group-hover:text-primary text-muted-foreground text-sm"
          {...inspectorProps({ fieldId: 'description' })}
        >
          {description}
        </p>
      </Box>
    </Link>
  );
}
