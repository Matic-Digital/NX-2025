import type { Header } from '@/components/Header/HeaderSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const headerFields: FieldConfig<Partial<Header>>[] = [
  {
    name: 'name',
    label: 'Name',
    required: true,
    description: 'The name of the header (internal use).',
    color: 'green',
    getValue: (data) => (data.name ? `"${data.name}"` : 'Not set')
  },
  {
    name: 'logo',
    label: 'Logo',
    required: true,
    description: 'The company logo image.',
    color: 'orange',
    getValue: (data) => (data.logo?.url ? `URL: ${data.logo.url}` : 'Not set')
  },
  {
    name: 'menu',
    label: 'Menu',
    required: false,
    description: 'Optional menu reference.',
    color: 'blue',
    getValue: (data) => (data.menu?.sys?.id ? `Menu ID: ${data.menu.sys.id}` : 'Not set')
  },
  {
    name: 'search',
    label: 'Search',
    required: false,
    description: 'Enable search functionality.',
    color: 'cyan',
    getValue: (data) => (data.search !== undefined ? `${data.search}` : 'Not set')
  },
  {
    name: 'overflow',
    label: 'Overflow Menu',
    required: false,
    description: 'Optional overflow menu reference.',
    color: 'indigo',
    getValue: (data) =>
      data.overflow?.sys?.id ? `Overflow Menu ID: ${data.overflow.sys.id}` : 'Not set'
  }
];
