import { z } from 'zod';
import { SectionHeadingSchema } from './SectionHeading';

export const FeaturesGridSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  heading: SectionHeadingSchema,
  //   featuresCollection: z.array(
  //     z.object({
  //       sys: z.object({
  //         id: z.string()
  //       }),
  //       title: z.string(),
  //       description: z.string(),
  //       icon: z.optional(z.string()),
  //       __typename: z.string().optional()
  //     })
  //   ),
  __typename: z.string().optional()
});

export type FeaturesGrid = z.infer<typeof FeaturesGridSchema>;

export interface FeaturesGridResponse {
  items: FeaturesGrid[];
}
