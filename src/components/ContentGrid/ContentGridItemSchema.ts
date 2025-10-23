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
  variant: z.string().optional(),
  heading: z.string(),
  subHeading: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ctaCollection: z
    .object({
      items: z.array(ButtonSchema)
    })
    .optional(),
  link: z.string().optional(),
  description: z.string().optional(),
  icon: AssetSchema.optional(),
  image: ImageSchema.optional(),
  __typename: z.string().optional()
});

export type ContentGridItem = z.infer<typeof ContentGridItemSchema>;
