'use client';

import { Fragment, useEffect, useState } from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import Link from 'next/link';

import { useServiceCard } from '@/contexts/ServiceCardContext';

import { Button } from '@/components/ui/button';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box } from '@/components/global/matic-ds/box';

import { AirImage } from '@/components/Image/AirImage';
import { shouldPreloadImage, ImageContext as _ImageContext } from '@/components/Image/utils/imageOptimization';
import { getServiceById } from '@/components/Service/ServiceApi';

import type { Service } from '@/components/Service/ServiceSchema';

interface ServiceCardProps extends Partial<Service> {
  serviceId?: string;
  cardId?: string;
  cardTitle?: string;
  cardTags?: string[];
  cardButtonText?: string;
  cardButtonLink?: string;
  isActive?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  index?: number; // For priority image optimization
  isFirstCard?: boolean; // For LCP optimization
}

export function ServiceCard(props: ServiceCardProps) {
  const { serviceId, cardId, index, isFirstCard, ...restProps } = props;
  const [fetchedData, setFetchedData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(!!serviceId);
  const { activeCardId, setActiveCardId } = useServiceCard();

  // Fetch data if serviceId is provided
  useEffect(() => {
    if (!serviceId) return;

    async function fetchServiceData() {
      if (!serviceId) return;

      try {
        setLoading(true);
        const data = await getServiceById(serviceId, false);
        setFetchedData(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }

    void fetchServiceData();
  }, [serviceId]);

  // Use fetched data if available, otherwise use props data
  const service = useContentfulLiveUpdates(fetchedData ?? restProps);

  // Set first card as active on mount if no card is active (desktop only)
  useEffect(() => {
    if (isFirstCard && cardId && activeCardId === null && window.innerWidth >= 768) {
      setActiveCardId(cardId);
    }
  }, [isFirstCard, cardId, activeCardId, setActiveCardId]);

  const isActive = cardId ? activeCardId === cardId && window.innerWidth >= 768 : false;
  
  // Determine if this image should be prioritized for LCP optimization
  const shouldPrioritize = shouldPreloadImage({
    index,
    isFirstInGrid: isFirstCard,
    isAboveFold: isFirstCard ?? (typeof index === 'number' && index < 2)
  });

  const handleMouseEnter = () => {
    // Only handle mouse enter on desktop
    if (cardId && window.innerWidth >= 768) {
      setActiveCardId(cardId);
    }
  };

  // Show loading state
  if (loading || !service) {
    return (
      <ErrorBoundary>
        <div className="group relative z-10 min-h-[31.125rem] animate-pulse overflow-hidden bg-gray-100 backdrop-blur transition-all duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gray-200" />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className="group relative z-10 min-h-[31.125rem] overflow-hidden backdrop-blur transition-all duration-500 ease-in-out"
        onMouseEnter={handleMouseEnter}
        style={{
          background:
            'linear-gradient(198deg, rgba(8, 8, 15, 0.02) -1.13%, rgba(8, 8, 15, 0.05) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
        }}
      >
        <div className="absolute top-0 right-0 left-0 h-[14rem] overflow-hidden opacity-100 md:hidden">
          <div className="relative h-[14rem] w-full overflow-hidden">
            <AirImage
              {...service.cardImage}
              className="absolute top-0 left-0 h-[14rem] w-full scale-100 transform object-cover opacity-100"
              priority={shouldPrioritize}
              width={400} // Optimized for mobile card size
              height={224} // 14rem = 224px
            />
          </div>
        </div>
        <AirImage
          {...service.cardImage}
          className={`absolute inset-0 hidden transform object-cover transition-all duration-0 ease-in-out md:block md:group-hover:scale-100 md:group-hover:opacity-100 md:group-hover:duration-800 ${
            isActive ? 'md:scale-100 md:opacity-100' : 'md:scale-110 md:opacity-0'
          }`}
          priority={shouldPrioritize}
          width={600} // Optimized for desktop card size
          height={400} // Maintain aspect ratio
        />
        <Box direction="col" className="relative z-10 h-full md:justify-end">
          <Box
            direction="col"
            className={`relative z-10 mt-[60%] translate-y-0 transform bg-transparent px-[2rem] pt-[3.75rem] transition-all duration-500 ease-in-out md:mt-0 md:pt-[2rem] md:group-hover:translate-y-0 md:before:absolute md:before:inset-0 md:before:bg-gradient-to-b md:before:from-[#D84500] md:before:to-[#CC4000] md:before:opacity-0 md:before:transition-opacity md:before:duration-500 ${
              isActive
                ? 'md:bg-primary md:translate-y-0 md:before:opacity-100'
                : 'md:translate-y-[5.25rem] md:bg-transparent md:before:opacity-0'
            }`}
          >
            <h3
              className="text-headline-md md:text-headline-md relative z-10 mb-[1rem] text-white"
              style={{
                fontSize: '1.75rem',
                fontWeight: 400,
                lineHeight: '130%',
                color: '#FFF'
              }}
            >
              {service.cardTitle}
            </h3>
            {service.cardTags?.map((tag, index) => (
              <Fragment key={index}>
                <p className="relative z-10 text-white">{tag}</p>
                {index < (service.cardTags?.length ?? 0) - 1 && (
                  <hr className="relative z-10 my-2 border-t border-gray-300" />
                )}
              </Fragment>
            ))}
            <Box direction="col" className="relative z-10 mt-6 pb-[2rem]">
              <Link href={`/services/${service.slug}`} className="w-full">
                <Button variant="outlineTrasparentWhite" className="w-full">
                  {service.cardButtonText}
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </div>
    </ErrorBoundary>
  );
}
