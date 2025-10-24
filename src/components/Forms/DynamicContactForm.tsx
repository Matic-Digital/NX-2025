'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the heavy ContactForm component with intersection observer
const ContactForm = dynamic(
  () => import('./ContactForm').then((mod) => ({ default: mod.ContactForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <span className="text-sm text-muted-foreground">Loading contact form...</span>
        </div>
      </div>
    ),
    ssr: false // Load only on client side to reduce server bundle
  }
);

// Dynamically import HubspotForm with better loading state
const HubspotForm = dynamic(
  () => import('./HubspotForm/HubspotForm').then((mod) => ({ default: mod.HubspotForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <span className="text-sm text-muted-foreground">Loading form...</span>
        </div>
      </div>
    ),
    ssr: false // Load only on client side to reduce server bundle
  }
);

export { ContactForm as DynamicContactForm, HubspotForm as DynamicHubspotForm };
