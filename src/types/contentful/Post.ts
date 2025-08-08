import { z } from 'zod';
import { ImageSchema } from './Image';

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

// Team member schema (referenced by authors)
const TeamMemberSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  name: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  __typename: z.string().optional()
});

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
  excerpt: z.string().optional(),
  datePublished: z.string().optional(),
  mainImage: ImageSchema.optional(),
  content: RichTextSchema,
  authors: z.array(TeamMemberSchema),
  categories: z.array(PostCategorySchema),
  tags: z.array(z.string()).optional(),
  openGraphImage: ImageSchema.optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoFocusKeyword: z.string().optional(),
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
export type PostCategory = z.infer<typeof PostCategorySchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type PostSliderItem = z.infer<typeof PostSliderItemSchema>;

export interface PostResponse {
  items: Post[];
}
