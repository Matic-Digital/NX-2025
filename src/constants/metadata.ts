/**
 * Default metadata values used across the application
 */

export const DEFAULT_METADATA = {
  title: 'Nextracker',
  description: 'Nextracker Website 2025',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    siteName: 'Nextracker'
  }
};

export const DEFAULT_TWITTER_CARD = {
  card: 'summary_large_image',
  site: '@nextracker'
};

export const DEFAULT_OG_IMAGE = {
  url: 'https://example.com/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Nextracker'
};
