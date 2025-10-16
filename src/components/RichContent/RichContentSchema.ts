import { z } from 'zod';

export const RichContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  tableOfContents: z.boolean().optional(),
  variant: z.string(),
  legalContent: z
    .object({
      json: z.any() // Rich text JSON structure for legal content
    })
    .optional(),
  content: z.object({
    json: z.any() // Rich text JSON structure
  }),
  __typename: z.literal('ContentTypeRichText').optional() // GraphQL typename is "ContentTypeRichText"
});

export type RichContent = z.infer<typeof RichContentSchema>;

export interface RichContentResponse {
  items: Array<RichContent>;
  total: number;
}
