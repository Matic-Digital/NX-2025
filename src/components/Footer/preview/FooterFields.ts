import type { Footer } from '@/components/Footer/FooterSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const footerFields: FieldConfig<Partial<Footer>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the footer (internal use).',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'logo',
    label: 'Logo',
    required: false,
    description: 'The company logo image.',
    color: 'orange',
    getValue: (data) => (data.logo?.url ? `URL: ${data.logo.url}` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'Company description text.',
    color: 'blue',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },
  {
    name: 'menusCollection',
    label: 'Menus Collection',
    required: false,
    description: 'Collection of footer menu sections.',
    color: 'purple',
    getValue: (data) =>
      data.menusCollection?.items
        ? `${data.menusCollection.items.length} menu(s) configured`
        : 'Not set'
  },
  {
    name: 'socialNetworksCollection',
    label: 'Social Networks',
    required: false,
    description: 'Collection of social media links.',
    color: 'pink',
    getValue: (data) =>
      data.socialNetworksCollection?.items
        ? `${data.socialNetworksCollection.items.length} social link(s) configured`
        : 'Not set'
  },
  {
    name: 'copyright',
    label: 'Copyright',
    required: false,
    description: 'Copyright text.',
    color: 'cyan',
    getValue: (data) => (data.copyright ? `"${data.copyright}"` : 'Not set')
  },
  {
    name: 'legalPageListsCollection',
    label: 'Legal Pages',
    required: false,
    description: 'Collection of legal page links.',
    color: 'indigo',
    getValue: (data) =>
      data.legalPageListsCollection?.items
        ? `${data.legalPageListsCollection.items.length} legal page list(s) configured`
        : 'Not set'
  }
];
