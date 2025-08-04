'use client';

import * as React from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import AirImage from '@/components/media/AirImage';
import type { Service } from '@/types/contentful/Service';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';

export function ServiceCard(props: Service) {
  const service = useContentfulLiveUpdates(props);

  return (
    <ErrorBoundary>
      <div
        className="group hover:bg-primary relative z-10 min-h-[31.125rem] backdrop-blur transition-all duration-300 ease-in-out"
        style={{
          background:
            'linear-gradient(198deg, rgba(8, 8, 15, 0.02) -1.13%, rgba(8, 8, 15, 0.05) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
        }}
      >
        <div className="bg-primary absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
        <Box direction="col" className="relative z-10 h-full justify-between" gap={2}>
          <AirImage
            {...service.cardImage}
            className="z-10 min-h-[11.3rem] object-cover opacity-0 group-hover:opacity-100"
          />
          <Box direction="col" className="relative z-10 p-[2rem]">
            <h3 className="text-headline-md mb-[1rem] text-white">{service.cardTitle}</h3>
            {service.cardTags?.map((tag, index) => (
              <React.Fragment key={index}>
                <p className="text-white">{tag}</p>
                {index < (service.cardTags?.length ?? 0) - 1 && (
                  <hr className="my-2 border-t border-gray-300" />
                )}
              </React.Fragment>
            ))}
          </Box>
          <Box direction="col" className="z-10 hidden pb-[2rem] pl-[2rem] group-hover:flex">
            <Link href={`/services/${service.slug}`}>
              <Button variant="outlineWhite">{service.cardButtonText}</Button>
            </Link>
          </Box>
        </Box>
      </div>
    </ErrorBoundary>
  );
}
