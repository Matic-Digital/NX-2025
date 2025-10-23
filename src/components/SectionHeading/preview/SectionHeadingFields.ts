import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { SectionHeading } from '@/components/SectionHeading/SectionHeadingSchema';

export const sectionHeadingFields: FieldConfig<Partial<SectionHeading>>[] = [
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description:
      'Controls the visual layout and styling. Options: Horizontal, Stacked, Centered, Default.',
    color: 'orange',
    getValue: (data) => data.variant ?? 'Default'
  },
  {
    name: 'icon',
    label: 'Icon',
    required: false,
    description: 'Optional icon asset to display with the heading.',
    color: 'cyan',
    getValue: (data) => (data.icon ? `Asset (${data.icon.title ?? 'Untitled'})` : 'Not set')
  },
  {
    name: 'overline',
    label: 'Overline',
    required: false,
    description:
      'Small text that appears above the main title. Used for context or categorization.',
    color: 'blue',
    getValue: (data) => (data.overline ? `"${data.overline}"` : 'Not set')
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The main heading text. This is the primary content that users will see.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'Supporting text that provides additional context or details about the section.',
    color: 'purple',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },

  {
    name: 'ctaCollection',
    label: 'CTA Collection',
    required: false,
    description:
      'Call-to-action buttons that can link to pages or trigger modals. Maximum of 2 buttons.',
    color: 'indigo',
    getValue: (data) =>
      data.ctaCollection?.items && data.ctaCollection.items.length > 0
        ? `${data.ctaCollection.items.length} button(s) configured`
        : 'No buttons set'
  }
];
