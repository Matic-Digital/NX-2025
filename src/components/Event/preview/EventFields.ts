import type { Event } from '@/components/Event/EventSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const eventFields: FieldConfig<Partial<Event>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the event.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'template',
    label: 'Template',
    required: true,
    description: 'The layout template for the event detail page.',
    color: 'purple',
    getValue: (data) => (data.template ? `"${data.template}"` : 'Not set')
  },
  {
    name: 'dateTime',
    label: 'Date & Time',
    required: true,
    description: 'The date and time of the event.',
    color: 'blue',
    getValue: (data) => (data.dateTime ? `"${data.dateTime}"` : 'Not set')
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    description: 'The URL slug for the event details page.',
    color: 'indigo',
    getValue: (data) => (data.slug ? `"${data.slug}"` : 'Not set')
  },
  {
    name: 'bannerImage',
    label: 'Banner Image',
    required: false,
    description: 'The main banner image for the event.',
    color: 'orange',
    getValue: (data) => (data.bannerImage?.link ? 'Image set' : 'Not set')
  },
  {
    name: 'mainImage',
    label: 'Main Image',
    required: false,
    description: 'The main content image for the event.',
    color: 'yellow',
    getValue: (data) => (data.mainImage ? 'Image set' : 'Not set')
  },
  {
    name: 'contactHeadline',
    label: 'Contact Headline',
    required: false,
    description: 'Headline for the contact section.',
    color: 'cyan',
    getValue: (data) => (data.contactHeadline ? `"${data.contactHeadline}"` : 'Not set')
  },
  {
    name: 'officeLocation',
    label: 'Office Location',
    required: false,
    description: 'Linked office location for contact section.',
    color: 'indigo',
    getValue: (data) => (data.officeLocation?.sys?.id ? 'Location linked' : 'Not set')
  },
  {
    name: 'contactCardsCollection',
    label: 'Contact Cards',
    required: false,
    description: 'Collection of contact cards.',
    color: 'pink',
    getValue: (data) => {
      const count = data.contactCardsCollection?.items?.length ?? 0;
      return count > 0 ? `${count} contact card(s)` : 'Not set';
    }
  },
  {
    name: 'referencedPostsCollection',
    label: 'Referenced Posts',
    required: false,
    description: 'Collection of referenced blog posts.',
    color: 'purple',
    getValue: (data) => {
      const count = data.referencedPostsCollection?.items?.length ?? 0;
      return count > 0 ? `${count} referenced post(s)` : 'Not set';
    }
  },
  {
    name: 'slider',
    label: 'Slider',
    required: false,
    description: 'Linked slider component.',
    color: 'red',
    getValue: (data) => (data.slider?.sys?.id ? 'Slider linked' : 'Not set')
  },
  {
    name: 'formCta',
    label: 'Form CTA',
    required: false,
    description: 'HubSpot form for call-to-action.',
    color: 'green',
    getValue: (data) => (data.formCta?.sys?.id ? 'Form linked' : 'Not set')
  }
];
