import type { Post } from '@/components/Post/PostSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const postFields: FieldConfig<Partial<Post>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the post.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'slug',
    label: 'Slug',
    required: true,
    description: 'The URL slug for the post.',
    color: 'blue',
    getValue: (data) => (data.slug ? `"${data.slug}"` : 'Not set')
  },
  {
    name: 'pageLayout',
    label: 'Page Layout',
    required: false,
    description: 'The page layout configuration for the post.',
    color: 'purple',
    getValue: (data) => (data.pageLayout ? 'Page layout configured' : 'Not set')
  },
  {
    name: 'template',
    label: 'Template',
    required: true,
    description: 'The template to use for rendering the post.',
    color: 'indigo',
    getValue: (data) => (data.template ? `"${data.template}"` : 'Not set')
  },
  {
    name: 'excerpt',
    label: 'Excerpt',
    required: false,
    description: 'A short excerpt or summary of the post.',
    color: 'cyan',
    getValue: (data) => (data.excerpt ? `"${data.excerpt}"` : 'Not set')
  },
  {
    name: 'datePublished',
    label: 'Date Published',
    required: false,
    description: 'The publication date of the post.',
    color: 'orange',
    getValue: (data) => data.datePublished ?? 'Not set'
  },
  {
    name: 'bannerBackground',
    label: 'Banner Background',
    required: false,
    description: 'The banner background image for the post.',
    color: 'pink',
    getValue: (data) =>
      data.bannerBackground?.link ? `Link: ${data.bannerBackground.link}` : 'Not set'
  },
  {
    name: 'mainImage',
    label: 'Main Image',
    required: false,
    description: 'The main featured image for the post.',
    color: 'yellow',
    getValue: (data) => (data.mainImage?.link ? `Link: ${data.mainImage.link}` : 'Not set')
  },
  {
    name: 'content',
    label: 'Content',
    required: true,
    description: 'The rich text content of the post.',
    color: 'green',
    getValue: (data) => (data.content ? 'Rich text content configured' : 'Not set')
  },
  {
    name: 'authorsCollection',
    label: 'Authors Collection',
    required: true,
    description: 'The authors of the post.',
    color: 'blue',
    getValue: (data) =>
      data.authorsCollection?.items && data.authorsCollection.items.length > 0
        ? `${data.authorsCollection.items.length} author(s)`
        : 'Not set'
  },
  {
    name: 'categories',
    label: 'Categories',
    required: true,
    description: 'The categories this post belongs to.',
    color: 'purple',
    getValue: (data) =>
      data.categories && data.categories.length > 0 ? data.categories.join(', ') : 'Not set'
  },
  {
    name: 'tags',
    label: 'Tags',
    required: false,
    description: 'Tags associated with the post.',
    color: 'indigo',
    getValue: (data) => (data.tags && data.tags.length > 0 ? data.tags.join(', ') : 'Not set')
  },
  {
    name: 'openGraphImage',
    label: 'Open Graph Image',
    required: false,
    description: 'The Open Graph image for social media sharing.',
    color: 'cyan',
    getValue: (data) =>
      data.openGraphImage?.link ? `Link: ${data.openGraphImage.link}` : 'Not set'
  },
  {
    name: 'seoTitle',
    label: 'SEO Title',
    required: false,
    description: 'The SEO title for the post.',
    color: 'orange',
    getValue: (data) => (data.seoTitle ? `"${data.seoTitle}"` : 'Not set')
  },
  {
    name: 'seoDescription',
    label: 'SEO Description',
    required: false,
    description: 'The SEO description for the post.',
    color: 'pink',
    getValue: (data) => (data.seoDescription ? `"${data.seoDescription}"` : 'Not set')
  },
  {
    name: 'seoFocusKeyword',
    label: 'SEO Focus Keyword',
    required: false,
    description: 'The SEO focus keyword for the post.',
    color: 'yellow',
    getValue: (data) => (data.seoFocusKeyword ? `"${data.seoFocusKeyword}"` : 'Not set')
  }
];
