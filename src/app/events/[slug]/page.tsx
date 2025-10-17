import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import { getEventBySlug, getAllEventsMinimal } from '@/components/Event/EventApi';
import { EventDetail } from '@/components/Event/EventDetail';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';

import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const eventsResponse = await getAllEventsMinimal();
    
    return eventsResponse.items
      .filter((event) => event.slug && typeof event.slug === 'string')
      .map((event) => ({
        slug: event.slug ?? '',
      }));
  } catch (error) {
    console.error('Error generating static params for events:', error);
    return [];
  }
}

export async function generateMetadata({ params }: EventPageProps) {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.slug ?? '');
  
  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: event.title ?? '',
    description: `Join us for ${event.title ?? ''} on ${new Date(event.dateTime ?? '').toLocaleDateString()}`,
    openGraph: {
      title: event.title ?? '',
      description: `Join us for ${event.title ?? ''} on ${new Date(event.dateTime ?? '').toLocaleDateString()}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title ?? '',
      description: `Join us for ${event.title ?? ''} on ${new Date(event.dateTime ?? '').toLocaleDateString()}`,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;
  const { isEnabled } = await draftMode();
  const event = await getEventBySlug(resolvedParams.slug ?? '', isEnabled);

  if (!event) {
    notFound();
  }

  // Fetch header and footer if layout is present
  let header: Header | null = null;
  let footer: Footer | null = null;

  if (event.layout) {
    const pageLayout = event.layout as {
      header?: { sys?: { id: string } };
      footer?: { sys?: { id: string } };
    };

    if (pageLayout.header?.sys?.id) {
      header = await getHeaderById(pageLayout.header.sys.id, isEnabled);
    }
    if (pageLayout.footer?.sys?.id) {
      footer = await getFooterById(pageLayout.footer.sys.id, isEnabled);
    }
  }

  return <EventDetail event={event} header={header} footer={footer} />;
}
