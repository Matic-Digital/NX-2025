import { z } from 'zod';

export const RichContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  tableOfContents: z.boolean().optional(),
  content: z
    .object({
      json: z.any() // Rich text JSON structure
    })
    .optional(),
  legalContent: z
    .object({
      json: z.any() // Rich text JSON structure for legal content
    })
    .optional(),
  variant: z.string().optional(),
  __typename: z.literal('ContentTypeRichText').optional() // GraphQL typename is "ContentTypeRichText"
});

export type RichContent = z.infer<typeof RichContentSchema>;
