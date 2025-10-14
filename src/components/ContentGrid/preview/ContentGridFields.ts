import type { ContentGrid } from '@/components/ContentGrid/ContentGridSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const contentGridFields: FieldConfig<Partial<ContentGrid>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the content grid section.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'theme',
    label: 'Theme',
    required: false,
    description: 'The color theme for the content grid (Light or Dark).',
    color: 'blue',
    getValue: (data) => (data.theme ? `"${data.theme}"` : 'Not set')
  },
  {
    name: 'heading',
    label: 'Heading',
    required: false,
    description: 'Optional SectionHeading component that provides title, description, and CTAs.',
    color: 'purple',
    getValue: (data) =>
      data.heading
        ? `SectionHeading configured (Title: "${data.heading.title ?? 'Not set'}")`
        : 'Not set'
  },
  {
    name: 'backgroundImage',
    label: 'Background Image',
    required: false,
    description: 'Optional background image for the content grid section.',
    color: 'orange',
    getValue: (data) =>
      data.backgroundImage
        ? `Image configured (${data.backgroundImage.title ?? 'Untitled'})`
        : 'Not set'
  },
  {
    name: 'backgroundAsset',
    label: 'Background Asset',
    required: false,
    description: 'Optional background asset (image or video) from Contentful.',
    color: 'cyan',
    getValue: (data) =>
      data.backgroundAsset
        ? `Asset configured (${data.backgroundAsset.title ?? 'Untitled'})`
        : 'Not set'
  },
  {
    name: 'itemsCollection',
    label: 'Items Collection',
    required: true,
    description:
      'Collection of items to display in the grid. Can include Accordion, ContentGridItem, CtaGrid, ContactCard, Event, Image, OfficeLocation, Post, Product, Service, Slider, Solution, or Video.',
    color: 'indigo',
    getValue: (data) =>
      data.itemsCollection?.items
        ? `${data.itemsCollection.items.length} item(s) configured`
        : 'Not set'
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description: 'The layout variant that determines how items are displayed in the grid.',
    color: 'pink',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Not set')
  },
  {
    name: 'componentType',
    label: 'Component Type',
    required: false,
    description: 'Optional component type identifier for specialized rendering.',
    color: 'yellow',
    getValue: (data) => (data.componentType ? `"${data.componentType}"` : 'Not set')
  }
];
