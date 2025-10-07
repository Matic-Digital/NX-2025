import { z } from 'zod';

export const NewsletterSignupSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  description: z.string(),
  formId: z.string(),
  __typename: z.string().optional()
});

export type NewsletterSignup = z.infer<typeof NewsletterSignupSchema>;
