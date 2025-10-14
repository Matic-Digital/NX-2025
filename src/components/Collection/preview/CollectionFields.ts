import type { Collection } from '@/components/Collection/CollectionSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const collectionFields: FieldConfig<Partial<Collection>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the collection that appears as the main heading.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'contentType',
    label: 'Content Type',
    required: false,
    description:
      'The type(s) of content to display in this collection (Post, Page, Product, Solution, Service).',
    color: 'blue',
    getValue: (data) =>
      data.contentType && data.contentType.length > 0
        ? `${data.contentType.length} type(s): ${data.contentType.join(', ')}`
        : 'Not set'
  },
  {
    name: 'itemsPerPage',
    label: 'Items Per Page',
    required: false,
    description: 'The number of items to display per page when pagination is enabled.',
    color: 'purple',
    getValue: (data) => (data.itemsPerPage ? `${data.itemsPerPage} items` : 'Not set')
  },
  {
    name: 'searchBar',
    label: 'Search Bar',
    required: false,
    description: 'Whether to display a search bar to filter collection items.',
    color: 'orange',
    getValue: (data) =>
      data.searchBar !== undefined ? (data.searchBar ? 'Enabled' : 'Disabled') : 'Not set'
  },
  {
    name: 'pagination',
    label: 'Pagination',
    required: false,
    description: 'Pagination style for the collection (Default).',
    color: 'cyan',
    getValue: (data) =>
      data.pagination && data.pagination.length > 0 ? `${data.pagination.join(', ')}` : 'Not set'
  },
  {
    name: 'contentfulMetadata',
    label: 'Tags',
    required: false,
    description: 'Contentful metadata tags for filtering and categorization.',
    color: 'indigo',
    getValue: (data) =>
      data.contentfulMetadata?.tags && data.contentfulMetadata.tags.length > 0
        ? `${data.contentfulMetadata.tags.length} tag(s): ${data.contentfulMetadata.tags.map((t) => t.name).join(', ')}`
        : 'Not set'
  }
];
