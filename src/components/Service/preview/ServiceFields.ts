import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Service } from '@/components/Service/ServiceSchema';

export const serviceFields: FieldConfig<Partial<Service>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description:
      'The main title of the service. This appears as the primary heading and is used for navigation.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    description:
      'URL-friendly identifier for the service. Used in the page URL and for linking to this service.',
    color: 'blue',
    getValue: (data) => {
      if (data.slug) {
        return `"${data.slug}" (URL: /services/${data.slug})`;
      }
      return 'Not set';
    }
  }
];
