'use client';

import { useEffect, useState, Fragment } from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import AirImage from '@/components/media/AirImage';
import type { Service } from '@/types/contentful/Service';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { useServiceCard } from '@/contexts/ServiceCardContext';
import { getServiceById } from '@/lib/contentful-api/service';

interface ServiceCardProps {
  serviceId: string;
  cardId: string;
  isFirst?: boolean;
}

export function ServiceCard(props: ServiceCardProps) {
  const { serviceId, cardId, isFirst = false } = props;
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const service = useContentfulLiveUpdates(serviceData);
  const { activeCardId, setActiveCardId } = useServiceCard();

  // Fetch service data
  useEffect(() => {
    async function fetchServiceData() {
      try {
        setLoading(true);
        const data = await getServiceById(serviceId);
        setServiceData(data);
      } catch (error) {
        console.error('Error fetching service data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      void fetchServiceData();
    }
  }, [serviceId]);

  // Set first card as active on mount if no card is active
  useEffect(() => {
    if (isFirst && activeCardId === null) {
      setActiveCardId(cardId);
    }
  }, [isFirst, cardId, activeCardId, setActiveCardId]);

  const isActive = activeCardId === cardId;

  const handleMouseEnter = () => {
    setActiveCardId(cardId);
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
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
        <div className="absolute top-0 right-0 left-0 h-[60%] opacity-100">
          <AirImage
            {...service.cardImage}
            className="absolute inset-0 scale-100 transform object-cover opacity-100"
          />
        </div>
        <Box direction="col" className="relative z-10 h-full">
          <Box
            direction="col"
            className="relative z-10 mt-[55%] translate-y-0 transform bg-transparent px-[2rem] pt-[3.75rem] md:pt-[2rem]"
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
