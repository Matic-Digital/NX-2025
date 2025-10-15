import type { ContentGridItem } from '@/components/ContentGrid/ContentGridItemSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const contentGridItemFields: FieldConfig<Partial<ContentGridItem>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the content grid item.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description: 'Optional variant identifier for specialized styling.',
    color: 'pink',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Not set')
  },
  {
    name: 'heading',
    label: 'Heading',
    required: true,
    description: 'The heading text for the content grid item.',
    color: 'blue',
    getValue: (data) => (data.heading ? `"${data.heading}"` : 'Not set')
  },
  {
    name: 'subHeading',
    label: 'Sub Heading',
    required: false,
    description: 'Optional sub heading text for the content grid item.',
    color: 'blue',
    getValue: (data) => (data.subHeading ? `"${data.subHeading}"` : 'Not set')
  },
  {
    name: 'ctaCollection',
    label: 'CTA Collection',
    required: false,
    description: 'Collection of call-to-action buttons.',
    color: 'indigo',
    getValue: (data) =>
      data.ctaCollection?.items ? `${data.ctaCollection.items.length} CTA(s) configured` : 'Not set'
  },
  {
    name: 'link',
    label: 'Link',
    required: false,
    description: 'Optional link for the content grid item.',
    color: 'indigo',
    getValue: (data) => (data.link ? `Link configured (${data.link})` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'Optional description text for the content grid item.',
    color: 'purple',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },
  {
    name: 'icon',
    label: 'Icon',
    required: false,
    description: 'Optional icon asset for the content grid item.',
    color: 'orange',
    getValue: (data) =>
      data.icon ? `Asset configured (${data.icon.title ?? 'Untitled'})` : 'Not set'
  },
  {
    name: 'image',
    label: 'Image',
    required: false,
    description: 'Optional image for the content grid item.',
    color: 'cyan',
    getValue: (data) =>
      data.image ? `Image configured (${data.image.title ?? 'Untitled'})` : 'Not set'
  }
];
