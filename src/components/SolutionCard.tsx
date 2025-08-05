'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSolutionsByIds } from '@/lib/contentful-api/solution';
import { Box } from '@/components/global/matic-ds';
import type { Solution, SolutionSys } from '@/types/contentful/Solution';

interface SolutionProps extends SolutionSys {
  index?: number;
}

export function SolutionCard(props: SolutionProps) {
  const { index = 1 } = props;
  console.log('solution props:', index);

  const [solutionData, setSolutionData] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolutionData = async () => {
      try {
        const solutions = await getSolutionsByIds([props.sys.id]);
        if (solutions.length > 0 && solutions[0]) {
          setSolutionData(solutions[0]);
        }
      } catch (error) {
        console.error('Error fetching solution data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSolutionData();
  }, [props.sys.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!solutionData) {
    return <div>Solution not found</div>;
  }

  return (
    <div className="group relative w-full cursor-pointer overflow-hidden bg-gray-100 p-6 transition-all duration-300 xl:mt-12 xl:h-[531px] xl:w-[243px] xl:p-8 xl:hover:mt-[-23px] xl:hover:h-[602px] dark:bg-[#1D1E1F]">
      {/* Background Image - appears on hover */}
      <div className="absolute inset-0 -left-1 transition-opacity duration-300 group-hover:opacity-100 xl:opacity-0">
        <Image
          src={solutionData?.cardBackgroundImage.link}
          alt={solutionData?.cardBackgroundImage.altText ?? ''}
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
                {solutionData?.cardHeading}
              </h2>
              <p className="text-body-lg leading-snug text-white">{solutionData?.cardSubheading}</p>
            </Box>
          </div>

          {/* Bottom content - always anchored at bottom */}
          <div className="xl:absolute xl:right-0 xl:bottom-0 xl:left-0">
            <Box direction="col" gap={{ base: 2, xl: 6 }}>
              <Box direction="col" gap={1}>
                <span className="text-body-md xl:text-headline-xs group-hover:text-white dark:text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-body-md xl:text-headline-xs leading-tight group-hover:text-white dark:text-white">
                  {solutionData?.cardTitle}
                </h3>
              </Box>
              <p className="text-body-xs xl:text-body-xxs letter-spacing-[0.12em] leading-relaxed group-hover:text-white dark:text-white">
                {solutionData?.cardDescription}
              </p>
            </Box>
          </div>
        </Box>
      </div>
    </div>
  );
}
