import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Product } from '@/components/Product/ProductSchema';

export const productFields: FieldConfig<Partial<Product>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the product.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    description: 'The URL slug for the product.',
    color: 'blue',
    getValue: (data) => (data.slug ? `"${data.slug}"` : 'Not set')
  },
  {
    name: 'tags',
    label: 'Tags',
    required: false,
    description: 'Tags associated with the product.',
    color: 'purple',
    getValue: (data) => (data.tags && data.tags.length > 0 ? data.tags.join(', ') : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'A description of the product.',
    color: 'cyan',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },
  {
    name: 'icon',
    label: 'Icon',
    required: false,
    description: 'The icon asset for the product.',
    color: 'orange',
    getValue: (data) => (data.icon ? `Asset (${data.icon.title ?? 'Untitled'})` : 'Not set')
  },
  {
    name: 'image',
    label: 'Image',
    required: false,
    description: 'The main image for the product.',
    color: 'pink',
    getValue: (data) => (data.image?.link ? `Link: ${data.image.link}` : 'Not set')
  },
  {
    name: 'pageLayout',
    label: 'Page Layout',
    required: false,
    description: 'The page layout configuration for the product.',
    color: 'yellow',
    getValue: (data) => (data.pageLayout ? 'Page layout configured' : 'Not set')
  },
  {
    name: 'itemsCollection',
    label: 'Items Collection',
    required: false,
    description: 'Collection of content items for the product page.',
    color: 'indigo',
    getValue: (data) =>
      data.itemsCollection?.items && data.itemsCollection.items.length > 0
        ? `${data.itemsCollection.items.length} item(s)`
        : 'Not set'
  }
];
