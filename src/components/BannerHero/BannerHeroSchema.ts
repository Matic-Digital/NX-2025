import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';
import { SectionHeadingSchema } from '@/components/SectionHeading/SectionHeadingSchema';

export const BannerHeroSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: SectionHeadingSchema,
  backgroundImage: ImageSchema,
  __typename: z.string().optional()
});

export type BannerHero = z.infer<typeof BannerHeroSchema>;

export interface BannerHeroResponse {
  items: BannerHero[];
  total: number;
}
