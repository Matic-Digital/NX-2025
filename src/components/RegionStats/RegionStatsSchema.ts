import { z } from 'zod';

import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { RegionStatItemSchema } from '@/components/RegionStats/RegionStatItem/RegionStatItemSchema';

export const RegionStatsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  image: ImageSchema,
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(RegionStatItemSchema)
  }),
  cta: ButtonSchema,
  __typename: z.string()
});

export type RegionStats = z.infer<typeof RegionStatsSchema>;
