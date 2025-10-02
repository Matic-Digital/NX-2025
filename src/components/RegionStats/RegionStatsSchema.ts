import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { RegionStatItemSchema } from '@/components/RegionStats/RegionStatItem/RegionStatItemSchema';

export const RegionStatsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  image: AssetSchema,
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(RegionStatItemSchema)
  }),
  cta: ButtonSchema,
  __typename: z.string()
});

export type RegionStats = z.infer<typeof RegionStatsSchema>;
