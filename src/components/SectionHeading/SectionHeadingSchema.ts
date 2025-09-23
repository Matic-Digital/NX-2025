import { z } from 'zod';

import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { SECTION_HEADING_VARIANTS } from '@/components/SectionHeading/SectionHeadingVariants';

export const SectionHeadingSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  overline: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  variant: z.enum(SECTION_HEADING_VARIANTS).optional(),
  ctaCollection: z
    .object({
      items: z.array(ButtonSchema)
    })
    .optional(),
  __typename: z.string().optional()
});

export type SectionHeading = z.infer<typeof SectionHeadingSchema>;

export type SectionHeadingVariant = (typeof SECTION_HEADING_VARIANTS)[number];

export interface SectionHeadingResponse {
  items: SectionHeading[];
}
