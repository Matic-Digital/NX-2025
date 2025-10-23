import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Slider } from '@/components/Slider/SliderSchema';

export const sliderFields: FieldConfig<Slider>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title for this slider. Used for internal organization and may be displayed depending on implementation.',
    color: 'green',
    getValue: (data) => data?.title ? `"${data.title}"` : 'Not set'
  },
  {
    name: 'itemsCollection',
    label: 'Items Collection',
    required: true,
    description: 'Collection of items to display in the slider. Can include SliderItems, Posts, Images, TimelineItems, TeamMembers, or Solutions.',
    color: 'purple',
    getValue: (data) => {
      if (!data?.itemsCollection?.items) return 'Not set';
      const count = data.itemsCollection.items.length;
      const types = data.itemsCollection.items.map(item => item.__typename ?? 'Unknown').join(', ');
      return `${count} item(s) configured${types ? ` (${types})` : ''}`;
    }
  },
  {
    name: 'autoplay',
    label: 'Autoplay',
    required: false,
    description: 'Whether the slider should automatically advance to the next item.',
    color: 'blue',
    getValue: (data) => data?.autoplay !== undefined ? (data.autoplay ? 'Enabled' : 'Disabled') : 'Not set'
  },
  {
    name: 'delay',
    label: 'Delay',
    required: false,
    description: 'Delay in milliseconds between automatic slide transitions (only applies when autoplay is enabled).',
    color: 'yellow',
    getValue: (data) => data?.delay !== undefined ? `${data.delay}ms` : 'Not set'
  }
];
