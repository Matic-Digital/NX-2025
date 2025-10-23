import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { RegionsMap } from '@/components/Region/RegionSchema';

export const regionsMapFields: FieldConfig<Partial<RegionsMap>>[] = [
  {
    name: 'overline',
    label: 'Overline',
    required: true,
    description: 'The overline text that appears above the title.',
    color: 'blue',
    getValue: (data) => (data.overline ? `"${data.overline}"` : 'Not set')
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the regions map.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'regionsCollection',
    label: 'Regions Collection',
    required: true,
    description: 'Collection of regions to display on the map.',
    color: 'purple',
    getValue: (data) =>
      data.regionsCollection?.items && data.regionsCollection.items.length > 0
        ? `${data.regionsCollection.items.length} region(s)`
        : 'Not set'
  },
  {
    name: 'mapImage',
    label: 'Map Image',
    required: true,
    description: 'The background map image asset.',
    color: 'orange',
    getValue: (data) => (data.mapImage ? `Asset (${data.mapImage.title ?? 'Untitled'})` : 'Not set')
  }
];
