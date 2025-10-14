import type { BannerHero } from '@/components/BannerHero/BannerHeroSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const bannerHeroFields: FieldConfig<Partial<BannerHero>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The main title for the banner hero section. This appears as the primary heading.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'heading',
    label: 'Heading',
    required: true,
    description:
      'A SectionHeading component that provides the main content structure including title, description, and CTAs.',
    color: 'purple',
    getValue: (data) =>
      data.heading
        ? `SectionHeading configured (Title: "${data.heading.title || 'Not set'}")`
        : 'Not set'
  },
  {
    name: 'backgroundImage',
    label: 'Background Image',
    required: true,
    description:
      'The background image that appears behind the hero content. Should be high-resolution and optimized for web.',
    color: 'blue',
    getValue: (data) =>
      data.backgroundImage
        ? `Image configured (${data.backgroundImage.title || 'Untitled'})`
        : 'Not set'
  }
];
