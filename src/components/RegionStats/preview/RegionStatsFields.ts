import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { RegionStats } from '@/components/RegionStats/RegionStatsSchema';

export const regionStatsFields: FieldConfig<Partial<RegionStats>>[] = [
  {
    name: 'image',
    label: 'Image',
    required: true,
    description: 'The main image for the region stats section.',
    color: 'orange',
    getValue: (data) => (data.image ? `Asset (${data.image.title ?? 'Untitled'})` : 'Not set')
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the region stats section.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'itemsCollection',
    label: 'Items Collection',
    required: true,
    description: 'Collection of region stat items to display.',
    color: 'blue',
    getValue: (data) =>
      data.itemsCollection?.items && data.itemsCollection.items.length > 0
        ? `${data.itemsCollection.items.length} item(s)`
        : 'Not set'
  },
  {
    name: 'cta',
    label: 'CTA Button',
    required: false,
    description: 'Call-to-action button.',
    color: 'purple',
    getValue: (data) => (data.cta?.text ? `"${data.cta.text}"` : 'Not set')
  }
];
