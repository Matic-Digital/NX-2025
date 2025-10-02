import { z } from 'zod';

export const RegionStatItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  heading: z.string(),
  subHeading: z.string(),
  description: z.string(),
  __typename: z.string()
});

export type RegionStatItem = z.infer<typeof RegionStatItemSchema>;
