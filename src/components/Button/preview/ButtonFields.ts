import type { Button } from '@/components/Button/ButtonSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const buttonFields: FieldConfig<Partial<Button>>[] = [
  {
    name: 'internalText',
    label: 'Internal Text',
    required: true,
    description:
      'The internal text identifier for this button. Used for content management and fallback display.',
    color: 'green',
    getValue: (data) => (data.internalText ? `"${data.internalText}"` : 'Not set')
  },
  {
    name: 'text',
    label: 'Text',
    required: true,
    description:
      'The display text that appears on the button. This is what users will see and click.',
    color: 'blue',
    getValue: (data) => (data.text ? `"${data.text}"` : 'Not set')
  },
  {
    name: 'internalLink',
    label: 'Internal Link',
    required: false,
    description:
      'Link to an internal page within the site. Takes precedence over external links when both are set.',
    color: 'purple',
    getValue: (data) =>
      data.internalLink ? `Internal page: /${data.internalLink.slug}` : 'Not set'
  },
  {
    name: 'externalLink',
    label: 'External Link',
    required: false,
    description:
      'Link to an external website. Used when the button should navigate away from the site.',
    color: 'orange',
    getValue: (data) => (data.externalLink ? `"${data.externalLink}"` : 'Not set')
  },
  {
    name: 'modal',
    label: 'Modal',
    required: false,
    description:
      'Modal dialog that opens when the button is clicked. Used for forms, confirmations, or additional content.',
    color: 'indigo',
    getValue: (data) =>
      data.modal ? `Modal configured (${data.modal.title ?? 'Untitled'})` : 'Not set'
  },
  {
    name: 'icon',
    label: 'Icon',
    required: false,
    description:
      'Optional icon that appears alongside the button text. Currently supports Email icon.',
    color: 'pink',
    getValue: (data) => (data.icon ? `"${data.icon}"` : 'Not set')
  }
];
