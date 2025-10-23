import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { RichContent } from '@/components/RichContent/RichContentSchema';

export const richContentFields: FieldConfig<Partial<RichContent>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: false,
    description: 'The title of the rich content section (optional).',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'tableOfContents',
    label: 'Table of Contents',
    required: false,
    description: 'Whether to display a table of contents.',
    color: 'purple',
    getValue: (data) => (data.tableOfContents ? 'Enabled' : 'Disabled')
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description: 'The variant style for the rich content.',
    color: 'blue',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Not set')
  },
  {
    name: 'legalContent',
    label: 'Legal Content',
    required: false,
    description: 'Additional legal content in rich text format (optional).',
    color: 'cyan',
    getValue: (data) => (data.legalContent?.json ? 'Legal content configured' : 'Not set')
  },
  {
    name: 'content',
    label: 'Content',
    required: true,
    description: 'The rich text content.',
    color: 'orange',
    getValue: (data) => (data.content?.json ? 'Rich text content configured' : 'Not set')
  }
];
