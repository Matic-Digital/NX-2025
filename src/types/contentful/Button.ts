import { z } from 'zod';
import { ModalSchema } from './Modal';

// Simple schema for button internal links that matches GraphQL query response
const ButtonInternalLinkSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  slug: z.string(),
  __typename: z.string()
});

export const ButtonSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  internalText: z.string(),
  text: z.string(),
  internalLink: ButtonInternalLinkSchema.optional(),
  externalLink: z.optional(z.string().url()),
  modal: z.optional(ModalSchema)
});

export type Button = z.infer<typeof ButtonSchema>;
