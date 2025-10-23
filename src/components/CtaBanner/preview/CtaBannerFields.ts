import type { CtaBanner } from '@/components/CtaBanner/CtaBannerSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const ctaBannerFields: FieldConfig<Partial<CtaBanner>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The main title text for the CTA banner.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    description: 'The description text for the CTA banner.',
    color: 'blue',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },
  {
    name: 'primaryCta',
    label: 'Primary CTA',
    required: true,
    description: 'The primary call-to-action button.',
    color: 'indigo',
    getValue: (data) =>
      data.primaryCta ? `Button configured (${data.primaryCta.text ?? 'No text'})` : 'Not set'
  },
  {
    name: 'secondaryCta',
    label: 'Secondary CTA',
    required: false,
    description: 'The secondary call-to-action button.',
    color: 'pink',
    getValue: (data) =>
      data.secondaryCta ? `Button configured (${data.secondaryCta.text ?? 'No text'})` : 'Not set'
  },
  {
    name: 'backgroundMedia',
    label: 'Background Media',
    required: false,
    description: 'The background media (image) for the banner.',
    color: 'purple',
    getValue: (data) =>
      data.backgroundMedia
        ? `Image configured (${data.backgroundMedia.title ?? 'Untitled'})`
        : 'Not set'
  },
  {
    name: 'backgroundImage',
    label: 'Background Image',
    required: true,
    description: 'The background image asset for the banner.',
    color: 'orange',
    getValue: (data) =>
      data.backgroundImage
        ? `Asset configured (${data.backgroundImage.title ?? 'Untitled'})`
        : 'Not set'
  }
];
