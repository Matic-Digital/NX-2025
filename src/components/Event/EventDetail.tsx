import { formatDateRange, formatDate } from '@/lib/utils';

import { AgendaList } from '@/components/AgendaItem/AgendaItem';
import { PageLayout } from '@/components/PageLayout/PageLayout';

import type { Event } from '@/components/Event/EventSchema';
import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';
import { Container } from '../global/matic-ds';
import { AirImage } from '../Image/AirImage';
import Image from 'next/image';

interface EventDetailWithLayoutProps {
  event: Event;
  header?: Header | null;
  footer?: Footer | null;
}

export function EventDetail({ event, header = null, footer = null }: EventDetailWithLayoutProps) {
  const _formattedDateTime = formatDateRange(event.dateTime, event.endDateTime ?? undefined, true);
  
  // Format date and time separately for two-line display
  const formattedDate = formatDate(event.dateTime ?? '', false); // Just the date
  const formatTimeRange = (startDateString: string, endDateString?: string): string => {
    const startDate = new Date(startDateString);
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Check if endDateString exists and is not empty
    if (!endDateString || endDateString.trim() === '') {
      // If no end time, include timezone on start time
      const startTimeWithTz = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
      return `from ${startTimeWithTz}`;
    }
    
    const endDate = new Date(endDateString);
    
    // Check if the end date is valid
    if (isNaN(endDate.getTime())) {
      const startTimeWithTz = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
      return `from ${startTimeWithTz}`;
    }
    
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
    
    return `from ${startTime} to ${endTime}`;
  };
  
  const formattedTimeRange = formatTimeRange(event.dateTime, event.endDateTime);
  
  // Debug: Log the event data to see if endDateTime is present
  console.log('Event data:', { 
    dateTime: event.dateTime, 
    endDateTime: event.endDateTime,
    hasEndDateTime: !!event.endDateTime 
  });

  // Render based on template type
  switch (event.template as string) {
    case 'Agenda':
      return (
        <PageLayout header={header} footer={footer}>
          <div className='h-[28.64rem] flex flex-col mb-[3rem] relative overflow-hidden'>
            {/* Background Image */}
            {event.bannerImage?.link ? (
              <AirImage 
                link={event.bannerImage.link} 
                altText={event.bannerImage.altText ?? event.bannerImage.title ?? 'Event banner'} 
                className="w-full h-full absolute inset-0 z-0 object-cover"
              />
            ) : (
              <div className="w-full h-full absolute inset-0 z-0 bg-blue-500" />
            )}
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 z-10 bg-black/30" />
            
            {/* Content */}
            <Container className='flex-grow flex flex-col pb-[3rem] relative z-20'>
              <div className='flex-grow flex flex-col justify-end'>
                  <h1 className='text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg'>{event.title ?? ''}</h1>
                  <h2 className='text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg'>Nextracker Agenda</h2>
              </div>
            </Container>
          </div>
          <Container>
            {/* Event Header */}
            <div className="flex flex-col md:flex-row gap-[1.25rem] mb-[4rem] z-10">
              {/* Date & Time */}
              <div className="bg-subtle items-start flex-grow p-[2.5rem] min-h-[13.1875rem] md:items-center flex gap-[1.25rem]">
                {event.dateIcon && (
                  <div className="bg-black p-[0.58rem] h-fit">
                      <Image 
                        src={event.dateIcon.url ?? ''}
                        alt={event.dateIcon.description ?? 'Date icon'}
                        width={event.dateIcon.width ?? 24}
                        height={event.dateIcon.height ?? 24}
                        className=""
                      />
                  </div>
                )}
                <div className="flex flex-col gap-[0.5rem]">
                  <time className="text-4xl font-normal leading-[120%]" dateTime={event.dateTime ?? ''}>
                    {formattedDate}
                  </time>
                  <div className="text-2xl font-normal leading-[120%]">
                    {formattedTimeRange}
                  </div>
                </div>
              </div>

              {/* Address */}
              {event.address && (
                <div className="flex-grow bg-subtle items-start flex md:items-center min-h-[13.1875rem] gap-[1.25rem] p-[2.5rem]">
                  {event.addressIcon && (
                    <div className="bg-black p-[0.58rem] h-fit">
                      <Image 
                        src={event.addressIcon.url ?? ''}
                        alt={event.addressIcon.description ?? 'Address icon'}
                        width={event.addressIcon.width ?? 24}
                        height={event.addressIcon.height ?? 24}
                        className=""
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-[0.5rem]">
                    <div className="text-4xl font-normal leading-[120%]">{event.address ?? ''}</div>
                    {event.addressSubline && (
                      <div className="text-2xl font-normal leading-[120%]">{event.addressSubline ?? ''}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Agenda Section - Only shown on Agenda template */}
            {event.agendaItemsCollection?.items && event.agendaItemsCollection.items.length > 0 && (
              <div className="mb-[7.5rem]">
                {event.agendaHeadline && (
                  <h2 className="text-[3rem] font-normal tracking-[-0.04rem] leading-[120%]">{event.agendaHeadline ?? ''}</h2>
                )}
                
                <AgendaList 
                  agendaItems={event.agendaItemsCollection?.items ?? []} 
                  className="py-[2rem]"
                />
                
                {event.agendaFooter && (
                  <p className="text-[1.25rem] font-normal leading-[120%]">{event.agendaFooter ?? ''}</p>
                )}
              </div>
            )}
          </Container>
        </PageLayout>
      );

    case 'Landing 1':
      return (
        <PageLayout header={header} footer={footer}>
          <Container>
            <h1 className="text-[3.75rem] font-normal tracking-[-0.0375rem] leading-[120%] mb-8">{event.title ?? ''}</h1>
            
            {/* Landing 1 specific layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Date & Time */}
              <div className="bg-subtle p-[2.5rem]">
                <div className="flex items-center gap-[1.25rem]">
                  {event.dateIcon && (
                    <div className="bg-black p-[0.58rem]">
                      <Image 
                        src={event.dateIcon.url ?? ''}
                        alt={event.dateIcon.description ?? 'Date icon'}
                        width={event.dateIcon.width ?? 24}
                        height={event.dateIcon.height ?? 24}
                        className=""
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-[0.5rem]">
                    <time className="text-2xl font-normal leading-[120%]" dateTime={event.dateTime ?? ''}>
                      {formattedDate}
                    </time>
                    <div className="text-lg font-normal leading-[120%]">
                      {formattedTimeRange}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {event.address && (
                <div className="bg-subtle p-[2.5rem]">
                  <div className="flex items-center gap-[1.25rem]">
                    {event.addressIcon && (
                      <div className="bg-black p-[0.58rem]">
                        <Image 
                          src={event.addressIcon.url ?? ''}
                          alt={event.addressIcon.description ?? 'Address icon'}
                          width={event.addressIcon.width ?? 24}
                          height={event.addressIcon.height ?? 24}
                          className=""
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-[0.5rem]">
                      <div className="text-2xl font-normal leading-[120%]">{event.address ?? ''}</div>
                      {event.addressSubline && (
                        <div className="text-lg font-normal leading-[120%]">{event.addressSubline ?? ''}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </PageLayout>
      );

    case 'Landing 2':
      return (
        <PageLayout header={header} footer={footer}>
          <Container>
            {/* Landing 2 specific layout - centered hero style */}
            <div className="text-center mb-12">
              <h1 className="text-[4.5rem] font-normal tracking-[-0.045rem] leading-[120%] mb-6">{event.title ?? ''}</h1>
              
              <div className="max-w-2xl mx-auto">
                <time className="text-3xl font-normal leading-[120%] block mb-4" dateTime={event.dateTime ?? ''}>
                  {formattedDate}
                </time>
                <div className="text-xl font-normal leading-[120%] mb-6">
                  {formattedTimeRange}
                </div>
                
                {event.address && (
                  <div className="text-xl font-normal leading-[120%]">
                    {event.address}
                    {event.addressSubline && (
                      <div className="text-lg font-normal leading-[120%] mt-2">{event.addressSubline ?? ''}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </PageLayout>
      );

    case 'Landing 3':
      return (
        <PageLayout header={header} footer={footer}>
          <div className='h-[40.75rem] flex flex-col mb-[3rem] relative overflow-hidden'>
            {/* Background Image */}
            {event.bannerImage?.link ? (
              <AirImage 
                link={event.bannerImage.link} 
                altText={event.bannerImage.altText ?? event.bannerImage.title ?? 'Event banner'} 
                className="w-full h-full absolute inset-0 z-0 object-cover"
              />
            ) : (
              <div className="w-full h-full absolute inset-0 z-0 bg-blue-500" />
            )}
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 z-10 bg-black/30" />
            
            {/* Content */}
            <Container className='flex-grow flex flex-col pb-[3rem] relative z-20'>
              <div className='flex-grow flex flex-col justify-end'>
                  <h1 className='text-[3rem] text-white font-normal tracking-[-0.03rem] leading-[120%] drop-shadow-lg mb-8'>{event.title ?? ''}</h1>
              </div>
            </Container>
          </div>
          <Container>
            {/* Landing 3 specific layout - minimal style */}
            <div className="max-w-4xl mx-auto">
              <div className="border-l-4 border-blue-500 pl-6 mb-8">
                <time className="text-2xl font-normal leading-[120%] block mb-2" dateTime={event.dateTime ?? ''}>
                  {formattedDate}
                </time>
                <div className="text-lg font-normal leading-[120%] text-gray-600">
                  {formattedTimeRange}
                </div>
              </div>
              
              {event.address && (
                <div className="border-l-4 border-gray-300 pl-6">
                  <div className="text-xl font-normal leading-[120%]">{event.address}</div>
                  {event.addressSubline && (
                    <div className="text-lg font-normal leading-[120%] text-gray-600 mt-1">{event.addressSubline ?? ''}</div>
                  )}
                </div>
              )}
            </div>
          </Container>
        </PageLayout>
      );

    default:
      // Fallback to Landing 1 if template is not recognized
      return (
        <PageLayout header={header} footer={footer}>
          <Container>
            <h1 className="text-[3.75rem] font-normal tracking-[-0.0375rem] leading-[120%] mb-8">{event.title ?? ''}</h1>
            <p className="text-lg text-gray-600 mb-8">Unknown template: {event.template ?? 'undefined'}</p>
            
            {/* Basic event info as fallback */}
            <div className="bg-subtle p-[2.5rem] mb-8">
              <time className="text-2xl font-normal leading-[120%] block mb-2" dateTime={event.dateTime ?? ''}>
                {formattedDate}
              </time>
              <div className="text-lg font-normal leading-[120%]">
                {formattedTimeRange}
              </div>
            </div>
          </Container>
        </PageLayout>
      );
  }
}
