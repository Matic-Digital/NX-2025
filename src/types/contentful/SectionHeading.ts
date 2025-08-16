import { z } from 'zod';
import { ButtonSchema } from './Button';

export const SectionHeadingSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  overline: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  ctaCollection: z
    .object({
      items: z.array(ButtonSchema)
    })
    .optional(),
  componentType: z.string().optional(),
  isDarkMode: z.boolean().optional(),
  isCenter: z.boolean().optional(),
  __typename: z.string().optional()
});

export type SectionHeading = z.infer<typeof SectionHeadingSchema>;

export interface SectionHeadingResponse {
  items: SectionHeading[];
}
