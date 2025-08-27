import { z } from 'zod';

export const RegionEnum = z.enum([
  'northAmerica',
  'europe',
  'latinAmerica',
  'australiaPacific',
  'middleEastIndiaAfrica'
]);

export const GlobalLocationSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.literal('GlobalLocation'),
  title: z.string(),
  region: RegionEnum,
  address: z.string(),
  slug: z.string(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number()
    })
    .optional()
});

export type GlobalLocation = z.infer<typeof GlobalLocationSchema>;

export const GlobalLocationsCollectionSchema = z.object({
  items: z.array(GlobalLocationSchema),
  total: z.number()
});

export type GlobalLocationsCollection = z.infer<typeof GlobalLocationsCollectionSchema>;
