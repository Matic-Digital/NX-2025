import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { getEventSEOBySlug } from '@/lib/contentful-seo-api';
import {
  extractCanonicalUrl,
  extractIndexing,
  extractOpenGraphDescription,
  extractOpenGraphImage,
  extractOpenGraphTitle,
  extractSEODescription,
  extractSEOTitle
} from '@/lib/metadata-utils';
import { generateSchema } from '@/lib/schema-generator';

import { getAllEventsMinimal, getEventBySlug } from '@/components/Event/EventApi';
import { EventDetail } from '@/components/Event/EventDetail';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { JsonLdSchema } from '@/components/Schema/JsonLdSchema';

import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';
import type { ContentfulPageSEO } from '@/lib/metadata-utils';

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
        slug: event.slug ?? ''
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: EventPageProps) {
  const resolvedParams = await params;
  const eventSEO = (await getEventSEOBySlug(resolvedParams.slug ?? '', false)) as Record<
    string,
    unknown
  >;

  if (!eventSEO) {
    return {
      title: 'Event Not Found'
    };
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  const eventUrl = `${baseUrl}/events/${resolvedParams.slug}`;

  // Create default description with event date
  const eventData = eventSEO as ContentfulPageSEO & { title?: string; dateTime?: string };
  const defaultDescription = `Join us for ${eventData?.title ?? ''} on ${eventData?.dateTime ? new Date(eventData.dateTime).toLocaleDateString() : ''}`;

  // Extract SEO data using utility functions
  const title = extractSEOTitle(eventSEO, eventData?.title ?? 'Nextracker Event');
  const description = extractSEODescription(eventSEO, defaultDescription);
  const ogTitle = extractOpenGraphTitle(eventSEO, title);
  const ogDescription = extractOpenGraphDescription(eventSEO, description);
  const canonicalUrl = extractCanonicalUrl(eventSEO);
  const shouldIndex = extractIndexing(eventSEO, true);

  // Handle OG image from Event SEO data
  const openGraphImage = extractOpenGraphImage(eventSEO, baseUrl, title);

  const ogImages = openGraphImage
    ? [
        {
          url: openGraphImage.url,
          width: openGraphImage.width,
          height: openGraphImage.height,
          alt: openGraphImage.title ?? ogTitle
        }
      ]
    : [];

  return {
    title,
    description,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex
      }
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
      type: 'article',
      siteName: 'Nextracker',
      url: eventUrl
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: openGraphImage ? [openGraphImage.url] : []
    },
    alternates: {
      canonical: canonicalUrl ?? eventUrl
    }
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

  // Generate schema for the event
  const eventPath = `/events/${resolvedParams.slug}`;
  const eventSchema = generateSchema('event', event, eventPath);

  return (
    <>
      <JsonLdSchema schema={eventSchema} id="event-schema" />
      <EventDetail event={event} header={header} footer={footer} />
    </>
  );
}
