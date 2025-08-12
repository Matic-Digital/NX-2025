import { z } from 'zod';
import { ModalSchema } from './Modal';

// We don't use the union directly in the schema to avoid GraphQL issues
// Instead, we'll use a simple reference object and handle the union in code

export const ButtonSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  internalText: z.string(),
  text: z.string(),
  internalLink: z.optional(
    z.object({
      sys: z.object({
        id: z.string()
      }),
      slug: z.string()
    })
  ),
  externalLink: z.optional(z.string().url()),
  modal: z.optional(ModalSchema)
});

export type Button = z.infer<typeof ButtonSchema>;
