import type { ContactCard } from '@/components/ContactCard/ContactCardSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const contactCardFields: FieldConfig<Partial<ContactCard>>[] = [
  {
    name: 'icon',
    label: 'Icon',
    required: true,
    description:
      'The icon identifier that represents the contact method (e.g., phone, email, chat).',
    color: 'orange',
    getValue: (data) => (data.icon ? `"${data.icon}"` : 'Not set')
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The main title of the contact card that describes the contact method.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    description: 'The description text that provides additional details about the contact method.',
    color: 'purple',
    getValue: (data) =>
      data.description
        ? `"${data.description.substring(0, 100)}${data.description.length > 100 ? '...' : ''}"`
        : 'Not set'
  },
  {
    name: 'phone',
    label: 'Phone',
    required: false,
    description: 'Optional phone number for contact purposes.',
    color: 'yellow',
    getValue: (data) => (data.phone ? `"${data.phone}"` : 'Not set')
  },
  {
    name: 'email',
    label: 'Email',
    required: false,
    description: 'Optional email address for contact purposes.',
    color: 'cyan',
    getValue: (data) => (data.email ? `"${data.email}"` : 'Not set')
  },
  {
    name: 'cta',
    label: 'CTA Button',
    required: true,
    description: 'Optional call-to-action button that appears on the contact card.',
    color: 'pink',
    getValue: (data) =>
      data.cta ? `Button configured: "${data.cta.text ?? 'No text'}"` : 'Not set'
  }
];
