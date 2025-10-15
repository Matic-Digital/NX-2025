import type { CtaGrid } from '@/components/CtaGrid/CtaGridSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const ctaGridFields: FieldConfig<Partial<CtaGrid>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title for the CTA grid.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'asset',
    label: 'Asset',
    required: false,
    description: 'The main image asset for the CTA grid.',
    color: 'orange',
    getValue: (data) =>
      data.asset ? `Image configured (${data.asset.title ?? 'Untitled'})` : 'Not set'
  },
  {
    name: 'itemsCollection',
    label: 'Items Collection',
    required: true,
    description: 'Collection of content grid items (heading + description).',
    color: 'blue',
    getValue: (data) =>
      data.itemsCollection?.items
        ? `${data.itemsCollection.items.length} item(s) configured`
        : 'Not set'
  },
  {
    name: 'ctaCollection',
    label: 'CTA Collection',
    required: false,
    description: 'Collection of CTA buttons.',
    color: 'indigo',
    getValue: (data) =>
      data.ctaCollection?.items ? `${data.ctaCollection.items.length} CTA(s) configured` : 'Not set'
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description: 'Layout variant: ContentLeft, ContentCenter, or ContentRight.',
    color: 'purple',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Not set')
  }
];
