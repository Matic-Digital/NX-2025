import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';
import { TeamMemberSchema } from '@/components/TeamMember/TeamMemberSchema';
import { PageLayoutSchema } from '@/components/PageLayout/PageLayoutSchema';
import { HubspotFormSchema } from '@/components/Forms/HubspotForm/HubspotFormSchema';
import { TestimonialItemSchema } from '@/components/Testimonials/TestimonialsSchema';

// Post template options as defined in the content model
const PostTemplateSchema = z.enum([
  'Default',
  'Gated Content'
]);

// Post category options as defined in the content model
const PostCategorySchema = z.enum([
  'Blog',
  'Case Study',
  'Data Sheet',
  'Featured',
  'In The News',
  'Press Release',
  'Resources',
  'Shug Speaks',
  'Video'
]);

// Rich text content schema (simplified for the content field)
const RichTextSchema = z.object({
  json: z.any(), // The actual rich text content returned by Contentful
  nodeType: z.string().optional(),
  data: z.record(z.any()).optional(),
  content: z.array(z.any()).optional()
});

export const PostSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  template: PostTemplateSchema,
  excerpt: z.string().optional(),
  datePublished: z.string().optional(),
  bannerBackground: ImageSchema.optional(),
  mainImage: ImageSchema.optional(),
  content: RichTextSchema,
  authorsCollection: z.object({
    items: z.array(TeamMemberSchema)
  }),
  authors: z.array(TeamMemberSchema), // Keep for backward compatibility
  categories: z.array(PostCategorySchema),
  tags: z.array(z.string()).optional(),
  openGraphImage: ImageSchema.optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoFocusKeyword: z.string().optional(),
  pageLayout: PageLayoutSchema.optional(),
  gatedContentForm: HubspotFormSchema.optional(),
  testimonial: TestimonialItemSchema.optional(),
  __typename: z.string().optional()
});

export const PostSliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  mainImage: ImageSchema.optional(),
  content: RichTextSchema,
  categories: z.array(PostCategorySchema),
  __typename: z.string().optional()
});

export type Post = z.infer<typeof PostSchema>;
export type PostTemplate = z.infer<typeof PostTemplateSchema>;
export type PostCategory = z.infer<typeof PostCategorySchema>;
export type PostSliderItem = z.infer<typeof PostSliderItemSchema>;

export interface PostResponse {
  items: Post[];
}
