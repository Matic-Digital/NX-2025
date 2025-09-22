import { z } from 'zod';

export const RichContentSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string().optional(),
  title: z.string().optional(),
  tableOfContents: z.boolean().optional(),
  content: z
    .object({
      json: z.any()
    })
    .optional(),
  variant: z.string(),
  legalContent: z
    .object({
      json: z.any()
    })
    .optional()
});

export type RichContent = z.infer<typeof RichContentSchema>;

export interface RichContentResponse {
  items: Array<RichContent>;
  total: number;
}
