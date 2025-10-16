import type { Menu } from '@/components/Menu/MenuSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const menuFields: FieldConfig<Partial<Menu>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the menu.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'itemsCollection',
    label: 'Menu Items',
    required: true,
    description: 'Collection of menu items (MenuItem or MegaMenu).',
    color: 'purple',
    getValue: (data) =>
      data.itemsCollection?.items
        ? `${data.itemsCollection.items.length} item(s) configured`
        : 'Not set'
  }
];
