import { z } from 'zod';
import { AssetSchema } from './Asset';
import { ButtonSchema } from './Button';

export const SliderItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  icon: AssetSchema.optional(),
  title: z.string(),
  description: z.string(),
  cta: ButtonSchema.optional(),
  variant: z.string(),
  __typename: z.string().optional()
});

export type SliderItem = z.infer<typeof SliderItemSchema>;

export interface SliderItemResponse {
  items: SliderItem[];
}
