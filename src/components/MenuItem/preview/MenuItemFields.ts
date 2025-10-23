import type { MenuItem } from '@/components/MenuItem/MenuItemSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const menuItemFields: FieldConfig<Partial<MenuItem>>[] = [
  {
    name: 'icon',
    label: 'Icon',
    required: false,
    description: 'Optional icon asset.',
    color: 'orange',
    getValue: (data) => (data.icon?.url ? `URL: ${data.icon.url}` : 'Not set')
  },
  {
    name: 'associatedImage',
    label: 'Associated Image',
    required: false,
    description: 'Optional associated image.',
    color: 'cyan',
    getValue: (data) =>
      data.associatedImage?.link ? `Link: ${data.associatedImage.link}` : 'Not set'
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the menu item.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'text',
    label: 'Text',
    required: true,
    description: 'The display text for the menu item.',
    color: 'blue',
    getValue: (data) => (data.text ? `"${data.text}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'The description of the menu item.',
    color: 'purple',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },

  {
    name: 'internalLink',
    label: 'Internal Link',
    required: false,
    description: 'Link to an internal page.',
    color: 'indigo',
    getValue: (data) => (data.internalLink?.slug ? `/${data.internalLink.slug}` : 'Not set')
  },
  {
    name: 'externalLink',
    label: 'External Link',
    required: false,
    description: 'Link to an external URL.',
    color: 'pink',
    getValue: (data) => (data.externalLink ? `${data.externalLink}` : 'Not set')
  }
];
