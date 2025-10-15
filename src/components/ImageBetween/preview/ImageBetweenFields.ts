import type { ImageBetween } from '@/components/ImageBetween/ImageBetweenSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const imageBetweenFields: FieldConfig<Partial<ImageBetween>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title for this ImageBetween section. Used for internal organization.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'contentTop',
    label: 'Content Top',
    required: true,
    description: 'Content that appears above the central asset.',
    color: 'purple',
    getValue: (data) =>
      data.contentTop
        ? `${data.contentTop.__typename ?? 'Content'} (${data.contentTop.title ?? 'Untitled'})`
        : 'Not set'
  },
  {
    name: 'asset',
    label: 'Asset',
    required: false,
    description:
      'The central asset between content sections (Image, Slider, Video, or ContentGrid).',
    color: 'blue',
    getValue: (data) =>
      data.asset
        ? `${data.asset.__typename ?? 'Asset'} (${data.asset.title ?? 'Untitled'})`
        : 'Not set'
  },
  {
    name: 'backgroundMedia',
    label: 'Background Media',
    required: false,
    description: 'Background media that appears behind the entire section.',
    color: 'cyan',
    getValue: (data) =>
      data.backgroundMedia ? `Asset (${data.backgroundMedia.title ?? 'Untitled'})` : 'Not set'
  },
  {
    name: 'contentBottom',
    label: 'Content Bottom',
    required: true,
    description: 'Content that appears below the central asset.',
    color: 'orange',
    getValue: (data) =>
      data.contentBottom ? `ContentGrid (${data.contentBottom.title ?? 'Untitled'})` : 'Not set'
  }
];
