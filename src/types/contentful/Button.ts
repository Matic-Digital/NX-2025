import { z } from 'zod';

export const ButtonSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  text: z.string(),
  internalText: z.string(),
  internalLink: z.optional(
    z.object({
      sys: z.object({
        id: z.string()
      }),
      slug: z.string()
    })
  ),
  externalLink: z.optional(z.string().url())
});

export type Button = z.infer<typeof ButtonSchema>;
