import { z } from 'zod';

import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { ContentGridItemSchema } from '@/components/ContentGrid/ContentGridItemSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';

export const CtaGridVariantEnum = z.enum(['ContentLeft', 'ContentCenter', 'ContentRight']);
export type CtaGridVariant = z.infer<typeof CtaGridVariantEnum>;

export const CtaGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  asset: ImageSchema,
  itemsCollection: z.object({
    items: z.array(ContentGridItemSchema)
  }),
  ctaCollection: z.object({
    items: z.array(ButtonSchema)
  }),
  variant: CtaGridVariantEnum,
  __typename: z.string().optional()
});

export type CtaGrid = z.infer<typeof CtaGridSchema>;

export interface CtaGridResponse {
  items: CtaGrid[];
}
