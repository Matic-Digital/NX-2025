'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { cn } from '@/lib/utils';

import { ServiceCard } from '@/components/Service/ServiceCard';

import type { ContentGridItemUnion } from '@/lib/component-grid/utils';

interface ServiceCarouselProps {
  services: ContentGridItemUnion[];
  className?: string;
}

export function ServiceCarousel({ services, className }: ServiceCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { active: false }
    }
  });

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pl-4">
            {services.map((service, index) => {
              const isFirstService = index === 0;
              return (
                <div key={service.sys?.id ?? `service-${index}`} className="min-w-0 flex-[0_0_80%]">
                  <ServiceCard
                    cardId={service.sys?.id ?? `service-${index}`}
                    isFirst={isFirstService}
                    serviceId={service.sys?.id ?? `service-${index}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="mt-4 flex justify-center gap-2">
          {services.map((_, index) => (
            <button
              key={index}
              className="h-2 w-2 rounded-full bg-gray-300 transition-colors duration-200 hover:bg-gray-400"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const isFirstService = index === 0;
          return (
            <ServiceCard
              key={service.sys?.id ?? `service-${index}`}
              cardId={service.sys?.id ?? `service-${index}`}
              isFirst={isFirstService}
              serviceId={service.sys?.id ?? `service-${index}`}
            />
          );
        })}
      </div>
    </div>
  );
}
