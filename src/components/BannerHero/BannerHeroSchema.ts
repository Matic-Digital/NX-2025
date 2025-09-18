import { z } from 'zod';
import { ImageSchema } from '../../types/contentful/Image';
import { SectionHeadingSchema } from '../SectionHeading/SectionHeadingSchema';

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
