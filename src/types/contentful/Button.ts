import { z } from 'zod';
import { ModalSchema } from './Modal';

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
