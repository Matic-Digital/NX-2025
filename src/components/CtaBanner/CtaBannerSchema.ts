import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';

export const CtaBannerSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  description: z.string(),
  primaryCta: ButtonSchema,
  secondaryCta: ButtonSchema.optional(),
  backgroundMedia: ImageSchema.optional(),
  backgroundImage: AssetSchema,
  __typename: z.string().optional()
});

export type CtaBanner = z.infer<typeof CtaBannerSchema>;

export interface CtaBannerResponse {
  items: CtaBanner[];
}
