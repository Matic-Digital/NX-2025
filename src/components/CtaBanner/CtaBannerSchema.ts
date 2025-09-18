import { z } from 'zod';
import { AssetSchema } from '../../types/contentful/Asset';
import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { ImageSchema } from '../../types/contentful/Image';

export const CtaBannerSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  description: z.string(),
  backgroundImage: AssetSchema,
  backgroundMedia: ImageSchema,
  primaryCta: ButtonSchema,
  secondaryCta: ButtonSchema,
  __typename: z.string().optional()
});

export type CtaBanner = z.infer<typeof CtaBannerSchema>;

export interface CtaBannerResponse {
  items: CtaBanner[];
}
