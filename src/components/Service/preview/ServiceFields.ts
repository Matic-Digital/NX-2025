import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Service } from '@/components/Service/ServiceSchema';

export const serviceFields: FieldConfig<Partial<Service>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description:
      'The main title of the service. This appears as the primary heading and is used for navigation.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    description:
      'URL-friendly identifier for the service. Used in the page URL and for linking to this service.',
    color: 'blue',
    getValue: (data) => {
      if (data.slug) {
        return `"${data.slug}" (URL: /services/${data.slug})`;
      }
      return 'Not set';
    }
  },
  {
    name: 'cardImage',
    label: 'Card Image',
    required: false,
    description:
      'Image that appears on service cards in grid layouts. Should be visually representative of the service.',
    color: 'purple',
    getValue: (data) =>
      data.cardImage ? `Image configured (${data.cardImage.title || 'Untitled'})` : 'Not set'
  },
  {
    name: 'cardTitle',
    label: 'Card Title',
    required: false,
    description:
      'Alternative title for use in card layouts. If not set, the main title will be used.',
    color: 'orange',
    getValue: (data) => (data.cardTitle ? `"${data.cardTitle}"` : 'Not set (will use main title)')
  },
  {
    name: 'cardTags',
    label: 'Card Tags',
    required: false,
    description:
      'Tags or categories that appear on service cards. Used for categorization and filtering.',
    color: 'indigo',
    getValue: (data) =>
      data.cardTags && data.cardTags.length > 0
        ? `${data.cardTags.length} tag(s): ${data.cardTags.join(', ')}`
        : 'Not set'
  },
  {
    name: 'cardButtonText',
    label: 'Card Button Text',
    required: true,
    description:
      'Text for the call-to-action button on service cards. Typically something like "Learn More" or "View Details".',
    color: 'pink',
    getValue: (data) => (data.cardButtonText ? `"${data.cardButtonText}"` : 'Not set')
  }
];
