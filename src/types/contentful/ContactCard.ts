import { z } from 'zod';
import { ButtonSchema } from './Button';

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

export type ContactCard = z.infer<typeof ContactCardSchema>;

export interface ContactCardResponse {
  items: ContactCard[];
}
