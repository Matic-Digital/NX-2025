'use client';

import type { Solution } from '@/types/contentful/Solution';
import Image from 'next/image';
import { Box } from '@/components/global/matic-ds';

interface SolutionProps extends Solution {
  index?: number;
}

export function Solution(props: SolutionProps) {
  const {
    cardHeading,
    cardTitle,
    cardDescription,
    cardSubheading,
    cardBackgroundImage,
    index = 1
  } = props;

  return (
    <div className="group relative mt-12 h-[531px] cursor-pointer overflow-hidden bg-gray-900 p-8 transition-all duration-300 hover:mt-[-23px] hover:h-[602px]">
      {/* Background Image - appears on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Image
          src={cardBackgroundImage.link}
          alt={cardBackgroundImage.altText ?? ''}
          fill
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex h-full flex-col justify-between">
          <div className="mb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h2 className="mb-2 text-3xl font-bold text-white">{cardHeading}</h2>
            <p className="leading-relaxed text-white/90">{cardSubheading}</p>
          </div>

          <Box direction="col" gap={6} className="mt-auto">
            <Box direction="col" gap={1}>
              <span className="text-headline-xs">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-headline-xs leading-tight">{cardTitle}</h3>
            </Box>
            <p className="text-body-xxs leading-relaxed text-white">{cardDescription}</p>
          </Box>
        </div>
      </div>
    </div>
  );
}
