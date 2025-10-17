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
  }
];
