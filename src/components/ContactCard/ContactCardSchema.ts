import { z } from 'zod';
import { ButtonSchema } from '@/types/contentful';

export const ContactCardSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  cta: ButtonSchema.optional()
});

export type ContactCardSchema = z.infer<typeof ContactCardSchema>;

export interface ContactCardResponse {
  items: ContactCardSchema[];
}
