import { z } from 'zod';
import { AssetSchema } from './Asset';
import { SectionHeadingSchema } from './SectionHeading';

// Define the FeaturesGridItem schema
export const FeaturesGridItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  icon: AssetSchema,
  title: z.string(),
  link: z.object({
    sys: z.object({
      id: z.string()
    }),
    slug: z.string()
  }),
  description: z.string(),
  __typename: z.string().optional()
});

export type FeaturesGridItem = z.infer<typeof FeaturesGridItemSchema>;

export const FeaturesGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: SectionHeadingSchema,
  itemsCollection: z.object({
    items: z.array(FeaturesGridItemSchema)
  }),
  __typename: z.string().optional()
});

export type FeaturesGrid = z.infer<typeof FeaturesGridSchema>;

export interface FeaturesGridResponse {
  items: FeaturesGrid[];
}
