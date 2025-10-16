import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';

export const ServiceSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  cardImage: ImageSchema.optional(),
  cardTitle: z.string().optional(),
  cardTags: z.array(z.string()).optional(),
  cardButtonText: z.string(),
  __typename: z.string().optional()
});

export type Service = z.infer<typeof ServiceSchema>;

export interface ServiceResponse {
  items: Service[];
}
