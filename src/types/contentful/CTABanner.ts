import { z } from 'zod';
import { ButtonSchema } from './Button';

export const CtaBannerSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  description: z.string(),
  primaryCta: ButtonSchema,
  secondaryCta: ButtonSchema,
  __typename: z.string().optional()
});

export type CtaBanner = z.infer<typeof CtaBannerSchema>;

export interface CtaBannerResponse {
  items: CtaBanner[];
}
