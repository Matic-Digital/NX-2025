import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItemSchema';

export const regionStatItemFields: FieldConfig<Partial<RegionStatItem>>[] = [
  {
    name: 'heading',
    label: 'Heading',
    required: true,
    description: 'The main heading for the stat item.',
    color: 'green',
    getValue: (data) => (data.heading ? `"${data.heading}"` : 'Not set')
  },
  {
    name: 'subHeading',
    label: 'Sub Heading',
    required: true,
    description: 'The sub heading for the stat item.',
    color: 'blue',
    getValue: (data) => (data.subHeading ? `"${data.subHeading}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    description: 'The description text for the stat item.',
    color: 'purple',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  }
];
