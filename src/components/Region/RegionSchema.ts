import { z } from 'zod';
import { AssetSchema } from '@/types/contentful/Asset';

export const RegionSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  region: z.string(),
  slug: z.string(),
  street: z.string(),
  city: z.string(),
  country: z.string(),
  location: z.object({
    lat: z.number(),
    lon: z.number()
  })
});

export type Region = z.infer<typeof RegionSchema>;

export const RegionsMapSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string(),
  title: z.string(),
  overline: z.string(),
  regionsCollection: z.object({
    items: z.array(RegionSchema)
  }),
  mapImage: AssetSchema
});

export type RegionsMap = z.infer<typeof RegionsMapSchema>;

export interface RegionResponse {
  items: Region[];
}
