import { z } from 'zod';
import { AssetSchema } from './Asset';

export const FeatureSliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  icon: AssetSchema.optional(),
  title: z.string(),
  description: z.string().optional(),
  __typename: z.string().optional()
});

export type FeatureSliderItem = z.infer<typeof FeatureSliderItemSchema>;

export interface FeatureSliderItemResponse {
  items: FeatureSliderItem[];
}
