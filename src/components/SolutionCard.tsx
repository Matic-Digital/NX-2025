'use client';

import type { Solution } from '@/types/contentful/Solution';
import Image from 'next/image';
import { Box } from '@/components/global/matic-ds';

interface SolutionProps extends Solution {
  index?: number;
}

export function SolutionCard(props: SolutionProps) {
  const {
    cardHeading,
    cardTitle,
    cardDescription,
    cardSubheading,
    cardBackgroundImage,
    index = 1
  } = props;

  return (
    <div className="group relative w-full cursor-pointer overflow-hidden bg-gray-900 p-6 transition-all duration-300 xl:mt-12 xl:h-[531px] xl:w-[243px] xl:p-8 xl:hover:mt-[-23px] xl:hover:h-[602px]">
      {/* Background Image - appears on hover */}
      <div className="absolute inset-0 -left-1 transition-opacity duration-300 group-hover:opacity-100 xl:opacity-0">
        <Image
          src={cardBackgroundImage.link}
          alt={cardBackgroundImage.altText ?? ''}
          fill
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="relative z-10 h-full">
        <Box direction="col" gap={12}>
          {/* Top content - appears on hover */}
          <div className="transition-opacity duration-300 xl:opacity-0 xl:group-hover:opacity-100">
            <Box direction="col" gap={{ base: 0, xl: 6 }}>
              <h2 className="text-title-lg xl:text-headline-md leading-10 font-medium text-white xl:leading-11">
                {cardHeading}
              </h2>
              <p className="text-body-lg leading-snug text-white">{cardSubheading}</p>
            </Box>
          </div>

          {/* Bottom content - always anchored at bottom */}
          <div className="xl:absolute xl:right-0 xl:bottom-0 xl:left-0">
            <Box direction="col" gap={{ base: 2, xl: 6 }}>
              <Box direction="col" gap={1}>
                <span className="text-body-md xl:text-headline-xs text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-body-md xl:text-headline-xs leading-tight text-white">
                  {cardTitle}
                </h3>
              </Box>
              <p className="text-body-xs xl:text-body-xxs letter-spacing-[0.12em] leading-relaxed text-white">
                {cardDescription}
              </p>
            </Box>
          </div>
        </Box>
      </div>
    </div>
  );
}
