import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Solution } from '@/components/Solution/SolutionSchema';

export const solutionFields: FieldConfig<Partial<Solution>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description:
      'The main title of the solution. This appears as the primary heading and is used for navigation.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    description:
      'URL-friendly identifier for the solution. Used in the page URL and for linking to this solution.',
    color: 'blue',
    getValue: (data) => {
      if (!data.slug) {
        return 'Not set';
      }
      return `"${data.slug}" | URL: /solutions/${data.slug}`;
    }
  },
  {
    name: 'variant',
    label: 'Variant',
    required: true,
    description:
      'Visual variant that controls the layout and styling of the solution display (e.g., BackgroundPrimaryHover).',
    color: 'purple',
    getValue: (data) => (data.variant ? `"${data.variant}"` : 'Not set')
  },
  {
    name: 'heading',
    label: 'Heading',
    required: false,
    description:
      'Alternative heading for the solution page. If not set, the main title will be used.',
    color: 'cyan',
    getValue: (data) => (data.heading ? `"${data.heading}"` : 'Not set (will use main title)')
  },
  {
    name: 'subheading',
    label: 'Subheading',
    required: false,
    description:
      'Supporting text that appears below the main heading. Provides additional context or tagline.',
    color: 'indigo',
    getValue: (data) => (data.subheading ? `"${data.subheading}"` : 'Not set')
  },
  {
    name: 'cardTitle',
    label: 'Card Title',
    required: false,
    description:
      'Alternative title for use in card layouts. If not set, the main title will be used.',
    color: 'yellow',
    getValue: (data) => (data.cardTitle ? `"${data.cardTitle}"` : 'Not set (will use main title)')
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    description:
      'Detailed description of the solution. Explains what the solution does and its benefits.',
    color: 'orange',
    getValue: (data) =>
      data.description
        ? `"${data.description.substring(0, 100)}${data.description.length > 100 ? '...' : ''}"`
        : 'Not set'
  },
  {
    name: 'backgroundImage',
    label: 'Background Image',
    required: false,
    description:
      'Background image for the solution page or card. Should be visually representative of the solution.',
    color: 'pink',
    getValue: (data) =>
      data.backgroundImage ? `Image: ${data.backgroundImage.title ?? 'Untitled'}` : 'Not set'
  },
  {
    name: 'cta',
    label: 'CTA Button',
    required: false,
    description: 'Call-to-action button for the solution. Encourages users to take the next step.',
    color: 'red',
    getValue: (data) =>
      data.cta ? `Button: "${data.cta.text ?? data.cta.internalText ?? 'No text'}"` : 'Not set'
  },
  {
    name: 'pageLayout',
    label: 'Page Layout',
    required: false,
    description: 'Layout configuration for the solution page.',
    color: 'green',
    getValue: (data) => (data.pageLayout ? 'Set' : 'Not set')
  },
  {
    name: 'itemsCollection',
    label: 'Items Collection',
    required: false,
    description: 'Collection of items associated with the solution.',
    color: 'blue',
    getValue: (data) => (data.itemsCollection ? 'Set' : 'Not set')
  }
];
