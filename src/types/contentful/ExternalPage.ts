import { z } from 'zod';

export const ExternalPageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  link: z.string(),
  __typename: z.string().optional()
});

export type ExternalPage = z.infer<typeof ExternalPageSchema>;
