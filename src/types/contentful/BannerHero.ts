import { z } from 'zod';
import { ImageSchema } from './Image';
import { SectionHeadingSchema } from './SectionHeading';

export const BannerHeroSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  name: z.string(),
  heading: SectionHeadingSchema,
  backgroundImage: ImageSchema,
  __typename: z.string().optional()
});

export type BannerHero = z.infer<typeof BannerHeroSchema>;

export interface BannerHeroResponse {
  items: BannerHero[];
}
