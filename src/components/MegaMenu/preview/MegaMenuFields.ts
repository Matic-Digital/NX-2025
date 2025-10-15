import type { MegaMenu } from '@/components/MegaMenu/MegaMenuSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const megaMenuFields: FieldConfig<Partial<MegaMenu>>[] = [
  {
    name: 'overflow',
    label: 'Overflow',
    required: false,
    description: 'Whether this is an overflow menu.',
    color: 'blue',
    getValue: (data) => (data.overflow !== undefined ? `${data.overflow}` : 'Not set')
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the mega menu.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },

  {
    name: 'itemsCollection',
    label: 'Menu Items',
    required: false,
    description: 'Collection of menu items.',
    color: 'purple',
    getValue: (data) =>
      data.itemsCollection?.items
        ? `${data.itemsCollection.items.length} item(s) configured`
        : 'Not set'
  },
  {
    name: 'contentfulMetadata',
    label: 'Tags',
    required: false,
    description: 'Contentful metadata tags.',
    color: 'orange',
    getValue: (data) =>
      data.contentfulMetadata?.tags
        ? `${data.contentfulMetadata.tags.length} tag(s) configured`
        : 'Not set'
  }
];
