import type { AccordionItem } from '@/components/Accordion/AccordionSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const accordionItemFields: FieldConfig<Partial<AccordionItem>>[] = [
  {
    name: 'backgroundImage',
    label: 'Background Image',
    required: false,
    description: 'Optional background image that appears behind the accordion item content.',
    color: 'cyan',
    getValue: (data) =>
      data.backgroundImage ? `Background configured (${data.backgroundImage.sys.id})` : 'Not set'
  },
  {
    name: 'cta',
    label: 'CTA Button',
    required: false,
    description: 'Optional call-to-action button that appears within the accordion item content.',
    color: 'pink',
    getValue: (data) =>
      data.cta ? `Button configured: "${data.cta.text ?? 'No text'}"` : 'Not set'
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    description:
      'The content that appears when the accordion item is expanded. Supports rich text formatting.',
    color: 'purple',
    getValue: (data) =>
      data.description
        ? `"${data.description.substring(0, 100)}${data.description.length > 100 ? '...' : ''}"`
        : 'Not set'
  },
  {
    name: 'image',
    label: 'Image',
    required: true,
    description: 'Main image displayed within the accordion item content area.',
    color: 'orange',
    getValue: (data) => (data.image ? `Image configured (${data.image.sys.id})` : 'Not set')
  },
  {
    name: 'overline',
    label: 'Overline',
    required: false,
    description: 'Small text that appears above the title. Used for categorization or context.',
    color: 'blue',
    getValue: (data) => (data.overline ? `"${data.overline}"` : 'Not set')
  },
  {
    name: 'tags',
    label: 'Tags',
    required: false,
    description: 'Optional tags for categorization and filtering purposes.',
    color: 'yellow',
    getValue: (data) =>
      data.tags && data.tags.length > 0
        ? `${data.tags.length} tag(s): ${data.tags.join(', ')}`
        : 'Not set'
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description:
      'The main heading for this accordion item. This is what users click to expand the item.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description:
      'Layout variant that determines how content is positioned (ContentLeft, ContentTop, ContentRight).',
    color: 'indigo',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Not set')
  }
];
