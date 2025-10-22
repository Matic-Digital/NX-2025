import { z } from 'zod';

export const ServiceSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  cardImage: z.object({
    title: z.string().optional(),
    link: z.string().optional(),
    altText: z.string().optional()
  }).optional(),
  cardTitle: z.string().optional(),
  cardTags: z.array(z.string()).optional(),
  cardButtonText: z.string().optional(),
  __typename: z.string().optional()
});

export type Service = z.infer<typeof ServiceSchema>;

export interface ServiceResponse {
  items: Service[];
}
