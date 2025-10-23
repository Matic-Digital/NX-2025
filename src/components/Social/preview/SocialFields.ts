import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Social } from '@/components/Social/SocialSchema';

export const socialFields: FieldConfig<Partial<Social>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description:
      'The name of the social media platform or service. Used for accessibility and identification.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'link',
    label: 'Link',
    required: true,
    description:
      'The URL that users will be taken to when they click the social media icon. Should be a valid external link.',
    color: 'blue',
    getValue: (data) => (data.link ? `"${data.link}"` : 'Not set')
  },
  {
    name: 'icon',
    label: 'Icon',
    required: true,
    description:
      'The icon image that represents the social media platform. Should be recognizable and appropriately sized.',
    color: 'purple',
    getValue: (data) => {
      if (!data.icon) {
        return 'Not set';
      }
      const parts = [
        data.icon.title ? `Icon: ${data.icon.title}` : 'Icon configured',
        data.icon.width && data.icon.height
          ? `Dimensions: ${data.icon.width}x${data.icon.height}px`
          : null,
        `URL: ${data.icon.url}`
      ].filter(Boolean);
      return parts.join(' | ');
    }
  }
];
