import { z } from 'zod';
import { ImageSchema } from './Image';
import { ButtonSchema } from './Button';
import { ContentGridItemSchema } from './ContentGridItem';

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
  __typename: z.string().optional()
});

export type CtaGrid = z.infer<typeof CtaGridSchema>;

export interface CtaGridResponse {
  items: CtaGrid[];
}
