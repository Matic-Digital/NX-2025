'use client';

import * as React from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import AirImage from '@/components/media/AirImage';
import type { Service } from '@/types/contentful/Service';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { useServiceCard } from '@/contexts/ServiceCardContext';

interface ServiceCardProps extends Service {
  cardId: string;
  isFirst?: boolean;
}

export function ServiceCard(props: ServiceCardProps) {
  const { cardId, isFirst = false, ...serviceProps } = props;
  const service = useContentfulLiveUpdates(serviceProps);
  const { activeCardId, setActiveCardId } = useServiceCard();

  // Set first card as active on mount if no card is active
  React.useEffect(() => {
    if (isFirst && activeCardId === null) {
      setActiveCardId(cardId);
    }
  }, [isFirst, cardId, activeCardId, setActiveCardId]);

  const isActive = activeCardId === cardId;

  const handleMouseEnter = () => {
    setActiveCardId(cardId);
  };

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
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <AirImage
          {...service.cardImage}
          className={`absolute inset-0 transform object-cover transition-all duration-0 ease-in-out group-hover:scale-100 group-hover:opacity-100 group-hover:duration-800 ${
            isActive ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
          }`}
        />
        <Box direction="col" className="relative z-10 h-full justify-end">
          <Box
            direction="col"
            className={`group-hover:bg-primary relative z-10 transform px-[2rem] pt-[2rem] transition-all duration-500 ease-in-out group-hover:translate-y-0 ${
              isActive ? 'bg-primary translate-y-0' : 'translate-y-[5.25rem] bg-transparent'
            }`}
          >
            <h3 className="text-headline-md mb-[1rem] text-white">{service.cardTitle}</h3>
            {service.cardTags?.map((tag, index) => (
              <React.Fragment key={index}>
                <p className="text-white">{tag}</p>
                {index < (service.cardTags?.length ?? 0) - 1 && (
                  <hr className="my-2 border-t border-gray-300" />
                )}
              </React.Fragment>
            ))}
            <Box direction="col" className="z-10 mt-6 pb-[2rem]">
              <Link href={`/services/${service.slug}`}>
                <Button variant="outlineWhite">{service.cardButtonText}</Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </div>
    </ErrorBoundary>
  );
}
