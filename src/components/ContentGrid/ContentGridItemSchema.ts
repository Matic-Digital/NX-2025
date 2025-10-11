import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';

// Define the ContentGridItem schema
export const ContentGridItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  heading: z.string(),
  ctaCollection: z
    .object({
      items: z.array(ButtonSchema)
    })
    .optional(),
  description: z.string().optional(),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  variant: z.string().optional(),
  __typename: z.string().optional()
});

export type ContentGridItem = z.infer<typeof ContentGridItemSchema>;
