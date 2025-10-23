import type { AirImage } from '@/components/Image/ImageSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const imageFields: FieldConfig<Partial<AirImage>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the image.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'link',
    label: 'Image URL',
    required: true,
    description: 'The URL of the image.',
    color: 'blue',
    getValue: (data) => (data.link ? `"${data.link}"` : 'Not set')
  },
  {
    name: 'altText',
    label: 'Alt Text',
    required: false,
    description: 'Alternative text for accessibility.',
    color: 'purple',
    getValue: (data) => (data.altText ? `"${data.altText}"` : 'Not set')
  }
];
