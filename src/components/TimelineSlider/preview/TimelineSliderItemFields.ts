import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { TimelineSliderItem } from '@/components/TimelineSlider/TimelineSliderItemSchema';

export const timelineSliderItemFields: FieldConfig<Partial<TimelineSliderItem>>[] = [
  {
    name: 'year',
    label: 'Year',
    required: false,
    description: 'The year or time period for this timeline item.',
    color: 'blue',
    getValue: (data) => (data.year ? `"${data.year}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'Descriptive text explaining what happened in this time period.',
    color: 'green',
    getValue: (data) =>
      data.description
        ? `"${data.description.substring(0, 100)}${data.description.length > 100 ? '...' : ''}"`
        : 'Not set'
  },
  {
    name: 'asset',
    label: 'Asset',
    required: false,
    description: 'Background image or video for this timeline item.',
    color: 'purple',
    getValue: (data) => {
      if (!data.asset) {
        return 'Not set';
      }

      if (data.asset.__typename === 'Image') {
        return data.asset.title ? `Image: ${data.asset.title}` : 'Image configured';
      }

      if (data.asset.__typename === 'Video') {
        return data.asset.title ? `Video: ${data.asset.title}` : 'Video configured';
      }

      return 'Asset configured';
    }
  }
];
