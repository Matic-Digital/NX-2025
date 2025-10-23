import type { Content } from '@/components/Content/ContentSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const contentFields: FieldConfig<Partial<Content>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description:
      'The title for this content section. Used for internal organization and may be displayed depending on the variant.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description:
      'Controls the layout and positioning. Options: ContentLeft, ContentCenter, ContentRight, FullWidth.',
    color: 'orange',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Default layout')
  },
  {
    name: 'asset',
    label: 'Asset',
    required: false,
    description:
      'An image or video that accompanies the content. Can be positioned based on the variant setting.',
    color: 'blue',
    getValue: (data) =>
      data.asset
        ? `${data.asset.__typename ?? 'Asset'} configured (${data.asset.title ?? 'Untitled'})`
        : 'Not set'
  },
  {
    name: 'item',
    label: 'Item',
    required: true,
    description:
      'The main content item. Can be a Product, SectionHeading, ContentGridItem, or HubspotForm that provides the primary content.',
    color: 'purple',
    getValue: (data) => (data.item ? `${data.item.__typename ?? 'Item'} configured` : 'Not set')
  }
];
