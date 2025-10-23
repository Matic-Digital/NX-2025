import type { OfficeLocation } from '@/components/OfficeLocation/OfficeLocationSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const officeLocationFields: FieldConfig<Partial<OfficeLocation>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the office location.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'image',
    label: 'Image',
    required: true,
    description: 'The office location image.',
    color: 'orange',
    getValue: (data) => (data.image?.link ? `Link: ${data.image.link}` : 'Not set')
  },

  {
    name: 'country',
    label: 'Country',
    required: true,
    description: 'The country where the office is located.',
    color: 'blue',
    getValue: (data) => (data.country ? `"${data.country}"` : 'Not set')
  },
  {
    name: 'city',
    label: 'City',
    required: true,
    description: 'The city where the office is located.',
    color: 'purple',
    getValue: (data) => (data.city ? `"${data.city}"` : 'Not set')
  },
  {
    name: 'state',
    label: 'State',
    required: false,
    description: 'The state where the office is located (optional).',
    color: 'cyan',
    getValue: (data) => (data.state ? `"${data.state}"` : 'Not set')
  },
  {
    name: 'address',
    label: 'Address',
    required: true,
    description: 'The street address of the office.',
    color: 'indigo',
    getValue: (data) => (data.address ? `"${data.address}"` : 'Not set')
  },
  {
    name: 'phone',
    label: 'Phone',
    required: false,
    description: 'The phone number of the office (optional).',
    color: 'pink',
    getValue: (data) => (data.phone ? `"${data.phone}"` : 'Not set')
  }
];
